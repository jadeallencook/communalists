# 059 · Umami reports on the admin dashboard

**Date:** 2026-11-27
**Status:** Accepted
**Context:** Deferred from [decision #58](058-super-user-dashboard-counts-search-and-missing-details.md) until there was an API key. The user created one and asked to use it on the super-user dashboard: which organizations people look at, which cities they search, and where research is needed.
**Decision:**

- A **Visitors** section on `/admin`, read on the server from Umami Cloud's API (`https://api.umami.is/v1`, `Authorization: Bearer`), with the key in `UMAMI_API_KEY` on Vercel Production only, marked Sensitive. It's read only in server code and never sent to the page or logged, because Umami keys can use almost the whole account, not just read.
- **Two calls per report**, cached for an hour: `stats` (visitors and page views for 30 days, compared with the period before), and `metrics?type=path` (page views per path). The most-viewed organizations and most-searched cities both come from page paths, with all languages added up. A failure isn't cached.
- **Cities with few results are worked out from today's directory**: for each searched city, how many local organizations `/find` shows within the default 25 miles, before filters. Under 3 is labeled **Needs research**. This needs no new event, works on searches already recorded, and the label clears as soon as organizations are added.

**Alternatives:** adding a result count to the `find-search` event and reading Umami's event data (the event-data response shape couldn't be confirmed, because the docs pages were missing, and it would only count searches from the deploy onward); linking to Umami's own dashboard only (no "needs research" signal next to the tools that fix it).
**Consequences:** Not yet checked against the live API: no key exists locally. Responses are checked with zod and an unexpected shape shows "Couldn't load", so check the section on production after deploying. Docs: [analytics](../technical/analytics.md#reports-on-admin), [features/18](../features/18-unclaimed-organizations.md#dashboard).
