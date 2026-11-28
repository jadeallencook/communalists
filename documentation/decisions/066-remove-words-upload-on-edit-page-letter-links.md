# 066 · Remove dictionary words, upload a word's file on its edit page, and link to the previous and next letter

**Date:** 2026-11-27
**Status:** Accepted
**Context:** While rewriting words with the `brainstorm-definition` skill, the user found three gaps: "Owner" only describes a platform role and should go, but there was no way to remove a word; uploading a reworked word meant leaving its edit page for `/admin/definitions/upload`; and a letter's page had no way on to the next letter.
**Decision:**

- **Removing a word** is a hard delete, from **Remove this word** on its edit page, after a confirmation that says what happens (its page stops working, it's taken off other words' related words, marked words become plain text, no undo). The same transaction removes its slug from every other word's `related`, and the `deleteDefinition` log entry keeps a copy of its text, related words and resources, so it can be put back by hand (the user's choice).
- **Upload on the edit page:** the same check → changes → confirm steps, built into `/admin/definitions/{slug}` as **Replace from a file**, accepting only that word's file (checked on the server, on check and on save). The upload page and the edit page share one component, `DefinitionUpload` (the user's choice).
- **Letter links:** under a letter's words, **Previous letter** and **Next letter** go to the nearest letters with words, skipping empty ones, with no wrapping from Z to A (the user's choice).

**Alternatives:** archiving words with a Restore button (safer, but every read and the list would need to filter them; the log's copy covers mistakes); a link from the edit page to the upload page (one extra click, less code); linking every letter, empty ones included.
**Consequences:** A removed word's old links show "not found". Locally, `pnpm seed` brings it back while it's still in a starter CSV. The dashboard's "Words" count and feed include removals. Docs updated: [features/19](../features/19-dictionary.md), [data-model](../technical/data-model.md).
