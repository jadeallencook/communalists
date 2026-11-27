# 057 · The dictionary at /dictionary, with A–Z letter pages

**Date:** 2026-11-26
**Status:** Accepted
**Context:** The user asked for a letter bar to jump to words, with a page per letter (`/dictionary/a`), and to move the dictionary from `/define` to `/dictionary`.
**Decision:**

- Letter pages at `/dictionary/{letter}` (a–z), and word pages moved to `/dictionary/{slug}` too (the user's choice), served by one route: letters are one character and slugs at least two, so they can't clash. `/dictionary` redirects to `/dictionary/a` (temporarily, in case the start changes). `/define` and `/define/{slug}` redirect permanently, with or without a locale, so shared links keep working (`next.config.ts`).
- A word goes under the first letter of its word **in the UI language**, without accents. Chinese words go under their **pinyin initial** (the user's choice), worked out with the built-in pinyin collation; no new dependency.
- A letter with no words is still in the bar (dashed) and its page says "No words start with Q yet."

**Alternatives:** keeping word pages at `/define/{slug}` (two addresses for one feature); grouping by the English word in every language (stable across languages, but arbitrary to a Spanish or Chinese reader); one list with no letter bar in Chinese (the Chinese site would work differently); a pinyin library (more code for a small glossary).
**Consequences:** One word can sit under different letters in different languages. Links in the app, the footer and the admin pages now point to `/dictionary`. Docs updated: [features/19](../features/19-dictionary.md), `AGENTS.md`, decisions 053 and 055.
