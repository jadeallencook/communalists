# 056 · Dictionary words in title case in English

**Date:** 2026-11-26
**Status:** Accepted
**Context:** The user asked for words to be capitalized in the dictionary ("Democratic Socialism", not "Democratic socialism").
**Decision:** English words are written in title case (small words like "of" and "and" stay lowercase; "Know Your Rights"). Spanish and Vietnamese keep sentence case, which is how those languages write terms; title case reads as an error there ("Socialismo Democrático"). Chinese has no capitals. This is a writing rule for the data (the CSVs and the edit form), not something the code changes on display, so a proper name inside a word keeps its own capitals.
**Alternatives:** title case in every language (wrong in Spanish and Vietnamese); capitalizing on display with CSS (`capitalize` would also capitalize "of" and break names like "Buy Nothing").
**Consequences:** The starter CSVs were updated. Super users follow the rule when adding words. Docs updated: [features/19](../features/19-dictionary.md).
