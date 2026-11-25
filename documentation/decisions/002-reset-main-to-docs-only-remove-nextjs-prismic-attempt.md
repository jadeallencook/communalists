# 002 · Reset `main` to docs only, removing the Next.js + Prismic attempt

**Date:** 2026-11-20
**Status:** Accepted
**Context:** `main` held a second rebuild attempt (Next.js 15 + Prismic, 50 commits, Apr–Nov 2025) that covered only the public marketing shell. The docs had been written from the older prototype on another branch.
**Decision:** `main` holds only `AGENTS.md`, `CLAUDE.md` and `documentation/`. Both earlier codebases are removed from the working tree; their code stays in git history (prototype `7ebc168`, Next.js attempt `81eed51`).
**Alternatives:** Keep the Next.js app and add the docs next to it (keeps working pages, but carries over choices made before these docs existed).
**Consequences:** The rebuild starts from a blank slate. What the Next.js attempt taught is recorded in `technical/nextjs-prismic-attempt.md` and `features/15-little-free-library.md`. The framework choice is still open, though that attempt is evidence for Next.js + Prismic on the public side.
