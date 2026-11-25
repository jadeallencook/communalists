# 017 · Our own reset-password page at /auth/action

**Date:** 2026-11-21
**Status:** Accepted. Supersedes the hosted-page part of [#16](016-forgot-password-firebase-reset-email.md).
**Context:** Firebase's hosted reset page lives on `firebaseapp.com`, looks like Firebase, allows 6-character passwords, and leaves other sessions signed in. I pushed back on it, and the user agreed to build our own.
**Decision:** The console's Action URL points at `https://communalists.com/auth/action`. The proxy picks the locale from the link's `lang`. The page verifies the code, then asks for the new password twice, with sign-up's rules. Saving sets the password, **revokes every session**, and **signs the person in** on this device. Expired and used links show one "This link has expired" message with a way to request a new one. The page handles only `mode=resetPassword` for now.
**Alternatives:** Keep Firebase's page (no setup, but the problems above); a locale-prefixed Action URL (impossible, there's only one); making people sign in again after a reset (friction with no security gain).
**Consequences:** Someone must set the Action URL in the Firebase console, which changes the link in every Firebase auth email, so future email verification has to be handled on the same page. Preview deployments' emails link to production. Sign-up, sign-in, forgot-password and reset now share an `AuthCard` organism.
