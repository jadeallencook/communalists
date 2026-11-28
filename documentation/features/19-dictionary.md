# 19 · Dictionary

Many visitors don't know words like "mutual aid", "solidarity" or "tenant union". The dictionary explains each word once, in plain language, on a page anyone can open and share. Organizers can send the link when someone asks "what does that mean?", and our own pages can point to it. Planned in [issue #140](https://github.com/jadeallencook/communalists/issues/140) and agreed with the user on 2026-11-26 ([decision #53](../decisions/053-dictionary-shareable-definitions-super-users-manage.md)).

**Status:** phases 1 and 2 built 2026-11-26. **Next:** phase 3, comments.

## Phases

1. **Dictionary pages and super-user editing** (built): the data, `/dictionary/{slug}`, the A–Z lists at `/dictionary/{letter}`, and add and edit on `/admin/definitions`. Every change goes in `adminLog`.
2. **Marked words in our own copy** (built): `<Definition slug="mutual-aid">`, placed by hand in our pages (never in what organizations write). See "Marked words" below.
3. **Comments:** a thread on each word's page, for signed-in users, with up votes. See "Phase 3" below.
4. **Later: resources** (books, videos, articles, links). The data already has room for them.

## Pages

| Route                       | Who         | What                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/dictionary/{letter}`      | Everyone    | An A–Z bar, then the words under that letter with their short definitions, sorted for the UI language. A letter with no words says so. `/dictionary` goes to A; the footer links there                                                                                                                                                                                                                                                                                            |
| `/dictionary/{slug}`        | Everyone    | The word, its short definition, the longer explanation (if any), **Copy link**, related words, and resources (once there are any). Page title is "{Word}: Meaning and Definition", with the short definition as its description and `DefinedTerm` structured data ([technical/seo.md](../technical/seo.md)). "Dictionary: M" links back to its letter. An address typed with capitals redirects to the lowercase one. **Super users** also see **Edit {word}** at the top (below) |
| `/admin/definitions`        | Super users | Every word with Edit and View, and **Add a word**. Linked from `/admin` (Dictionary section). After saving, "Saved {word}" is announced and takes focus                                                                                                                                                                                                                                                                                                                           |
| `/admin/definitions/import` | Super users | Add many words from a CSV (below)                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `/admin/definitions/new`    | Super users | The form, with the address (slug)                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `/admin/definitions/{slug}` | Super users | The same form, filled in. The address is shown but can't change. Opened from the word's page (`?from=page`), the back link and saving both return there                                                                                                                                                                                                                                                                                                                           |

The public pages are crawlable and locale-prefixed (`/es/dictionary/mutual-aid`). Letters are one character and slugs at least two, so one route (`/dictionary/[entry]`) serves both. They moved from `/define` on 2026-11-26, and the old addresses redirect permanently ([decision #57](../decisions/057-dictionary-at-slash-dictionary-with-a-to-z-letters.md)). The slug is the same in every language. Admin pages are a 404 for everyone else, like `/admin` ([features/18](18-unclaimed-organizations.md)).

## Editing from the word's page

Added 2026-11-27 at the user's request, so a super user reading a word can fix it without going through `/admin/definitions`. On `/dictionary/{slug}`, super users get a small dashed box at the top, "Only super users see this.", with **Edit {word}**. It opens the usual edit form (`/admin/definitions/{slug}?from=page`), not an inline editor, so all four languages, the checks and the admin log stay in one place. Its back link reads "Back to {word}". Saving returns to the word's page with `?saved=1`, where "Saved {word}." is announced in a live region and takes focus. Opened from the list, the form still returns to the list.

The box streams in its own `<Suspense>` (`EditContainer` in the page), so the word never waits on the session check, and everyone else gets nothing, `?saved=1` included. The edit page and the action still check super-user access themselves; the link only saves a trip. UI: `DefinitionEditBar` (molecule, with stories) in `DefinitionPage`'s `edit` slot.

## Letters

The letter bar is A to Z in every language. A word is listed under its first letter **as it reads in the UI language** (`letterOf` in `src/lib/definitions/index.ts`): accents are dropped (Á → A, Ñ → N), Vietnamese Đ goes under D, and leading quotes are skipped. **Chinese words go under their pinyin initial** (互助, hùzhù → H), like Chinese dictionaries and phone contacts: the server compares the first character with the first character of each pinyin letter using the built-in pinyin collation (`Intl.Collator('zh-u-co-pinyin')`), so no library is needed. Every starter word was checked by hand; a rare character could land under the wrong letter. Anything with no usable letter falls back to the slug's first letter. So the same word can be under different letters in different languages (Mutual Aid → M, Ayuda mutua → A, 互助 → H).

The bar is a `nav` with each letter as a link (at least 40px square), the current one marked `aria-current="page"`, and letters with no words dashed and announced as "(no words)". Letter pages read the cached word list, so they cost nothing per visit.

## A word

- **Address (slug):** lowercase letters, numbers and single hyphens, 2 to 60 characters (`mutual-aid`). `new` and `import` are reserved (they're routes). **Permanent:** the edit form doesn't offer to change it, so shared links keep working. If a word ever needs a new slug, add a redirect from the old one rather than renaming.
- **Text in all four languages**, each with:
  - **Capitalization:** English words are in title case ("Democratic Socialism", "Repair Café"). Spanish and Vietnamese capitalize only the first word, as those languages do ("Socialismo democrático"); Chinese has no capitals ([decision #56](../decisions/056-dictionary-words-title-case-in-english.md)).
  - **Word** (up to 80 characters).
  - **Short definition** (up to 300): one or two plain sentences. The page's lead, and the tooltip on marked words. Kept short on purpose so the tooltip stays small.
  - **More about it** (optional, up to 5,000): only on the word's page. A blank line starts a new paragraph.
- **Related words:** up to 10 other words, linked at the bottom. Slugs that aren't words are dropped when saving. In the form (changed 2026-11-27 at the user's request; it was a checkbox for every word, too long once the dictionary grew), the linked words are listed first ("Linked: 2 of 10"), each with **Remove**, and below them **Find a word to add** lists matches only while you type. Matching ignores case and accents and also checks the address ("cafe" finds Repair Café); words that start with the text come first (`searchWords` in `src/lib/definitions/index.ts`, tested). Enter or a click adds the highlighted word, Enter never submits the form, and words already linked aren't offered. At 10 the search says to remove one first. Adding or removing is announced ("Added Solidarity. 2 of 10 linked."), focus stays in (or, after Remove, goes back to) the search, and each linked word is sent as a hidden `related` input. Code: `RelatedWordsField` (molecule) and `useRelatedWords` (hook), both with stories.
- All four languages are required in the form. Machine translation is fine for now; fluent speakers will check later. If a language is ever blank (say, a document written before a language was added), the page shows English and says so, with `lang` set so screen readers switch voice.
- **No version history.** The admin log records who added or edited which word, when, and which fields changed.
- **No deleting yet.** When it's built, warn the super user before removing a word that pages still mark (they'd quietly turn into plain text).

## Importing from a CSV

The way to add many words at once, in production or locally, like the organization import ([features/18](18-unclaimed-organizations.md#importing-from-a-csv)). Chosen by the user on 2026-11-26 over a command-line loader, so nobody needs database credentials on their own machine.

1. `/admin/definitions` → **Import from a CSV** opens `/admin/definitions/import`. It describes the columns and offers **Download the template** (the header row).
2. **Check file** sends the file to the server, which checks every row and **adds nothing**. Each row is **Ready**, **Already in the dictionary: skipped** (with a link to edit it), or lists its problems, each naming the field, its CSV column and how to fix it. Focus moves to the summary ("4 rows. 2 ready, 1 already in the dictionary, 1 to fix").
3. **Add N words** asks for confirmation, then checks the file again on fresh data and adds every ready row in one batch (all or none), each with its own `createDefinition` entry in the admin log. It clears the dictionary's cache, so the words show at once, and goes back to the list with "Added N words" announced and focused. If someone added one of the words meanwhile, nothing is added and it says to check again.

**Columns:** `slug`, `related` (optional: slugs separated by `;`), then for each language `en_word`, `en_definition` and `en_details` (optional), and the same for `es`, `vi` and `zh`. Each row goes through the form's schema, so the limits are the same. A related slug must already be a word or be in the same file. A slug repeated in the file is a problem on the later row. Unknown columns are listed and left out. Up to 200 rows and 500 KB.

**Words already in the dictionary are skipped, never overwritten** (the user's choice), so re-uploading an old file can't undo edits made in the form. To change a word, edit it on its own page.

Code: `src/lib/definitions/import.ts` (reading and checking rows; pure, tested), `importDefinitions` and `getDefinitionSlugsFresh` in `store.ts`, and the CSV reader shared with the organization import (`src/lib/csv.ts`).

## Starter words

The first ten words (mutual aid, solidarity, tenant union, harm reduction, free fridge, food pantry, organizer, mutual aid network, lending library and unclaimed organization) are a CSV in `research/definitions/starter.csv`. **`research/` is ignored by git** (the user's choice), so the file lives only on the machine that has it: upload it through the import above. Written neutrally, in plain language; **the Spanish, Vietnamese and Chinese are machine-quality** and need checking by fluent speakers.

**Locally,** `pnpm seed` (and `pnpm dev` when any are missing) also writes every row of every CSV in `research/definitions/`, added by Jordan, without checking them, so check a file with the import first. Running it again resets those words; words you added in the app are kept. Without the folder, the local dictionary starts empty. The seed reads the files with the app's own `parseCsv`, importing `src/lib/csv.ts` directly (Node strips its types; the warning that `package.json` has no `"type"` is turned off where the seed runs).

## Data

`definitions/{slug}`:

| Field                    | What                               |
| ------------------------ | ---------------------------------- |
| `slug`                   | Same as the document id            |
| `text.{en,es,vi,zh}`     | `{ word, definition, details }`    |
| `related`                | Other slugs                        |
| `resources`              | Typed items, empty for now (below) |
| `createdBy`, `createdAt` | The super user who added it        |
| `updatedBy`, `updatedAt` | The last edit                      |

Room to grow, without migrations:

- **Everything is read through `readDefinition`** (`src/lib/definitions/index.ts`), which fills in defaults, so documents without a newer field still read. New sections are new optional fields, never renames.
- **`resources`** holds `{ id, type: 'book' | 'video' | 'article' | 'link', title, url, by?, language? }`. A page leaves out any type it doesn't know and any item that doesn't parse (including a non-http link), so adding a type never breaks older code. Only super users will add them; links get `rel="noopener noreferrer"`. The page already shows them under "Learn more".
- **Comments (phase 3)** go in a subcollection, `definitions/{slug}/comments/{id}`, not an array on the word: votes would mean constant writes to one shared document, and the 1 MiB limit would cap a busy thread (the prototype's comment threads lived in one document to save reads: [11](11-comment-threads.md)). Each comment keeps an up-vote count, and votes are one record per person (`…/comments/{id}/votes/{uid}`), so nobody can vote twice. Pages load 20 comments at a time.

`adminLog` gets `createDefinition` and `editDefinition` entries with `definition { slug, word }` (the English word), `actorUid`, `fields[]` (for edits, like `es.word` or `related`) and `createdAt`. An edit that changes nothing isn't saved or logged.

All writes go through the Admin SDK (`saveDefinition` in `src/lib/definitions/store.ts`), in a transaction that checks a new slug is free or an edited word exists. The security rules deny clients, and `rules/firestore.rules.test.ts` proves it for `definitions` and the planned comments and votes ([decision #54](../decisions/054-security-rules-tests-against-the-emulator.md)).

**Reads and cost.** The glossary is small, so `getDefinitions()` reads the whole collection once and serves the index, the admin list and related links. It's cached and tagged `definitions` for a day; one word is cached under `definition:{slug}`. Saving clears both tags and the admin log's. A cached miss on a word's page is confirmed fresh, so a word just added on another server still opens. The public pages render per request from the cache (`connection()`), not at build time: the build has no database credentials, and new words should show without a deploy. Saving reads every slug once (to drop unknown related words): fine at dozens of words, revisit at thousands.

## Analytics

`definition-view` (a word's page opened) and `definition-share` (Copy link pressed), each with only the `slug`. `definition-open` (a marked word chosen, opening its page), with only the `slug`. Opening the tooltip isn't reported. Admin pages are never reported ([analytics](../technical/analytics.md)).

## Accessibility

- Each language's fields are a fieldset named after the language, and every input has `lang`, so screen readers read each language in its own voice. Word pages and lists set `lang` on the text too.
- After a save with problems, an error summary takes focus, says how many problems there are, and links to each field. Each field points to its own error (`aria-describedby`) and is marked invalid. What was typed is kept.
- After saving, the result is announced and takes focus. **Copy link** announces "Link copied" in a live region, and if the browser refuses the clipboard, shows the link to copy by hand.
- Long words and addresses wrap (`break-words`, `break-all`), checked at phone width.

## Marked words (`<Definition>`)

Words in our own copy can point to the dictionary. Built 2026-11-26: the homepage marks **mutual aid networks**, **organization**, **mutual aid** and **tool library**. The user chose hover for the definition and a click for the page, over the issue's plan of a popover that opens on click ([decision #55](../decisions/055-marked-words-hover-tooltip-click-opens-page.md)).

- **What people see:** the word has a dotted underline (an ordinary link's is solid; it turns solid on hover or focus). **Hovering or keyboard focus** shows a tooltip with the word, its short definition and "Select to read more". **Choosing it** (click, tap or Enter) opens `/dictionary/{slug}`. On phones there's no hover, so a tap goes straight to the page, which has the same text.
- **Accessibility:** it's a real link, so it's in the Tab order and named by its own text. The tooltip opens on focus as well as hover, is read as the link's description (`aria-describedby`), stays open while the pointer moves onto it, and closes with Escape without moving focus (WCAG 1.4.13). It has `lang` for its text and no animation under reduced motion. Mark only a word's first use on a page, and never inside headings or buttons.
- **Placing one:** `<Definition slug="tool-library">tool library</Definition>`. It takes the slug, not the word, because the text changes with the language. In translated copy, use a rich-text tag that each language places around its own words (`"Start an <org>organization</org>…"`, rendered with `t.rich` and a map of tags to `<Definition>`). Only in our own copy, never in what organizations write.
- **Unknown slug** (deleted, or not written yet): plain text, no underline, no error. While the definitions are loading, or if they can't load, the word is still a link to its page, just without the tooltip.
- **Where the text comes from:** `DefinitionsContainer` in the root layout provides them. Nothing is fetched until a marked word appears on the page; then `useDefinitionPreviews` asks `GET /api/definitions?locale=…` once per language per page load. The route returns every word's word, short definition and language (`previewsFor`) from the cached list (no read per request), and the CDN keeps it for 5 minutes, so an edit can take that long to reach tooltips. Pages stay prerendered: the build never reads Firestore.
- Code: `src/components/molecules/definition.tsx` (with stories: found, not found, loading, failed, long, Spanish, Vietnamese, Chinese falling back to English), `src/hooks/use-definition-previews.ts`, `src/app/api/definitions/route.ts`, `src/app/[locale]/definitions-container.tsx`, and the `Tooltip` atom (shadcn).

Removing a word that pages still mark doesn't break them (it turns into plain text), but super users should still be warned when deleting is built.

## Phase 3: comments (planned)

Signed-in users only, which may encourage sign-ups. Up votes only, one per person per comment; definitions aren't rated. Sorted **Top** by default, with **Newest**. Super users can hide or delete comments, anyone signed in can **Report** one, and there's a limit on how often someone can comment. Every moderation action goes in `adminLog`. Data shape above.

## Built (2026-11-26)

| Piece                                                                       | Where                                                                                                                                                                |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug rules, form schema, reading stored words, resources, language fallback | `src/lib/definitions/index.ts` (pure, tested)                                                                                                                        |
| Firestore: cached reads, saves with admin log                               | `src/lib/definitions/store.ts`                                                                                                                                       |
| Pages and action                                                            | `/dictionary/{letter}`, `/dictionary/{slug}`, `/admin/definitions` (+ `new`, `{slug}`), `saveDefinitionAction`                                                       |
| UI                                                                          | `DictionaryPage`, `DefinitionPage`, `AdminDefinitionsPage`, `AdminDefinitionEditPage`, `DefinitionForm`, `CopyLinkButton`, `useCopyLink` (all in Storybook)          |
| CSV import                                                                  | `src/lib/definitions/import.ts`, `src/lib/csv.ts`, `/admin/definitions/import`, `AdminDefinitionsImportPage`; local words in `research/definitions/` via `pnpm seed` |
| Rules tests                                                                 | `rules/firestore.rules.test.ts` (`pnpm test:rules`)                                                                                                                  |

**Verified 2026-11-26** in a real browser (about 500 px wide) against the seeded emulators:

- **Signed out of admin, as Maya:** `/define` listed the ten words; `/vi/define/mutual-aid` showed Vietnamese with its related words; **Copy link** announced "Đã sao chép liên kết." `/admin` and `/admin/definitions/new` were a 404.
- **As Jordan:** adding "Rent strike" with a bad address and only English showed a focused summary of 7 problems, each field marked invalid and pointing to its error, with the typed text kept. The address `mutual-aid` was refused as taken. With all four languages and a related word, it saved, and `/admin/definitions` announced "Saved Rent strike" with focus on it. Editing showed the address as fixed; changing the Spanish word showed at once on `/es/define/rent-strike`, with its related word. `/admin` listed "Jordan Lee added the word Rent strike" and "… edited …", and the Dictionary section.
- `pnpm build` without the emulators (as in CI) passes.

- **Import, as Jordan:** a 4-row file (one existing word, two new words related to each other, one missing its Vietnamese word) showed "2 ready, 1 already in the dictionary, 1 to fix" with focus on it; the broken row said "Word (Tiếng Việt) (vi_word): Write the word." Adding asked for confirmation, then `/admin/definitions` announced "Added 2 words." The Spanish page of a new word linked its related words (new and existing), and the admin log had an entry for each.

Not checked yet: a screen reader pass, the Storybook a11y panel in both themes on the new stories, and importing the starter words in production.
