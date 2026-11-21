# Accounts and Sessions

Anyone can create an account at `/{locale}/sign-up` with a name, email, password and general location. After sign-up they land on `/{locale}/welcome`. Built 2026-11-21 ([decision #12](../decisions.md)).

## Sign-up flow

```
SignUpForm (organism, presentational; works without JS)
  ← useSignUpForm(signUp)          src/hooks/use-sign-up-form.ts
  ← SignUpFormContainer            src/app/[locale]/sign-up/sign-up-form-container.tsx
  → server action signUp()            src/app/[locale]/sign-up/actions.ts
      1. validate with signUpSchema    src/lib/validation/sign-up.ts
      2. geocode the location          src/lib/geo/geocode.ts
      3. create the Firebase Auth user (Admin SDK)
      4. create users/{uid} profile    src/lib/users.ts
      5. sign in over Firebase's REST API → ID token
      6. exchange it for a session cookie (httpOnly)   src/lib/auth/session.ts
  → redirect to /{locale}/welcome
```

- **Order matters:** geocoding runs before the account exists, so a bad location never leaves a half-made user. If steps 4–6 fail, the Auth user is deleted, so the person can retry with the same email.
- **Errors are translation keys** (`SignUp.errors.*`), so the schema works in every locale. Field values are sent back on error so the form keeps them; the password never is.
- **Logs** record only error codes and messages, never names, emails or locations.

## Data

| Where                   | What                                                                          |
| ----------------------- | ----------------------------------------------------------------------------- |
| Firebase Auth           | Email, password, display name                                                 |
| Firestore `users/{uid}` | `displayName`, `location { label, lat, lng, geohash }`, `locale`, `createdAt` |

Firestore rules still deny all client access. The profile is read and written only through the Admin SDK.

## Location

- The visitor types a **city or ZIP code**. We store a **general area**: a label like "San Jose, California, United States" plus coordinates **rounded to 2 decimals (~1 km)**, and a `geohash` for later "organizations near you" radius queries (`geofire-common`). Never a street address.
- **Geocoder:** OpenStreetMap Nominatim (free; ~1 request/second; must identify the app in the `User-Agent`). Fine for sign-ups. **Don't use it for autocomplete**, and switch to a paid geocoder before high volume.
- **Postal codes repeat worldwide.** `95112` matched Klaipėda, Lithuania before San Jose. The action passes Vercel's `x-vercel-ip-country` header, so the search tries the visitor's country first, then worldwide. Running locally there's no such header, so a bare ZIP may resolve abroad; type a city.

## Sessions

- **Firebase session cookies:** `__session`, httpOnly, `SameSite=Lax`, `Secure` in production, 5 days. Verified with the Admin SDK on every read, **including a revocation check**.
- **Sign out** (`src/app/[locale]/welcome/actions.ts`) deletes the cookie and revokes the user's refresh tokens, so any copied cookie stops working. Revocation is checked to the second, so a cookie created and revoked within the same second can survive; that only happens in automated tests.
- **Next 16 rules:**
  - Anything that calls `getSessionUser()` reads cookies, so it must sit inside `<Suspense>` (a build error otherwise). The welcome page prerenders its shell and streams the user part.
  - `getSessionUser()` calls `connection()` first. Verifying a session reads the clock, and with `partialPrefetching` Next otherwise logs "encountered the unstable value `Date.now()` while prerendering".
  - Server actions can't read the `[locale]` root param, so forms send `locale` as a hidden field.

## Testing locally

Unit tests cover the schema and geocoding helpers (`pnpm test`). For end-to-end checks, run the emulators and a production build pointed at them:

```sh
pnpm emulators   # Auth + Firestore, project demo-communalists
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-communalists pnpm build
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 pnpm start
```

To stop a `next start` server, kill it by PID or port. The process renames itself to `next-server`, so `pkill -f "next start"` misses it.

Verified on 2026-11-21 against the emulators: validation errors, unknown place, success → welcome with session, duplicate email (case-insensitive), no session → redirect to sign-up, sign-out → cookie cleared and revoked.

## Not built yet

- Sign in (for returning users) and password reset
- Email verification
- Editing name/location, deleting an account
- Rate limiting / bot protection on sign-up (e.g. Turnstile)
