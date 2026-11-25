# 020 · Session-aware header, /dashboard, and account settings

**Date:** 2026-11-22
**Status:** Accepted
**Context:** The header had no way to sign in or see your account. There are no services (organization tools) yet. Signed-in users landed on a one-time `/welcome` page.
**Decision:** The header's account area is rendered on the server and streamed in `<Suspense>`, so it shows the right links without a flash.

- **Signed out:** "Sign in" and a "Create account" button, always shown so the header doesn't shift; the one for the current page is marked active. Create account is hidden on phones. (Hiding each on its own page was tried first; the user found the disappearing button confusing.)
- **Homepage:** signed in, the banner shows one "Go to your dashboard" button and the closing "Ready to organize?" sign-up band is left out. Both stream in like the header, so signed-in users never see sign-up buttons flash.
- **Signed in:** a "Dashboard" link (the place services will join later), plus an account menu under the user's initials with name and email, Account settings and Sign out. On phones, Dashboard moves into the menu.
- **`/welcome` became `/dashboard`,** the signed-in home; the old URL redirects (308), and every flow lands on the dashboard.
- **`/account/settings`** edits name, language and city with the setup form.
  **Alternatives:** Everything inside one menu (cleaner header, but Dashboard is a click further); keeping `/welcome` beside a new dashboard; leaving settings out until email and password changes exist; a client-side session check (flash of wrong links, more JavaScript).
  **Consequences:** Every page view by a signed-in user verifies the session and reads the profile once, shared with the page through React `cache()`. Settings actions call `refresh()` so the header updates immediately. Sign-out lives in the menu, so it now needs JavaScript (the menu does). Signed-in visitors can still open `/sign-in` and `/sign-up` directly. The homepage is no longer fully static: its buttons depend on the session.
