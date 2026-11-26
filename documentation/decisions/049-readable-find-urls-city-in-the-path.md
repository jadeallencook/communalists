# 049 · Readable /find URLs: the city in the path

**Date:** 2026-11-26
**Status:** Accepted
**Context:** A `/find` search lived in query parameters, like `/find?country=US&placeId=5378538&radius=50` ([026](026-find-organizations-page-distance-filters-in-url.md)). The user asked for readable links such as `/find/oakland/ca`, both for sharing and so analytics shows which cities people search ([050](050-umami-analytics-page-views-and-named-click-events.md)).
**Decision:** The city is in the path as **country, region, city**: `/en/find/us/ca/oakland`. Filters stay in the query (`?radius=10&focusAreas=food`).

- Slugs come from the GeoNames data (`src/lib/places/slug.ts`): lowercase, no accents or punctuation, words joined by dashes. When two places in one region share a name (1 case in 20,748 US places, St. Marys, Georgia), the more populous one gets the plain slug and the other gets its id added (`st-marys-4223413`), so every place has a path. The place search API returns each place's `slug`.
- `/find/[[...place]]` is one optional catch-all route. Old `?country=&placeId=` links, the filter form without JavaScript, other casing (`/find/US/CA/Oakland`) and partial paths (`/find/us`) redirect to the canonical URL. An unknown city or country is a 404.
- `/find` with no city works as before: the profile's city for signed-in visitors, otherwise the default city as a labelled starting point (Oakland since [051](051-find-defaults-to-oakland-homepage-links-there.md)). Neither goes in the URL until the visitor changes a filter.

**Alternatives:** `/find/oakland/ca` (the user's first example) and `/find/oakland-ca`. Both leave out the country, so `ca` would clash (California or Canada) once a second country is added, and links already shared would have to change. Broad-to-specific also leaves room for `/find/us/ca` to list a whole state later. The user chose `/find/us/ca/oakland`.
**Consequences:** Links are readable and the city shows up in analytics page paths. Old query links keep working through the redirect. Docs updated: [features/16](../features/16-organizations.md) → Finding organizations, [analytics](../technical/analytics.md).
