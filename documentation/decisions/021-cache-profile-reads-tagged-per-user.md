# 021 · Cache profile reads on the server, tagged per user

**Date:** 2026-11-22
**Status:** Accepted
**Context:** A usage spike (from the one-off CSV backup) prompted the question of caching. Each signed-in page view read the profile from Firestore. The prototype had cached reads in a browser-side React context (PR #60).
**Decision:** Keep the prototype's ideas, but cache on the server:

- **The cache:** `getUserProfile` is a `'use cache'` function tagged `user:{uid}` with `cacheLife('hours')`. Any action that saves a profile clears the tag with `updateTag`.
- **Fresh reads for decisions:** decisions such as "send to setup?" confirm with a fresh read when the cached copy says no, because the default cache is per server instance.
- **A dev-only read log** (`logRead`) replaces the prototype's `log()`.
- **Skeleton loading states** for the dashboard and settings replace "Loading…" text.
  **Alternatives:** The prototype's browser context (doesn't fit server rendering; one copy per browser; went stale across people); `'use cache: remote'` (shared across instances, but costs money and adds latency, not needed at today's traffic); experimental `staleTimes` to keep pages in the browser (personal pages lingering in the browser conflicts with the shared-device rule); no caching (fine on cost today, but sets the wrong pattern for organizations and tools).
  **Consequences:** Signed-in browsing costs ~0 Firestore reads after the first page. A changed name or city can show stale on a different server instance for up to an hour. That's display only, never access. New data follows the convention in `technical/firebase.md` → "Caching reads in the rebuild".
