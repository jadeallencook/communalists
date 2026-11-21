# Rebuild Plan

> **Decided 2026-11-20:** Next.js App Router, Firebase (same project, emptied), Vercel, Tailwind + shadcn/ui, Firestore-backed services with an admin UI (no CMS), and `next-intl` locale routing from day one. See [decisions.md](../decisions.md) #3–#8. Where the options below differ from those decisions, the decisions win.

**Recommendation: Next.js (App Router).** About half of Communalists is an authenticated, data-heavy dashboard with mutations, modals and live-ish data. That is Next.js's home turf. Astro shines for content sites, and the public half is mostly content, but in Astro the dashboard would become one big React island with its own routing and data layer, which is roughly what this prototype already was.

Pick Astro instead if you shrink the scope to a public, multilingual directory (events, info and a request form), with volunteer coordination handled elsewhere.

A 2025 attempt already built the public shell in Next.js 15 + Prismic and moved from Tailwind to CSS modules. See [nextjs-prismic-attempt.md](nextjs-prismic-attempt.md) before you choose a CMS or styling approach. The Tailwind suggestion below predates that finding.

## Astro vs Next.js for this app

| Need                                                 | Next.js (App Router)                            | Astro                                                    |
| ---------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------- |
| Static, translated public pages (home, FAQ, events)  | SSG / ISR, `[locale]` segment                   | Best in class: zero-JS by default, built-in i18n routing |
| Events data editable without a deploy                | ISR or on-demand revalidation from DB/CMS       | Needs SSR mode or a rebuild hook                         |
| Auth-guarded dashboard                               | Middleware + server components + server actions | Middleware works; interactivity lives in islands         |
| Modal that is also a shareable page (request detail) | Parallel + intercepting routes, built in        | Hand-rolled                                              |
| Forms with server validation                         | Server actions + Zod                            | Astro Actions + Zod (good)                               |
| Realtime comments                                    | Client component + a subscription               | Island + a subscription                                  |
| Ecosystem for auth, i18n and tables                  | Largest                                         | Smaller, growing                                         |

## Target architecture

- **Next.js** App Router, TypeScript strict, deployed on Vercel or Firebase App Hosting.
- **Data:** either
  - _Stay on Firebase_ (no data migration; keep Auth). Then put the rules and indexes in the repo with emulator tests, and move writes into server actions using the Admin SDK so authorization lives in code.
  - _Or move to Postgres_ (Supabase or Neon + Drizzle). This uses the relational shape in [data-model.md](data-model.md). Row-level security covers org scoping, and SQL fixes the filter and search limits that shaped this prototype.
- **i18n:** `next-intl` with `/[locale]/…` routes (`en`, `es`, `vi`, `zh`). Import [`../data/translations.json`](../data/translations.json).
- **Forms:** React Hook Form (or plain server actions) + Zod, with the schema shared by client and server.
- **UI:** Tailwind + a headless kit (shadcn/ui). Keep the `#bc3737` + Albert Sans identity.
- **Content:** events/services in a DB table that organizers can edit, seeded from [`../data/events.json`](../data/events.json).

## Build order

1. **Before deleting the repo:** export the Firestore and RTDB data and **security rules**; copy `src/assets/` (including the uncommitted `star.svg`); note the production Firebase config and GA ID; push the branch so history (and these docs' file references) stays on GitHub.
2. Public shell: layout, nav, footer, locale routing, home + FAQ (with corrected copy).
3. Services directory from seeded data: day pagination, time and tag filters, open/closed computed in `America/Los_Angeles`. Add the "religious" filter.
4. Request form + donation ("offer") form as one `cases` write with `type`, using a server action, Zod validation, a rate limit / Turnstile, and the 90-day duplicate check.
5. The `request_form_open` setting (kill switch), read on the server.
6. Auth: sign up / in / out / reset, with the profile created on the server.
7. Organizations: list, request to join, approve **and reject**, member list, moderator role.
8. Case triage: server-paginated table, URL filters (stage, delivery, mine, language, location), search.
9. Case detail as an intercepted modal + full page: info, stage change, claim/unclaim (with authorization checks), copy link.
10. Activity feed: comments + system events, realtime.
11. Settings: display name, language, location.
12. Tests: unit tests for the old bug areas (filters, phone formatting, open/closed time), Playwright for request → triage → fulfil, and rules/RLS tests.

## Don't rebuild (unless there's new evidence)

Volunteer applications with bios and role checklists, dashboard chat, demographic fields (race, pronouns, country). All were cut for good reasons; see [14](../features/14-removed-experiments.md).
