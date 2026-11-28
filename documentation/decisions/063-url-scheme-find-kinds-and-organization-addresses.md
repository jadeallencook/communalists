# 063 · URL scheme: /find/{kind}, /organization/{handle}, and tools under the organization

**Date:** 2026-11-27
**Status:** Accepted. Changes the addresses in [#22](022-organizations-design-handles-roles-limits.md) (`/org/{handle}`) and [#49](049-readable-find-urls-city-in-the-path.md) (`/find/{country}/{region}/{city}`).
**Context:** `/find` only searched organizations, but the user wants to find comrades and events later, and other things after that. They also wanted `/organization/{handle}` instead of the short `/org/{handle}`, with old links still working and only the new addresses used on the site. Events aren't built yet, but they shouldn't need another URL change when they are.
**Decision:**

- **Searches are `/find/{kind}/…`**: `/find/organizations/us/mi/tawas-city` today, and later `/find/comrades/…` and `/find/events/…`. Each kind is its own route (`src/app/[locale]/find/{kind}/`), and **what follows the kind is up to that kind**. Organizations, comrades and events are all searched from a place, but a future kind (lending library items, dictionary words) may not be, and events will want dates. The kinds are listed in `FIND_KINDS` (`src/lib/paths.ts`).
- **Plural for a list, singular for one item**: `/find/organizations`, but `/organization/{handle}` and `/comrade/{username}` (unchanged).
- **Tools live under their organization**: `/organization/{handle}/events/{slug}`, `/organization/{handle}/requests`, `/organization/{handle}/library`. Every piece of tool data belongs to exactly one organization (the multi-tenant rule), so the URL matches how access is checked (organization, then membership). Slugs only need to be unique within one organization, and a later subdomain (`{handle}.communalists.com`) simply replaces `/organization/{handle}`. Nothing is built for events yet.
- **One place for URL shapes**: `src/lib/paths.ts` (`organizationPath`, `NEW_ORGANIZATION_PATH`, `findPath`). Links, redirects and `requireAccount(next)` use it instead of spelling paths by hand.
- **Old addresses redirect permanently** (`next.config.ts`, 308), keeping the query string: `/org/…` → `/organization/…`, and `/find/{country}/…` → `/find/organizations/{country}/…`. The old search is recognised by the two-letter country code after `/find`; no kind is two letters (a test checks), so old and new can't be confused. These redirects stay: groups print flyers and QR codes, and those last for years. Plain `/find` redirects to `/find/organizations` **temporarily** (307), since it may become a page for choosing what to find once there's a second kind.
- **Reserved handles** gain `organization`, `organizations`, `event` and `events` (the export of 2026-11-26 had no organization using them).
- **Analytics reports count both** the old and new paths, so the admin dashboard's most-viewed organizations and most-searched cities don't drop to zero on the day of the change.
- **URL words are English in every language** (`/es/find/organizations/…`, not `/es/buscar/organizaciones/…`).

**Alternatives:**

- `/events/{handle}/{slug}` at the top level (the user's first example). It would be a second way into one organization's data, outside the organization's own address and its access checks. The user chose nesting under the organization.
- One `/find/[kind]/[[...rest]]` route for all kinds. It would force every kind to share one URL shape and one page; separate routes per kind cost nothing.
- Keeping `/org/` as the address. It's shorter, but `/organization/` is clearer and matches the nav label.
- Translated URL words. Four route trees and analytics split four ways, for little benefit.
- Redirecting old links "for now" only. They cost almost nothing to keep, and printed links can't be updated.

**Consequences:** Every link on the site uses the new addresses. Old links keep working through one redirect (two for a locale-less `/find`, which goes through the locale redirect first). Docs updated: [features/16](../features/16-organizations.md) (addresses, routes, finding), [features/13](../features/13-navigation-and-layout.md), [features/18](../features/18-unclaimed-organizations.md), [analytics](../technical/analytics.md), [architecture](../technical/architecture.md), [accessibility](../technical/accessibility.md), [getting-started](../getting-started.md), [product-vision](../product-vision.md), `AGENTS.md`, and the `prepare-organizations-csv` skill.
