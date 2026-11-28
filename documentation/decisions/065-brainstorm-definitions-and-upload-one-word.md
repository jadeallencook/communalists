# 065 · Brainstorm definitions with a skill, and upload one word's text from a file

**Date:** 2026-11-27
**Status:** Accepted
**Context:** Rewriting the Mutual Aid Network definition with an agent worked well, but getting the result live meant retyping four languages into the edit form. The user asked for a skill to brainstorm definitions, an export of the agreed one, and a button on the super-user dashboard to upload it, updating everything except related words.
**Decision:**

- A `brainstorm-definition` skill (`.claude/skills/`) runs the conversation and, once the user agrees, writes the other languages and exports `research/definitions/updates/{slug}.csv`. It's git-ignored like the starter words, and in its own folder because `pnpm seed` loads every CSV in `research/definitions/` as a starter file (the user's choice over a committed `resources/` folder or the Desktop). The seed applies the updates folder over the starter words, text only.
- The file is the **import's columns with one row** (the user's choice over Markdown or JSON), so it reuses the CSV reader and the form's schema, and a word that doesn't exist yet can go through the import with the same file.
- **Upload a definition** on `/admin` opens `/admin/definitions/upload`: check the file, see each changed field now and new, then confirm (the user's choice over saving straight away). It replaces the text in all four languages; **related words and resources are never changed**. It refuses a word that doesn't exist.
- The save is refused if the word was saved after the check (compared by `updatedAt`), so an upload can't silently overwrite someone else's edit. Logged as `editDefinition` with `via: 'upload'`.
- `upload` joins `new` and `import` as reserved slugs.

**Alternatives:** letting the bulk import overwrite existing words (it skips them on purpose, so an old file can't undo edits; see [features/19](../features/19-dictionary.md)); pasting into the edit form (slow and error-prone across four languages); saving without a preview (a file for the wrong word would overwrite it unseen).
**Consequences:** Two ways to edit a word's text (the form, and an uploaded file); the form is still the only way to change related words. The translations an agent writes are machine-quality until fluent speakers check them. Docs updated: [features/19](../features/19-dictionary.md), [data-model](../technical/data-model.md), `AGENTS.md`.
