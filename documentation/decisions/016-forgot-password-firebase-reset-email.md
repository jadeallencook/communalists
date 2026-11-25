# 016 · Forgot password through Firebase's reset email and hosted page

**Date:** 2026-11-21
**Status:** Accepted. Hosted reset page superseded by [#17](017-reset-password-page-auth-action.md)
**Context:** Many returning users won't remember their passwords. The user asked for a forgot-password page.
**Decision:** `/{locale}/forgot-password` asks for an email, and a server action has Firebase send its password-reset email in the visitor's language. The link opens **Firebase's hosted reset page**, which then links back to our sign-in. Every request shows the same "Check your email" message, whether or not the account exists.
**Alternatives:** Our own `/reset-password` page that sets the password with the code (matching design, our 8-character rule, our domain; needs the console's Action URL changed for every auth email). Sending our own emails through a mail provider (full control over branding and deliverability, but another service to run).
**Consequences:** It works as soon as the production Firebase setup is done (authorized domain, templates). The reset step looks like Firebase, not Communalists, and allows 6-character passwords. Building the in-app page is the natural next step.
