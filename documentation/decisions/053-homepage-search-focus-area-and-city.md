# 053 · Homepage search: a focus-area tag box and a city, then "Connect with organizations"

**Date:** 2026-11-26
**Status:** Accepted
**Context:** The homepage banner had **Browse organizations** (to `/find` on the visitor's starting city, [052](052-find-always-has-a-city-profile-or-default.md)) and a second button: Create account, or **Go to your dashboard** when signed in. The user wanted visitors to be able to narrow the search before they land on `/find`, and the dashboard button gone, since the header already links there.
**Decision:**

- The banner holds a search panel (`HeroSearch`): a **Focus area** tag box (`FocusAreaField`), a **City** picker (the same `LocationField` as everywhere else) and **Connect with organizations**.
- Tags are the existing **focus areas**, not a new tag system, so `/find` already filters by them and nothing changes in the data. The box lists all of them, most common first; typing narrows the list (cmdk's fuzzy match), and only a listed focus area can be chosen. Typed text alone never searches. **One** at a time (the user's call); more can be added on `/find`.
- The city box starts on the profile's city. Signed out, or with no city, it's empty and says "Search location"; left empty, the button uses the starting city (San Francisco, `DEFAULT_PLACE`), exactly as the old button did.
- No second button for anyone: "Go to your dashboard" repeated the header link, and the user chose to drop Create account here too. Sign-up stays in the header and the "Ready to organize?" band.
- `homeSearchHref` (`src/lib/organizations/directory.ts`, tested) builds the link. Without JavaScript the form is a plain GET to `/find`, which redirects to the city's path.

**Alternatives:** a new tag list (finer-grained, but every group would need tags and `/find` and the data model would change); several tags (the user preferred one); keeping Create account beside the button for signed-out visitors (recommended, but declined: it's in the header and the closing band).
**Consequences:** Signed-out visitors no longer see a sign-up button above the fold except in the header. The fuzzy match catches typos but not synonyms ("groceries" doesn't find Food); keywords per focus area could be added later. Docs updated: [features/13](../features/13-navigation-and-layout.md), [features/16](../features/16-organizations.md), [accounts-and-sessions](../technical/accounts-and-sessions.md), [analytics](../technical/analytics.md).
