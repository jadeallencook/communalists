---
name: brainstorm-definition
description: Brainstorm and rewrite one dictionary word's definition with the user (the short definition, the longer "More about it" text, and the Spanish, Vietnamese and Chinese), then, once agreed, export it as a one-word CSV in research/definitions/updates/ for "Upload a definition" on the super-user dashboard. Use when asked to improve, rewrite, brainstorm or fix the definition of a word in the Communalists dictionary.
---

# Brainstorm a dictionary definition

The dictionary (`/dictionary/{slug}`) explains words like "mutual aid" to people who have never heard them, and the short definition is also the tooltip wherever our pages mark the word. Background and rules: `documentation/features/19-dictionary.md`. If this file and that doc disagree, the doc wins: fix this file.

This is a conversation first. **Nothing is exported until the user says they agree** on the English text.

## 1. Start from what's there

- Find the word's current text. It's in a starter CSV in `research/definitions/` (`grep -n "^{slug}," research/definitions/*.csv`), or an earlier agreed version in `research/definitions/updates/{slug}.csv`, which wins. The live text (in Firestore) may have been edited since: if the user pastes it, or you can open `https://communalists.com/dictionary/{slug}`, use that.
- Read the words it sits next to: its related words, and any word whose short definition sounds similar (`mutual-aid` vs `mutual-aid-network`). Two hovers that say nearly the same thing are a problem worth pointing out.

## 2. Brainstorm

Say plainly what's wrong with the current text (unclear, inaccurate, too abstract, missing what makes this word different), then propose a version. Give your recommendation, not a menu; offer a second option only when there's a real choice to make. When the user pushes back or rewrites it, say what you think of their version honestly (rule 2 in `AGENTS.md`), suggest the smallest fix, and keep going until they agree.

What a good entry looks like:

- **Short definition** (up to 300 characters, aim for under 200): one or two plain sentences someone who has never heard the word can follow. It must say what sets this word apart from its neighbors. No examples lists that crowd the tooltip; those go below.
- **More about it** (optional, up to 5,000): two to four short paragraphs, separated by a blank line. How it works in practice, how it differs from similar words, a little history if it helps. The first sentence must make sense on its own: the short definition sits right above it, but don't depend on "it" pointing back to it.
- **Neutral and accurate.** Describe, don't promote: no "on Communalists you can…", nothing the platform doesn't do yet. Facts (dates, history) must be ones you're confident of; leave them out otherwise.
- **Plain language**, per `documentation/technical/accessibility.md`: short sentences, everyday words, no jargon without explaining it.
- **Capitalization:** English words in title case ("Mutual Aid Network"); Spanish and Vietnamese capitalize only the first word; Chinese has none (decision #56).
- **Related words** aren't part of the file (the upload never changes them). If you'd suggest different ones, list the slugs for the user to set in the edit form, and check each exists (`cut -d, -f1 research/definitions/*.csv`).

## 3. Translate

Once the English is agreed, write the Spanish, Vietnamese and Chinese to match it, meaning for meaning, at the same plain level. Keep each language's word as it already is unless the user wants it changed. Show the translations to the user. They're machine-quality: say so, and that fluent speakers should check them.

## 4. Export

Write the draft as JSON in the scratchpad (not the repo), then run the writer. It checks the text with the app's own rules and writes `research/definitions/updates/{slug}.csv` (git ignores `research/`):

```sh
pnpm exec tsx .claude/skills/brainstorm-definition/write.ts /path/to/draft.json
```

```json
{
  "slug": "mutual-aid-network",
  "text": {
    "en": { "word": "…", "definition": "…", "details": "…\n\n…" },
    "es": { "word": "…", "definition": "…", "details": "…" },
    "vi": { "word": "…", "definition": "…", "details": "…" },
    "zh": { "word": "…", "definition": "…", "details": "…" }
  }
}
```

If it prints problems, fix the text (ask the user if a cut changes the meaning) and run it again. One file per word; writing again replaces it.

## 5. Hand it over

Tell the user the file's path and how to use it:

- **Production:** `/admin` → **Upload a definition**, choose the file, **Check file**. It shows each field that changes, now and new, and nothing is saved until **Update {word}**. Related words stay as they are.
- **Locally:** the same page works (sign in as Jordan Lee from the dev toolbar). `pnpm seed` also applies every file in `research/definitions/updates/` over the starter words, so a reset keeps the new text.
- **A word that isn't in the dictionary yet:** the upload refuses it. The same file works with **Import words from a CSV** (related words can be added there in a `related` column, or later in the edit form).
