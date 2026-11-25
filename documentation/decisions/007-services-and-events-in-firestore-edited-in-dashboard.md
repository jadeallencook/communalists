# 007 · Services and events in Firestore, edited in the dashboard

**Date:** 2026-11-20
**Status:** Accepted
**Context:** The prototype hard-coded events (every change needed a deploy). The 2025 attempt used Prismic for page content.
**Decision:** Services/events live in Firestore and are edited by moderators through an admin UI in the dashboard. Page copy and the FAQ live in the repo as translations. **No CMS.**
**Alternatives:** Prismic (a second data source to pay for and sync), repo-only content (needs a PR for every schedule change).
**Consequences:** The admin UI must exist before organizers can edit services. Until then, seed from `data/events.json`. Supersedes the Prismic approach in `technical/nextjs-prismic-attempt.md`.
