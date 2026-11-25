# 038 · Nearby organizations on each organization's page

**Date:** 2026-11-24
**Status:** Accepted
**Context:** With only a few organizations so far, the user wanted each organization's page to point people to other groups nearby.
**Decision:** At the end of an organization's page, show up to **4** other **local**, listed groups based within **50 mi** of its city, closest first, each linking to its page, plus a link to `/find` from that city at 50 mi. Hidden when there are none. It reuses `getDirectoryLocal` (cached per city, tagged `directory`), so it costs no extra reads where `/find` or the dashboard already looked.
**Alternatives:** Matching on focus areas too (more relevant later, but with few groups it would often show nothing); including nationwide and international groups (they aren't "nearby"); a bigger radius or more cards (the user chose 50 mi and 4); showing the section with an empty message (just noise on the page).
**Consequences:** When there are many groups per city, consider preferring groups with a shared focus area. Docs updated: features/16.
