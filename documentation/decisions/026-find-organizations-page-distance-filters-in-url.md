# 026 · Finding organizations: a public /find page, distance only, filters in the URL

**Date:** 2026-11-23
**Status:** Accepted
**Context:** Phase 2 starts with finding organizations ([features/16](../features/16-organizations.md)). The user asked for filters (radius, type, and so on), and whether the dashboard should show results too.
**Decision:**

- **A public `/find` page**, so people can find a group before making an account. Signed-in visitors start from their profile's city. The **dashboard** shows the 3 closest local groups you're not in, and links to `/find`.
- **Distance only:** a local group shows when it's **based** within the chosen distance (5–100 mi, 25 by default). Its own service radius isn't checked (the user's choice).
- **Filters:** distance, reach (local, national, international; all by default), focus areas and languages, each matching any chosen value. Results are grouped by reach.
- **Live and in the URL:** results follow each change, and the URL holds the search so it can be shared.
- **Reads:** cached per city (local, within 100 mi, by geohash range) and per country (national), plus one list of international groups, all tagged `directory`. Filtering is in memory.

**Alternatives:** signed-in only (hides groups from people deciding whether to sign up); checking each group's own radius as the docs first planned (fewer results; the user preferred showing everything nearby); an Apply button (one more step; live updates with a no-JavaScript fallback do both); querying per filter combination (a composite index per combination, the prototype's problem in `technical/firebase.md`); a search service like Algolia (cost and another system, not needed at this size).
**Consequences:** One cached read set per city searched from. Creating an organization clears `directory`, and so must anything later that changes how a group is listed (editing, archiving, visibility). Paging and moving filters into queries will be needed at thousands of groups per region. Docs updated: features/16, technical/data-model, AGENTS.
