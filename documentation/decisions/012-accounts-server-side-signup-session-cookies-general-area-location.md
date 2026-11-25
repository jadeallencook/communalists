# 012 · Accounts: server-side sign-up, Firebase session cookies, general-area location

**Date:** 2026-11-21
**Status:** Accepted. Location part superseded by [#14](014-location-city-picker-not-geocoder.md); profile-at-sign-up superseded by [#18](018-sign-up-credentials-only-then-account-setup.md)
**Context:** Open sign-up (decision [#11](011-multi-organization-platform.md)). The user chose email + password; name, email and location on the form; a welcome page afterwards.
**Decision:** One server action validates (Zod), geocodes, creates the Firebase Auth user and a `users/{uid}` profile with the Admin SDK, then sets an httpOnly **Firebase session cookie**. Location is stored as a **general area**: a label plus coordinates rounded to ~1 km and a geohash. Geocoding uses **OpenStreetMap Nominatim**, biased to the visitor's country via `x-vercel-ip-country`.
**Alternatives:** Client-side Firebase sign-up with ID tokens in the browser (more JavaScript, harder to use the session in Server Components); a paid geocoder (Google, Mapbox) needing an API key; storing exact coordinates.
**Consequences:** Works without client JavaScript. Production needs `FIREBASE_SERVICE_ACCOUNT_KEY` and the `NEXT_PUBLIC_FIREBASE_*` variables, and the Email/Password provider enabled. Nominatim's usage policy rules out autocomplete. Details: `technical/accounts-and-sessions.md`.
