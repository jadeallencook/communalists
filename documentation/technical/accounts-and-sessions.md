# Accounts and Sessions

Anyone can create an account at `/{locale}/sign-up` with an email and a password (typed twice). Every account then answers the same required questions (name, preferred language, city) at `/{locale}/account/setup`. That includes new sign-ups, prototype accounts with no profile, and anyone missing a question we add later. Returning users sign in at `/{locale}/sign-in`. Anyone who forgot their password requests a link at `/{locale}/forgot-password` and chooses a new one at `/{locale}/auth/action`. Signed-in pages go through `requireAccount()`: signed out → sign-in; incomplete → setup. Built 2026-11-21 ([decisions #12, #15–#18](../decisions.md)).

## Sign-up flow

```
SignUpForm (organism, presentational; works without JS)
  ← useSignUpForm(signUp)          src/hooks/use-sign-up-form.ts
  ← SignUpFormContainer            src/app/[locale]/sign-up/sign-up-form-container.tsx
  → server action signUp()            src/app/[locale]/sign-up/actions.ts
      1. validate with signUpSchema    src/lib/validation/sign-up.ts (email, password, confirmPassword)
      2. create the Firebase Auth user (Admin SDK)
      3. sign in over Firebase's REST API → ID token
      4. exchange it for a session cookie (httpOnly)   src/lib/auth/session.ts
  → redirect to /{locale}/account/setup?next=/dashboard&from=sign-up
```

- **No profile yet.** `users/{uid}` is written by account setup, not sign-up, so new and old accounts take the same path.
- **Password twice:** `confirmPassword` is checked by the schema, never sent to Firebase or stored. Zod skips object-level checks once any field fails, so the mismatch check (`passwordsMatch` in `src/lib/validation/password.ts`, shared with reset) uses `when` to run alongside other field errors. It stays quiet if the password itself is already invalid.
- **Rollback:** if step 3 or 4 fails, the Auth user is deleted, so the person can retry with the same email.
- **Errors are translation keys** (`SignUp.errors.*`), so the schema works in every locale. The email is sent back on error so the form keeps it; the password never is.
- **Logs** record only error codes and messages, never names, emails or locations.

## Account setup

```
Signed-in page container → requireAccount(next)       src/lib/auth/require-account.ts
   no session         → /sign-in
   missingSetupSteps(profile) not empty → /account/setup?next=…   src/lib/account-setup.ts (pure, tested)
/{locale}/account/setup   AccountSetupForm ← useAccountSetupForm + useLocationPicker ← container
   complete already → redirect to next
   else: name (pre-filled from the profile, or the Auth user's displayName for prototype accounts),
         preferred language (pre-filled, else the UI language), city (pre-filled if saved)
  → saveAccountSetup(): validate (accountSetupSchema) → getPlace → saveUserProfile (merge) → redirect to next
```

- **Required today:** name, preferred language and city (`SETUP_STEPS`). Each step is "answered" when its field is present. **To add a required question,** add a step, define when it counts as answered, and add the field to the form. Accounts missing it are asked on their next visit, with no migration.
- **Not built yet:** optional questions ("Not now", remembered) and editing a profile. A complete account visiting `/account/setup` is sent on to `next`, so editing needs its own page.
- **Every signed-in page must call `requireAccount()`** in its container (inside `<Suspense>`), not just the dashboard. The check isn't in the proxy, because a Firestore read on every request would cost money and slow down every page.
- **`next` is sanitized** (`safeNextPath`, tested): it must be a path on this site, not `//host` or `/\host`, have no control characters, and not point back at setup. A locale prefix is stripped, because the redirect adds the current one. Both the page and the action sanitize it, since the action can be posted directly.
- **Preferred language ≠ UI language.** `profile.locale` is for emails and notifications. Saving setup doesn't switch the site's language.
- **Wording:** `from=sign-up` shows "Tell us about yourself"; anything else shows "Finish setting up your account". The parameter only changes the wording, so a hand-edited URL does no harm.
- **Prototype accounts:** about 103 Firebase Auth users from the prototype may still exist (Auth wasn't exported or wiped; [data-model](data-model.md#production-data-snapshot-2026-11-20)). Their profile data was deleted, and the user chose not to import it from the backup, so they're simply asked again after signing in.

## Sign-in flow

```
SignInForm (organism) ← useSignInForm(signIn) ← SignInFormContainer   src/app/[locale]/sign-in/
  → server action signIn()
      1. validate with signInSchema     src/lib/validation/sign-in.ts (email + "required" password only)
      2. sign in over Firebase's REST API → ID token   (same helper as sign-up)
      3. exchange it for a session cookie
  → redirect to /{locale}/dashboard
```

- **No account enumeration:** wrong password, unknown email and disabled account all show the same "That email and password don't match an account." (`signInErrorFor` maps Firebase's REST codes, tested.) Firebase's own throttling (`TOO_MANY_ATTEMPTS_TRY_LATER`) shows "Too many attempts".
- **No length rules on sign-in.** Length rules belong to sign-up only, so a future rule change can't lock out existing accounts.
- `signInWithPassword` throws `IdentityToolkitError` with the REST error code. Only unexpected codes are logged, never the email.

## Forgot and reset password

```
/{locale}/forgot-password   ForgotPasswordForm ← useForgotPasswordForm ← container
  → requestPasswordReset(): validate, then Firebase REST accounts:sendOobCode (PASSWORD_RESET)
      X-Firebase-Locale = UI locale (sets the email's language and the link's `lang`)
  → same page shows "Check your email"

Email link → Action URL https://communalists.com/auth/action?mode=resetPassword&oobCode=…&lang=es
  → src/proxy.ts redirects to /{lang}/auth/action (localeFromTag; unknown lang → normal detection)
  → page verifies the code (accounts:resetPassword without a password; doesn't use it up)
      valid           → "Choose a new password" for {email}: new password twice (same rules as sign-up)
      expired / used  → "This link has expired" + Request a new link
      no code / other mode → "This link doesn't work" + Request a new link
  → resetPassword(): set the password with the code → revoke every session (Admin SDK)
      → sign in with the new password → session cookie → /{locale}/dashboard
```

- **No account enumeration:** an unknown or disabled email gets the same "Check your email" as a real one (`forgotPasswordOutcome`, tested). Throttling (`RESET_PASSWORD_EXCEED_LIMIT`, `TOO_MANY_ATTEMPTS_TRY_LATER`) shows "Too many requests".
- **Signed in here, signed out everywhere else.** A reset often means someone else may have the account, or it's still open on a shared computer, so the action revokes all sessions before starting the new one. The form says so. Signing in automatically adds no risk: whoever has the link can already set the password.
- **One Action URL for every Firebase auth email.** `/auth/action` reads `mode` and handles only `resetPassword` today; any other mode shows "This link doesn't work". Email verification (`verifyEmail`) and email change (`recoverEmail`, `verifyAndChangeEmail`) belong on the same page when we add them.
- **Expired and used read the same.** Firebase reports a used code as `INVALID_OOB_CODE`, and clicking an old email twice is the usual cause (`linkProblemFor`, tested). If the code expires while the form is open, the form turns into the same message.
- **The URL holds a one-time code**, so the page is `noindex` and sends `Referrer-Policy: no-referrer`. Verifying on page load doesn't use the code up, so email link scanners that open links first don't break it.
- **Locale:** Firebase allows only one Action URL, so it can't include `/es/`. The proxy uses the link's `lang` instead.
- **Previews:** links always point at the production Action URL. To test locally, take the code from the emulator (`/emulator/v1/projects/demo-communalists/oobCodes`) and open `/en/auth/action?mode=resetPassword&oobCode=…` yourself.
- **Before the Action URL is set**, emails link to Firebase's hosted page instead. It still works and returns to our sign-in via `continueUrl`, but it accepts 6-character passwords and doesn't sign out other devices.
- **Unverified:** the emulator ignores `X-Firebase-Locale` (its links always say `lang=en`), so translated reset emails haven't been checked. Test once production Auth is set up.
- Shared REST plumbing lives in `src/lib/auth/identity-toolkit.ts` (`callIdentityToolkit`, `IdentityToolkitError` with the REST error code). The password rules (`newPasswordField`, `confirmPasswordField`, `passwordsMatch`) are shared by sign-up and reset in `src/lib/validation/password.ts`.

### Production setup (Firebase console)

1. **Authentication → Templates → Password reset → Edit → Customize action URL:** `https://communalists.com/auth/action`. This applies to every auth email template.
2. **Authentication → Settings → Authorized domains:** add `communalists.com`.
3. **Templates:** set the sender name (the default `noreply@communalists.firebaseapp.com` tends to land in spam).

## Data

| Where                   | What                                                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Firebase Auth           | Email, password (display name only on prototype accounts)                                                                                                                            |
| Firestore `users/{uid}` | `displayName`, `location { placeId, country, label, lat, lng, geohash }`, `locale` (preferred language), `createdAt`, `updatedAt`. All optional: a profile may be missing or partial |

Firestore rules still deny all client access. The profile is read and written only through the Admin SDK. `saveUserProfile` merges, and sets `createdAt` only when it creates the document.

## Location

See [decision #14](../decisions.md). The geocoder from #12 is gone.

- **Picker:** on the account-setup form, a country select (US only for now) plus a type-ahead city picker (`LocationField` molecule; state in `useLocationPicker`). `usePlaceSearch` waits ~200 ms after typing stops, calls `GET /api/places?country=US&q=…`, cancels stale requests, and keeps the last results visible while loading. The form submits `country` and `placeId` as hidden inputs.
- **Data:** GeoNames `cities500` (places with 500+ people), US only: 20,748 places in 50 states + DC, ~0.9 MB at `src/lib/places/data/us.json`. Neighborhoods, abandoned and historical places are excluded, and duplicate names within a state keep the most populous. Refresh or add a country with `scripts/build-places.mjs`. **License: CC BY 4.0, credited under the city field.**
- **Search** (`src/lib/places/search.ts`, pure, tested): accent-insensitive; exact name > name prefix > word prefix, ties by population; understands "springfield il" and "san jose, ca". 3–8 ms per query on the full dataset.
- **Trust:** the browser only sends an ID. The server looks it up and stores the label plus coordinates rounded to ~1 km and a `geohash` (`geofire-common`) for "near you" radius queries. Never a street address.
- **API:** `/api/places` is public and cacheable (`s-maxage` 1 day), returns at most 8 `{ id, label }`, needs 2+ characters, and returns 400 for unsupported countries.
- **Limits:** needs JavaScript (no-JS visitors can't pick a city, so they can't finish account setup). Places under 500 people aren't listed. City names aren't translated.

## Dashboard, settings and the header

- **`/{locale}/dashboard`** is the signed-in home (it was `/welcome`, which now redirects there; decision #20). Sign-in, account setup and password reset all land on it. For now it has a greeting, the user's area and an empty "Your organizations" state.
- **`/{locale}/account/settings`** edits name, preferred language and city with the setup form in `mode="settings"`. It shares the save logic with setup (`src/app/[locale]/account/save-profile.ts`), stays on the page and shows "Saved.". The email is shown read-only. Changing it, or the password, isn't built.
- **After a save, the action calls `refresh()`** (`next/cache`). A server action that only returns state doesn't re-render the layout, so the header kept the old name until the next navigation. Use `refresh()` in any action whose change shows outside its own form.
- **The header's account area reads the session on every page.** `HeaderNav` and `HeaderAccount` (`src/app/[locale]/header-slots.tsx`) run inside `<Suspense>` in the layout, so the rest of the header stays static and the right links stream in with no flash. Signed out, no cookie means no work. Signed in, each page view verifies the session (a Firebase Auth revocation lookup, which isn't a Firestore read). The profile comes from the server cache (`getUserProfile`: `'use cache'`, tag `user:{uid}`, up to an hour, cleared when it's saved), so browsing costs no Firestore reads after the first. Setup decisions use `getUserProfileFresh` instead; see [firebase.md → Caching reads](firebase.md#caching-reads-in-the-rebuild).
- **Before setup is finished,** the menu shows the email instead of a name, and Dashboard leads to setup (the `requireAccount` gate).
- **The homepage reads the session too,** only for its banner buttons and the closing sign-up band (`src/app/[locale]/page.tsx`). The banner always leads with Browse organizations; its second button is Create account (signed out) or "Go to your dashboard" (signed in), and signed in the band is left out. Two button-sized skeletons hold the banner steady while the session is checked.

## Sessions

- **Firebase session cookies:** `__session`, httpOnly, `SameSite=Lax`, `Secure` in production, 5 days. Verified with the Admin SDK on every read, **including a revocation check**.
- **Sign out** (`src/app/actions/sign-out.ts`, from the header's account menu) deletes the cookie and revokes the user's refresh tokens, so any copied cookie stops working. Revocation is checked to the second, so a cookie created and revoked within the same second can survive; that only happens in automated tests.
- **Next 16 rules:**
  - Anything that calls `getSessionUser()` reads cookies, so it must sit inside `<Suspense>` (a build error otherwise). The dashboard and settings prerender their shell and stream the user part; so does the header's account area (`src/app/[locale]/header-slots.tsx`).
  - `getSessionUser()` calls `connection()` first. Verifying a session reads the clock, and with `partialPrefetching` Next otherwise logs "encountered the unstable value `Date.now()` while prerendering".
  - Server actions can't read the `[locale]` root param, so forms send `locale` as a hidden field.

## Local development

Local dev **never uses the real Firebase project**. It runs against the emulators, so your production account doesn't exist locally. Use a seeded test account (`maya.thompson@example.com` / `password123`, [getting-started → Test data](../getting-started.md#test-data)) or sign up at `/en/sign-up`.

```sh
pnpm dev   # creates .env.local if needed, starts the emulators, then Next (tooling-and-ci.md → Setup)
```

Emulator data (test accounts, profiles) is kept in `.emulator-data/` (gitignored) between runs. Running `next dev` alone, without `.env.local` or the emulators, makes sign-in fail with "Something went wrong": the server has no project and no credentials. Pointing local dev at production would need a service-account key on the laptop, and local experiments would read and write real people's data, so we don't. Stop with Ctrl-C (not `kill`), or they won't save; see [tooling-and-ci](tooling-and-ci.md) for why the save only works through `scripts/dev.mjs`.

## Testing locally

Unit tests cover the schemas and place search (`pnpm test`). For end-to-end checks, run the emulators and a production build pointed at them:

```sh
pnpm emulators   # Auth + Firestore, project demo-communalists
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-communalists pnpm build
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 pnpm start
```

To stop a `next start` server, kill it by PID or port. The process renames itself to `next-server`, so `pkill -f "next start"` misses it.

When checking a page's HTML, match real values or element IDs (`Welcome, Ada!`, `id="placeId-trigger"`), not translated strings. The page's translation payload contains every message in its namespaces (`Welcome, {name}!`, `Choose your city`) even when they aren't rendered. Redirects from inside `<Suspense>` arrive in the stream (`NEXT_REDIRECT;replace;/en/…`), not as a `Location` header.

The Admin SDK logs a `MetadataLookupWarning` locally: Firestore asks Google's metadata server for credentials and waits a few seconds for it to time out. It's harmless with the emulators. `METADATA_SERVER_DETECTION=none` skips the lookup; `pnpm dev` (for Next) and `scripts/seed.mjs` set it. Running `pnpm dev:next` alone still shows the warning.

Verified on 2026-11-21 against the emulators (after sign-in): place API (results, cache headers, 400 for unsupported countries, nothing under 2 characters); mismatched passwords → "Passwords don't match" and no account created; no city → "Choose your city"; tampered place ID → "couldn't find that city"; success → welcome showing the chosen city; duplicate email (case-insensitive) rejected; no session → sign-in; sign-out revokes the cookie; sign-in with a wrong password and with an unknown email show the same message and keep the email; sign-in field errors; sign-in (email in a different case) → welcome with a working session; `/es/sign-in` translated and linked to sign-up. Forgot password: sign-in links to it; invalid email error; a known email (any case) records exactly one reset email with `continueUrl` back to sign-in; an unknown email shows the same confirmation and sends nothing; using the code sets the new password, which then signs in, and the old one is rejected. Reset page (2026-11-21): `/auth/action?lang=es` → `/es/auth/action` (and `zh-CN` → `zh`; unsupported `lang` falls back to `Accept-Language`); no code or another mode → "doesn't work"; bogus code → "expired"; valid code → the form for that email, `noindex` and `no-referrer`, and loading the page doesn't use the code; mismatch and too-short errors; saving → welcome with a new session, another device's session is signed out, old password rejected, new one works; reusing the link → "expired" on load and on submit.

Verified again on 2026-11-21 after account setup:

- **Sign-up:** has no name or city fields; mismatch and duplicate-email (any case) errors work; success goes to `/account/setup?next=/welcome&from=sign-up` with a session.
- **Setup:** "Tell us about yourself" wording, with English preselected. The welcome page redirects here until setup is done. Required-field, city and tampered-city errors work. Saving goes to `/welcome`, which shows the name and city. The profile has `locale=es` (preferred, while browsing in English), `createdAt` and `updatedAt`. A complete account visiting setup goes on to `/welcome`.
- **Prototype account** (Auth user with a display name, no profile): sign-in → welcome → setup with "Finish setting up" wording and the name pre-filled.
- **Partial profile** (name + language, no city): redirected to setup with the saved answers pre-filled. Saving merges and doesn't add `createdAt` to a document it didn't create.
- **`next`:** `https://evil.example` posted to the action and `//evil.example` in the URL both go to `/welcome`.
- **Signed out:** setup and welcome go to sign-in.
- **Re-run:** the forgot-password and reset-password suites still pass.

Verified again on 2026-11-22 after the navigation work, with a production build against the emulators:

- **Header, signed out:** Sign in + Create account on every page; on `/sign-in` and `/sign-up` the matching link is marked current (re-checked after the change from hiding it).
- **Homepage:** signed out, banner Create account + Sign in and the join band; signed in, only "Go to your dashboard" (also in Spanish) and no join band.
- **`/en/welcome`:** 308 to `/en/dashboard`. Settings signed out → sign-in.
- **Before setup:** the menu shows the email.
- **Dashboard:** greeting, area, empty state; the Dashboard link is marked current there and not on other pages.
- **Settings:** email, name, language and city pre-filled; empty name → error; saving changes the dashboard and the menu label; Spanish header and menu labels work.
- **Sign-in** lands on the dashboard.
- **In a real browser:** the menu opens with name and email, Account settings and Sign out. Saving settings updates the header right away (after the `refresh()` fix). Sign out from the menu returns home signed out.

Earlier record: place API (results, cache headers, 400 for unsupported countries, nothing under 2 characters); mismatched passwords → "Passwords don't match" and no account created; no city → "Choose your city"; tampered place ID → "couldn't find that city"; success → welcome showing the chosen city; duplicate email (case-insensitive) rejected; no session → sign-in; sign-out revokes the cookie; sign-in with a wrong password and with an unknown email show the same message and keep the email; sign-in field errors; sign-in (email in a different case) → welcome with a working session; `/es/sign-in` translated and linked to sign-up. Forgot password: sign-in links to it; invalid email error; a known email (any case) records exactly one reset email with `continueUrl` back to sign-in; an unknown email shows the same confirmation and sends nothing; using the code sets the new password, which then signs in, and the old one is rejected. Reset page (2026-11-21): `/auth/action?lang=es` → `/es/auth/action` (and `zh-CN` → `zh`; unsupported `lang` falls back to `Accept-Language`); no code or another mode → "doesn't work"; bogus code → "expired"; valid code → the form for that email, `noindex` and `no-referrer`, and loading the page doesn't use the code; mismatch and too-short errors; saving → welcome with a new session, another device's session is signed out, old password rejected, new one works; reusing the link → "expired" on load and on submit.

## Not built yet

- Session-aware header (a "Sign in" / account link); today the homepage hero and the two auth pages link to each other
- Redirecting already-signed-in visitors away from `/sign-in` and `/sign-up` (the header already hides those links for them)
- Email verification
- Changing email or password from settings, deleting an account
- Optional setup questions with "Not now"
- Rate limiting / bot protection on sign-up (e.g. Turnstile)
