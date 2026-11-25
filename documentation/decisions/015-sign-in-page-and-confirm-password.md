# 015 · Sign-in page and confirm-password on sign-up

**Date:** 2026-11-21
**Status:** Accepted
**Context:** The user asked for the password to be entered twice at sign-up, and for a sign-in page.
**Decision:** Sign-up adds a `confirmPassword` field, compared by the shared schema (never stored). Sign-in lives at `/{locale}/sign-in` (labelled "Sign in", to pair with "Sign out"): a server action that signs in over Firebase's REST API and sets the same session cookie as sign-up. Wrong email and wrong password show one shared message. Signed-out visits to `/welcome` now go to sign-in.
**Alternatives:** A show-password toggle instead of typing twice (less friction, but the user asked for two fields); client-side Firebase sign-in (more JavaScript, and it would split session handling); separate "no account with that email" message (reveals who has an account).
**Consequences:** Both auth forms work without JavaScript. Password reset, a session-aware header and redirecting signed-in visitors away from the auth pages are still to do (`technical/accounts-and-sessions.md`).
