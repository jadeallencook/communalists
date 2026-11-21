# Accounts and Sessions

Anyone can create an account at `/{locale}/sign-up` with a name, email, password (typed twice) and their city (picked from a list). Returning users sign in at `/{locale}/sign-in`. Anyone who forgot their password requests a link at `/{locale}/forgot-password` and chooses a new one at `/{locale}/auth/action`. Both land on `/{locale}/welcome`, and a signed-out visit to `/welcome` goes to sign-in. Built 2026-11-21 ([decisions #12, #15, #16 and #17](../decisions.md)).

## Sign-up flow

```
SignUpForm (organism, presentational; works without JS)
  ← useSignUpForm(signUp)          src/hooks/use-sign-up-form.ts
  ← SignUpFormContainer            src/app/[locale]/sign-up/sign-up-form-container.tsx
  → server action signUp()            src/app/[locale]/sign-up/actions.ts
      1. validate with signUpSchema    src/lib/validation/sign-up.ts
      2. look up the chosen place      src/lib/places (getPlace)
      3. create the Firebase Auth user (Admin SDK)
      4. create users/{uid} profile    src/lib/users.ts
      5. sign in over Firebase's REST API → ID token
      6. exchange it for a session cookie (httpOnly)   src/lib/auth/session.ts
  → redirect to /{locale}/welcome
```

- **Password twice:** `confirmPassword` is checked by the schema, never sent to Firebase or stored. Zod skips object-level checks once any field fails, so the mismatch check uses `when` to run alongside other field errors; it stays quiet if the password itself is already invalid.
- **Order matters:** the place lookup runs before the account exists, so a bad place ID never leaves a half-made user. If steps 4–6 fail, the Auth user is deleted, so the person can retry with the same email.
- **Errors are translation keys** (`SignUp.errors.*`), so the schema works in every locale. Field values are sent back on error so the form keeps them; the password never is.
- **Logs** record only error codes and messages, never names, emails or locations.

## Sign-in flow

```
SignInForm (organism) ← useSignInForm(signIn) ← SignInFormContainer   src/app/[locale]/sign-in/
  → server action signIn()
      1. validate with signInSchema     src/lib/validation/sign-in.ts (email + "required" password only)
      2. sign in over Firebase's REST API → ID token   (same helper as sign-up)
      3. exchange it for a session cookie
  → redirect to /{locale}/welcome
```

- **No account enumeration:** wrong password, unknown email and disabled account all show the same "That email and password don't match an account." (`signInErrorFor` maps Firebase's REST codes, tested.) Firebase's own throttling (`TOO_MANY_ATTEMPTS_TRY_LATER`) shows "Too many attempts".
- **No length rules on sign-in.** Length rules belong to sign-up only, so a future rule change can't lock out existing accounts.
- `signInWithPassword` throws `PasswordSignInError` with the REST error code. Only unexpected codes are logged, never the email.

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
      → sign in with the new password → session cookie → /{locale}/welcome
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

| Where                   | What                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| Firebase Auth           | Email, password, display name                                                                   |
| Firestore `users/{uid}` | `displayName`, `location { placeId, country, label, lat, lng, geohash }`, `locale`, `createdAt` |

Firestore rules still deny all client access. The profile is read and written only through the Admin SDK.

## Location

See [decision #14](../decisions.md). The geocoder from #12 is gone.

- **Picker:** a country select (US only for now) plus a type-ahead city picker (`LocationField` molecule). `usePlaceSearch` waits ~200 ms after typing stops, calls `GET /api/places?country=US&q=…`, cancels stale requests, and keeps the last results visible while loading. The form submits `country` and `placeId` as hidden inputs.
- **Data:** GeoNames `cities500` (places with 500+ people), US only: 20,748 places in 50 states + DC, ~0.9 MB at `src/lib/places/data/us.json`. Neighborhoods, abandoned and historical places are excluded, and duplicate names within a state keep the most populous. Refresh or add a country with `scripts/build-places.mjs`. **License: CC BY 4.0, credited under the city field.**
- **Search** (`src/lib/places/search.ts`, pure, tested): accent-insensitive; exact name > name prefix > word prefix, ties by population; understands "springfield il" and "san jose, ca". 3–8 ms per query on the full dataset.
- **Trust:** the browser only sends an ID. The server looks it up and stores the label plus coordinates rounded to ~1 km and a `geohash` (`geofire-common`) for "near you" radius queries. Never a street address.
- **API:** `/api/places` is public and cacheable (`s-maxage` 1 day), returns at most 8 `{ id, label }`, needs 2+ characters, and returns 400 for unsupported countries.
- **Limits:** needs JavaScript (no-JS visitors can't pick a city). Places under 500 people aren't listed. City names aren't translated.

## Sessions

- **Firebase session cookies:** `__session`, httpOnly, `SameSite=Lax`, `Secure` in production, 5 days. Verified with the Admin SDK on every read, **including a revocation check**.
- **Sign out** (`src/app/[locale]/welcome/actions.ts`) deletes the cookie and revokes the user's refresh tokens, so any copied cookie stops working. Revocation is checked to the second, so a cookie created and revoked within the same second can survive; that only happens in automated tests.
- **Next 16 rules:**
  - Anything that calls `getSessionUser()` reads cookies, so it must sit inside `<Suspense>` (a build error otherwise). The welcome page prerenders its shell and streams the user part.
  - `getSessionUser()` calls `connection()` first. Verifying a session reads the clock, and with `partialPrefetching` Next otherwise logs "encountered the unstable value `Date.now()` while prerendering".
  - Server actions can't read the `[locale]` root param, so forms send `locale` as a hidden field.

## Testing locally

Unit tests cover the schema and place search (`pnpm test`). For end-to-end checks, run the emulators and a production build pointed at them:

```sh
pnpm emulators   # Auth + Firestore, project demo-communalists
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-communalists pnpm build
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 pnpm start
```

To stop a `next start` server, kill it by PID or port. The process renames itself to `next-server`, so `pkill -f "next start"` misses it.

When checking a page for signed-in text, match the real value (`Welcome, Ada!`), not the template: the page's translation payload contains `Welcome, {name}!` even when signed out.

The Admin SDK logs a `MetadataLookupWarning` locally (it looks for Google Cloud credentials). It's harmless with the emulators.

Verified on 2026-11-21 against the emulators (after sign-in): place API (results, cache headers, 400 for unsupported countries, nothing under 2 characters); mismatched passwords → "Passwords don't match" and no account created; no city → "Choose your city"; tampered place ID → "couldn't find that city"; success → welcome showing the chosen city; duplicate email (case-insensitive) rejected; no session → sign-in; sign-out revokes the cookie; sign-in with a wrong password and with an unknown email show the same message and keep the email; sign-in field errors; sign-in (email in a different case) → welcome with a working session; `/es/sign-in` translated and linked to sign-up. Forgot password: sign-in links to it; invalid email error; a known email (any case) records exactly one reset email with `continueUrl` back to sign-in; an unknown email shows the same confirmation and sends nothing; using the code sets the new password, which then signs in, and the old one is rejected. Reset page (2026-11-21): `/auth/action?lang=es` → `/es/auth/action` (and `zh-CN` → `zh`; unsupported `lang` falls back to `Accept-Language`); no code or another mode → "doesn't work"; bogus code → "expired"; valid code → the form for that email, `noindex` and `no-referrer`, and loading the page doesn't use the code; mismatch and too-short errors; saving → welcome with a new session, another device's session is signed out, old password rejected, new one works; reusing the link → "expired" on load and on submit.

## Not built yet

- Session-aware header (a "Sign in" / account link); today the homepage hero and the two auth pages link to each other
- Redirecting already-signed-in visitors away from `/sign-in` and `/sign-up`; a page for returning users (they land on the sign-up welcome page, which says "Your account is ready")
- Email verification
- Editing name/location, deleting an account
- Rate limiting / bot protection on sign-up (e.g. Turnstile)
