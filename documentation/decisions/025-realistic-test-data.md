# 025 · Realistic test data

**Date:** 2026-11-23
**Status:** Accepted
**Context:** The seeded accounts were "Comrade One" and "Comrade Two" (`comrade1@communalists.com`…), and groups had one or two members, so pages didn't look like real use. The user asked for more realistic placeholders.
**Decision:**

- Realistic names and matching emails on `example.com` (reserved, can never reach anyone): Maya Thompson (owner, English), Luis Hernández (owner, Spanish), Sam Rivera (no profile, for account setup). They're marked `"featured": true` and listed first in the toolbar.
- Eight more accounts across all four UI languages fill member lists (3–8 members per group). They're one click away too, under a collapsed **More accounts** in the toolbar. Each line lists owned groups first, because the toolbar cuts lines short.
- Four more organizations (8 in all) covering more focus areas, cities, radii and languages.
- The seed now removes seeded accounts and organizations (ids starting `seed-`) that are no longer in the file, so renaming test data doesn't leave the old copies behind.

**Alternatives:** Keeping the `comrade1@communalists.com` emails (easy to type, but the toolbar makes typing rare, and `communalists.com` is a real domain); listing every account at the same level (too long to scan); leaving the extra accounts out of the toolbar (first version; the user wanted them one click away too); generated fake data with a library like Faker (a dependency, and random names change between runs, which makes bugs harder to describe).
**Consequences:** The old `seed-comrade*` accounts are removed on the next start of `pnpm dev`, which signs out anyone signed in as them. Docs updated: getting-started, README, technical/accounts-and-sessions, technical/tooling-and-ci.
