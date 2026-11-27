# 061 · Site navigation: sections from one list, and a phone menu drawer

**Date:** 2026-11-27
**Status:** Accepted
**Context:** The header only knew about sign-in: Sign in / Create account, or Dashboard and the account menu. `/find` was linked only from the homepage banner and the dictionary only from the footer, and more features are coming. Decision #20 had skipped a phone drawer "while the header has so few links".
**Decision:**

- Two levels of navigation. The site header lists platform sections. Tools that belong to one organization will get that organization's own navigation, not header links.
- The sections are one list in `src/lib/navigation.ts` (key, link, audience, the paths that belong to it), used by both layouts. Today: Organizations (`/find`), Dictionary, and Dashboard when signed in.
- Wide screens (`lg` and up) show the sections beside the wordmark. Below `lg`, a Menu button (icon and word) opens a drawer (shadcn `sheet`, a Radix dialog) with the sections, the person's organizations, account links, theme and sign-out. The language switcher stays in the header on every width.
- Signed in, the account menu and drawer list up to 5 of the person's organizations, then "See all" to the dashboard. Super users get an Admin link.
- The link to `/find` is called **Organizations**: it says what's there and matches "Browse organizations".

**Alternatives:** A bottom tab bar (fast with a thumb, but holds 4–5 items and takes height on every page). Keeping links inline with a "More" dropdown (least change, but cramped at 200% zoom and in Spanish or Vietnamese). Putting the language switcher in the drawer (cleaner bar, but someone who can't read the current language couldn't find it). Leaving organizations off the menu (no extra read, but the dashboard stays the only way to reach your groups). Labels "Find" or "Browse" (vaguer).
**Consequences:** Signed-in pages read the person's memberships for the menu; the read is cached per user and cleared by the actions that change memberships, and a failed read hides the list instead of breaking the page. New `nav-link` and `menu-open` analytics events. The `sheet` atom is installed and edited (translated close label, no motion with reduced motion). Docs updated: `features/13-navigation-and-layout.md`, `technical/accessibility.md`, `technical/analytics.md`, `technical/design-system.md`.
