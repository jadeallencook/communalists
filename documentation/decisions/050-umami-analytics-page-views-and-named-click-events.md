# 050 · Umami analytics: page views and named click events

**Date:** 2026-11-26
**Status:** Accepted
**Context:** The user created an Umami Cloud site for communalists.com and wanted to track page views, which organizations people visit, and which buttons they press, including the details (which organization someone tries to join, which website they open).
**Decision:** See [technical/analytics.md](../technical/analytics.md).

- **Umami Cloud**, loaded on the production deployment only (`VERCEL_ENV`, plus `data-domains`), respecting Do Not Track.
- **Named click events** with stable keys and data (`org-join` with the org's handle and join policy, `org-website` with the URL…), listed in one typed catalog. The user picked this over reporting every click automatically, which would be noisy, would change name with translations, and could pick up user-written text.
- **Our own click listener** reads `data-analytics-*` attributes, so presentational components only add attributes (`track()`), and client-side navigation isn't affected. Umami's `data-umami-event` was rejected because it turns `<Link>` clicks into full page loads.
- **Privacy filter on everything sent:** no page views from `/auth/action` (one-time codes) or `/admin`. Query parameters are an allowlist (only `/find`'s filters), with no hash, and other sites' referrers lose their query. The user asked to strip sensitive data but keep searched locations, which [049](049-readable-find-urls-city-in-the-path.md) puts in the path. A profile's city is never sent by name.

**Alternatives:** Vercel Web Analytics (the user had already set up Umami); a denylist of sensitive parameters (fails open when a new parameter is added); sending outcomes from server actions (more accurate, but needs Umami's server API. Clicks answer "what are people trying to do", and Firestore already holds the outcomes).
**Consequences:** Clicks are attempts, not outcomes. Each `/find` filter change is also a page view. New events need an entry in the catalog and the doc's table. Docs updated: [technical/analytics.md](../technical/analytics.md) (new), [deployment](../technical/deployment.md), [architecture](../technical/architecture.md), `AGENTS.md`.
