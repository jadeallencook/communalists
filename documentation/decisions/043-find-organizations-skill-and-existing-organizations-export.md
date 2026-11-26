# 043 · find-organizations skill, and an export of existing organizations

**Date:** 2026-11-25
**Status:** Accepted
**Context:** The user wanted a skill that takes an area, searches it for organizations, and writes the findings into the import CSV (decision #40), which they'd then polish with `prepare-organizations-csv` and upload as a super user. Two problems: the agent couldn't tell which organizations were already on Communalists, so it could spend research on rows the import would refuse; and mechanical work (listing an area's cities, checking for repeats, checking rows) was costing tokens. The user suggested Python helper tools.
**Decision:**

- **A super-user export.** `/admin/import` → **Download organizations already on Communalists** (`GET /api/admin/organizations`). It's a CSV of every organization (listed, unlisted, unclaimed, and archived) with only the organization's details: name, handle, status, claim status, visibility, place, website, phone, contact email and socials. Super users only (a plain 404 for anyone else), `no-store`, one fresh read per organization, and a `exportOrganizations` entry in `adminLog`. Cells that a spreadsheet would run as a formula are prefixed with `'`. The user saves it in `research/organizations/` (git-ignored) for the skill.
- **A `find-organizations` skill** (`.claude/skills/find-organizations/`). It covers discovery only: it lists the area's cities, gathers candidates cheaply, drops the known ones, researches the rest and checks the file. For every row it follows `prepare-organizations-csv`, which stays the one source of column and research rules. It keeps a per-area `rejected.csv`, so groups looked at and left out (closed, inactive, a business) aren't researched again.
- **Helpers in TypeScript, run with `tsx`** (new dev dependency): `pnpm orgs:area`, `pnpm orgs:known`, `pnpm orgs:check`. They import the app's own code: the place data, the import's row checks and messages (`import.ts`), and the new matching in `src/lib/organizations/existing.ts` (tested). Matching is looser than the import's exact name-or-website check: website, social account, folded name or phone, and "maybe" for a similar name.
- **Archived matches are never re-added:** an archived organization may have been taken down at the group's own request.

**Alternatives:**

- **Reading production Firestore from a script** with the user's Google credentials. It's always current and automatic, but it puts admin access that bypasses security rules into a dev tool, against keeping super-user powers narrow (features/18).
- **Reading the public `/find` directory.** It needs no new code, but it misses unlisted and archived organizations and depends on page markup.
- **Python helpers** (the user's first idea). They would need Python on every machine and a second copy of the import's rules, which would drift. The user chose Node.
- **No offline check, or a lighter one.** That leaves rule problems to the upload, or misses rules only the real code applies.
- **One merged skill, or two fully separate ones.** Merged, it gets long, and the user wants to use them separately. Fully separate, the column rules would live in two places.

**Consequences:** One manual step per run: a super user downloads a fresh export (the skill asks when there's none or it's over 7 days old). Each download costs one read per organization, which is fine at today's size. Revisit if there are thousands, for example by filtering by state. The export holds unlisted organizations' details on a laptop, so `research/` is git-ignored and the page says to keep it private. `prepare-organizations-csv` no longer claims "researching an area" and now checks files with `pnpm orgs:check`. Docs updated: features/18, technical/data-model, technical/tooling-and-ci, AGENTS.md, both skills.
