# 024 · Local dev toolbar with one-click test sign-in, and test data that's always there

**Date:** 2026-11-23
**Status:** Accepted
**Context:** Testing roles meant signing out and typing a test account's email and password each time. The user asked for one-click sign-in in a toolbar like Next's dev indicator, holding our own local-only tools. Earlier the same day, a half-finished seed left a test account without its profile, and `pnpm dev` only seeded on a brand-new setup.
**Decision:**

- A **Dev** button in a corner of every page, in local development only. It holds: sign in as a seeded account, then open the dashboard; reset test data (`pnpm seed` plus clearing the cached reads it changed); a link to the emulator UI; and a corner picker. The default corner is bottom right (Next's button is bottom left), and the choice is remembered per browser.
- **Guard in depth:** the toolbar renders only when `isLocalDev` is true (`next dev`, emulators, a `demo-` project, not Vercel, no service-account key), and each action checks it again. Sign-in accepts only the seeded emails.
- Test data lives in `scripts/seed-data.json`, shared by the seed script and the toolbar. `pnpm dev` checks at every start and seeds only if something is missing. Resetting doesn't sign anyone out.
- The toolbar is English only and isn't in the message files: only developers see it.

**Alternatives:** Adding items to Next's own dev menu (Next has no API for that); a separate dev route like `/dev/sign-in` (another public URL to guard, and less handy than a menu on every page); only hiding the button in production (server actions can be called directly by ID, so the action itself must refuse); translating it (no visitor ever sees it); seeding only on a brand-new setup (missed existing setups and half-finished seeds).
**Consequences:** Every new dev tool must call `assertLocalDev()` in its action. `pnpm dev` also starts Next with `METADATA_SERVER_DETECTION=none`, which removes the `MetadataLookupWarning` and a few seconds of delay. Docs updated: getting-started, technical/tooling-and-ci, technical/accounts-and-sessions, README, AGENTS.
