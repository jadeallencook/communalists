# 001 · Preserve prototype discovery as living docs

**Date:** 2026-11-20
**Status:** Accepted
**Context:** The React + Firebase prototype has a lot of tech debt and is being deleted before a rebuild in Astro or Next.js.
**Decision:** Record every feature, technical insight and known bug in `documentation/`, export the hard-coded data to JSON, and keep these docs up to date as the rebuild changes direction (see the methodology in `AGENTS.md`).
**Alternatives:** Keep the old repo as the reference (slow to search, and it describes the old design only). Start fresh with no record (loses the lessons, such as Firestore read costs and the security gaps).
**Consequences:** Every change must update the matching doc. `CLAUDE.md` symlinks to `AGENTS.md` so every agent reads the same instructions.
