# 053 · A dictionary: shareable definitions that super users manage

**Date:** 2026-11-26
**Status:** Accepted
**Context:** [Issue #140](https://github.com/jadeallencook/communalists/issues/140). Many visitors don't know words like "mutual aid" or "tenant union". Explaining them once, on a page anyone can share, helps every page and gives organizers a link to send. The issue settled most of the design (super users write, all four languages, no history, comments later, room for resources); the user chose the rest when phase 1 was built.
**Decision:**

- Words live in `definitions/{slug}` with text in all four languages, `related` slugs and typed `resources`, read through one schema that fills in defaults, so new sections never need a migration. Comments will be a subcollection.
- Public pages at `/define` and `/define/{slug}` (moved to `/dictionary` with A–Z letter pages the same day, [decision #57](057-dictionary-at-slash-dictionary-with-a-to-z-letters.md)); the slug is permanent and the same in every language.
- Super users add and edit on **their own page, `/admin/definitions`**, linked from `/admin` (the user's choice over a section on the already long `/admin`). Every save goes in `adminLog`. No deleting yet.
- Each language has a **short definition** (≤ 300 characters, for the page's lead and the tooltip on marked words) and an **optional longer explanation** for the page only (the user's choice over one text).
- **Many words at once come from a CSV import** on `/admin/definitions/import`, like the organization import: every row is checked first, words already in the dictionary are skipped (never overwritten), and each added word is logged. The user chose this over a command-line loader (`pnpm definitions:load`, built first and removed), which needed database credentials on someone's machine and left the site's cache stale for up to a day.
- **Starter words** (ten, machine-quality outside English, to be checked) are a CSV in `research/definitions/`, which git ignores (the user's choice): they're uploaded through the import. `pnpm seed` also loads any CSVs found there locally.
- Public pages render per request from a day-long cache, not at build time.

**Alternatives:** a section on `/admin` with dialogs (four languages × three fields is too big for a dialog); one definition text (simpler, but the popover would show long text); a CSV row overwriting an existing word (handy for bulk fixes, but a stale file could undo edits); committing the starter CSV (`research/definitions/` un-ignored; declined, so other contributors start with an empty local dictionary); prerendering `/define` (the build has no database access, and new words would need a deploy).
**Consequences:** `adminLog` now holds word changes as well as organization actions (`definition { slug, word }` instead of `orgName`). The footer links the dictionary. Marked words (`<Definition>`, [decision #55](055-marked-words-hover-tooltip-click-opens-page.md)) followed the same day; comments (phase 3) are designed in the feature doc. Docs updated: [features/19](../features/19-dictionary.md) (new), [features/18](../features/18-unclaimed-organizations.md), [data model](../technical/data-model.md), [analytics](../technical/analytics.md), [getting started](../getting-started.md), the docs index and `AGENTS.md`.
