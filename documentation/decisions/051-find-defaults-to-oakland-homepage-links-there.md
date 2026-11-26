# 051 · /find starts from Oakland; the homepage's Browse button links there when signed out

**Date:** 2026-11-26
**Status:** Accepted
**Context:** After readable `/find` URLs went live ([049](049-readable-find-urls-city-in-the-path.md)), the user asked that the homepage's **Browse organizations** button take signed-out visitors to `/find/us/ca/oakland` and signed-in visitors to their own city. The default city had been San Francisco (the user's choice 2026-11-23).
**Decision:** The default city is now **Oakland** (`DEFAULT_PLACE`, GeoNames 5378538). Signed out, **Browse organizations** links to `/find/us/ca/oakland`. Signed in, it links to `/find`, which searches from the profile's city (or Oakland if the profile has none). Plain `/find` keeps its "starting point" note for the default city.
**Alternatives:** changing only the button and keeping San Francisco as `/find`'s default. Then the homepage and a bare `/find` link would start in different cities.
**Consequences:** Visitors who arrive from the homepage see Oakland in the URL and the page title, without the "starting point" note, because the city is in the URL as if they had chosen it. If that confuses people, the button can go back to plain `/find`, which now also starts in Oakland and keeps the note. Docs updated: [features/16](../features/16-organizations.md) → Finding organizations.
