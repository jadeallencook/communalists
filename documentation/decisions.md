# Decision Log

Every meaningful product or technical choice made during the rebuild, newest first. Each entry records what we chose, what else we considered, and why, so a later change of direction starts from the full picture.

Add an entry when you choose a framework or library, change the data model, add or cut a feature, change a product rule, or go against something in these docs. If a decision replaces an earlier one, mark the old entry **Superseded by #N** rather than deleting it.

## Template

```md
### N. Short title — YYYY-MM-DD
**Status:** Accepted | Superseded by #N | Reverted
**Context:** What prompted this.
**Decision:** What we chose.
**Alternatives:** What else we considered, and why not.
**Consequences:** What this changes. Docs updated: …
```

## Decisions

### 2. Reset `main` to docs only, removing the Next.js + Prismic attempt — 2026-11-20

**Status:** Accepted
**Context:** `main` held a second rebuild attempt (Next.js 15 + Prismic, 50 commits, Apr–Nov 2025) that covered only the public marketing shell. The docs had been written from the older prototype on another branch.
**Decision:** `main` holds only `AGENTS.md`, `CLAUDE.md` and `documentation/`. Both earlier codebases are removed from the working tree; their code stays in git history (prototype `7ebc168`, Next.js attempt `81eed51`).
**Alternatives:** Keep the Next.js app and add the docs next to it (keeps working pages, but carries over choices made before these docs existed).
**Consequences:** The rebuild starts from a blank slate. What the Next.js attempt taught is recorded in `technical/nextjs-prismic-attempt.md` and `features/15-little-free-library.md`. The framework choice is still open, though that attempt is evidence for Next.js + Prismic on the public side.

### 1. Preserve prototype discovery as living docs — 2026-11-20

**Status:** Accepted
**Context:** The React + Firebase prototype has a lot of tech debt and is being deleted before a rebuild in Astro or Next.js.
**Decision:** Record every feature, technical insight and known bug in `documentation/`, export the hard-coded data to JSON, and keep these docs up to date as the rebuild changes direction (see the methodology in `AGENTS.md`).
**Alternatives:** Keep the old repo as the reference (slow to search, and it describes the old design only). Start fresh with no record (loses the lessons, such as Firestore read costs and the security gaps).
**Consequences:** Every change must update the matching doc. `CLAUDE.md` symlinks to `AGENTS.md` so every agent reads the same instructions.

### Open: Astro or Next.js

**Status:** Not decided
`technical/rebuild-plan.md` recommends Next.js because of the authenticated dashboard, with Astro as the better fit if the scope shrinks to a public directory. A 2025 attempt already used Next.js + Prismic ([nextjs-prismic-attempt.md](technical/nextjs-prismic-attempt.md)). Record the final choice here as the next entry.
