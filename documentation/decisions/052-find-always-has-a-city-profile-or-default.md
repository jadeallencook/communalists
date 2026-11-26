# 052 · /find always has a city: plain /find redirects to the profile's city or San Francisco

**Date:** 2026-11-26
**Status:** Accepted (supersedes [051](051-find-defaults-to-oakland-homepage-links-there.md))
**Context:** After [051](051-find-defaults-to-oakland-homepage-links-there.md), signed-in visitors who pressed **Browse organizations** landed on plain `/en/find`. The user wanted the URL to show their city instead, and the default to be stored in one place, since it may change. They also chose San Francisco over Oakland as the default.
**Decision:**

- Plain `/find` **redirects** to a city path, keeping any filters: the signed-in visitor's profile city, otherwise `DEFAULT_PLACE` (San Francisco, `us/ca/san-francisco`). `startingCitySlug(uid)` in `src/lib/organizations/starting-city.ts` decides it.
- The homepage's **Browse organizations** links straight to the same path, so there's no redirect.
- The default lives only in `DEFAULT_PLACE` (`src/lib/organizations/directory.ts`). A test checks that its `slug` matches its `placeId`.
- The "starting point" note on `/find` is gone, along with its translations, because the default city is now in the URL like any other.

**Alternatives:** keeping plain `/find` as a page that searches from the profile's city without showing it (the old privacy choice from [026](026-find-organizations-page-distance-filters-in-url.md)); keeping the note via a flag in the URL (clutters shared links).
**Consequences:** A signed-in visitor's profile city now appears in their URL, page title and analytics (`find-search` used to send `"profile"`). It's a general area, and it's their own browser, but a link they share from `/find` now carries their city. Docs updated: [features/16](../features/16-organizations.md), [analytics](../technical/analytics.md), decisions 049 and 051.
