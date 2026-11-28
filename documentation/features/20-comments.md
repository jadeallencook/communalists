# 20 · Comments and discussions

A public discussion under something people can talk about, with up votes. It's built first for **dictionary words** (the **Discussion** section on `/dictionary/{slug}`, phase 3 of [features/19](19-dictionary.md)), so readers can suggest better definitions and point out what one leaves out, and we can improve the words over time. It's also a reason to create an account: anyone can read, but commenting and voting need one. Agreed with the user on 2026-11-27 ([decision #67](../decisions/067-word-discussions-public-flat-comments-with-up-votes.md)).

**Later: organization pages.** The user wants comments on organizations too. The code is written for any **target** (`{ kind, id }`), so that means a new kind, its own page and its own access rules (who may read, write and moderate, scoped by organization and role). Nothing about it is decided yet; see "Adding a target" below.

**Status:** built 2026-11-27 for dictionary words.

## What people see

| Who                                          | Sees                                                                                                                                                                                                                                                                                          |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Everyone, signed out too                     | **Discussion** and the count, a line on what it's for ("…we read them to improve the definition"), the comments, and **Join the discussion**: Create an account / Sign in. Both come back to the discussion afterward (`?next=/dictionary/{slug}#discussion`)                                 |
| Signed in, account setup not finished        | "Finish setting up your account…" with a link to setup (it also comes back). A comment shows the author's name, so setup must be done                                                                                                                                                         |
| Signed in                                    | The form: **Your comment**, a hint that "Your name and comment are public. Plain text only.", a character count, "Written in English · **Change**" (below), **Post comment**. On each comment: **Up vote** (others' comments) and **Report** (others'), or **Delete** (their own, asks first) |
| Super users (moderators of dictionary words) | **Hide** / **Show again** and **Delete** on every comment, and hidden comments' text. Reported comments on `/admin/comments`                                                                                                                                                                  |

- **In the reader's language first** (the user's choice, 2026-11-27). Each language has its own definition text, so feedback in Spanish is usually about the Spanish wording and belongs with Spanish readers. Above the list, **Show comments in: English (2) · All languages (4)**, with the reader's UI language pressed. If there are none in their language but some in others: "No comments in Tiếng Việt yet." with **See 1 comment in other languages**, so a small discussion never looks empty. **Super users start with All languages**, since they review every one. In All languages, a comment not in the reader's language is marked with its language's name ("Español"). The count in the heading is all languages.
- **A comment's language is the UI language**, shown under the box as "Written in English · **Change**" rather than a picker everyone has to read (the user's choice over always using the UI language, and over the first version's labelled dropdown). **Change** (named "Change the language of your comment") opens the picker and moves focus to it, for people writing in another language than their UI. The tag matters: it sets the screen reader's voice (`lang`) and which readers see the comment first, so a wrong one would hide it from the people who could read it. Detecting the language from the text was ruled out: unreliable for short comments.
- **One flat list.** No replies (the user's choice, for readability with a screen reader and simpler moderation). **Top** (most up votes, then newest) is the default; **Newest** is the other order. 20 at a time, then **Show more comments**.
- **A comment:** the author's name (a link to `/comrade/{username}`, "(you)" on your own), the date, the text in paragraphs (a blank line starts one), with `lang` set to its language, and its up votes. An account that's gone shows "Former member".
- **Up votes only**, one per person per comment, and you can take yours back. Not on your own comment. The count shows to everyone.
- **Plain text**, up to 2,000 characters. No links are made clickable (spam). Tidied on save: trimmed, at most one blank line between paragraphs, invisible control characters removed.
- **Hidden comments** keep their place, showing "Hidden by a moderator." Only super users see their text. They can't be voted on or reported.
- **No editing.** People voted on the text as written; delete and post again instead.
- After posting, the comment shows at the top whatever the order, so the author sees it.

## Moderation

All four were chosen for the first version (the user's choice, since comments are public).

- **Delete your own comment.** Asks first ("It's removed for everyone, with its up votes. This can't be undone."). Not logged: it's the author's own.
- **Report.** Anyone signed in, on someone else's comment, once per comment. A dialog asks why: spam or advertising, harassment or hate, shares someone's personal information, false or misleading, or something else. Reports are anonymous to the author.
- **Super users hide, show again, or delete** any comment on a word, on the word's page or on `/admin/comments`. Hiding is undone with **Show again**; deleting is permanent. Every action goes in `adminLog` (`hideComment`, `unhideComment`, `deleteComment` with a copy of the text, author uid, language and votes, `dismissCommentReport`), shows in the activity feed on `/admin` and counts under "Comments hidden, deleted or reports dismissed". Hiding or deleting closes the comment's report.
- **`/admin/comments`** lists reported comments, most reported first: the word (linked), author, date, up votes, how many reports and why, and **Hide**, **Delete** (asks first) and **Dismiss report**. `/admin` shows "N comments were reported. Review reported comments" under "Needs attention", and **Reported comments (N)** in the Dictionary section.
- **Rate limit:** at most **5 comments per person per hour**, across every discussion, checked in the same transaction as posting. Past it: "You've posted 5 comments in the last hour… You can post again at 3:42 PM."
- Removing a word deletes its discussion (comments, votes, open reports) too; the confirmation says so.

## Data

| Path                                      | What                                                                                                                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{parent}/comments/{id}`                  | `uid`, `text`, `lang` (`en`/`es`/`vi`/`zh`), `createdAt`, `votes` (the count), `hidden`, and `hiddenBy`/`hiddenAt` while hidden                                     |
| `{parent}/commentVotes/{commentId}_{uid}` | `commentId`, `uid`, `createdAt`: one per person per comment, so nobody counts twice                                                                                 |
| `commentReports/{kind}~{id}~{commentId}`  | Open reports on one comment: `target { kind, id }`, `commentId`, `reporters[]` (uids), `reasons { spam: 2, … }`, `count`, `firstAt`, `lastAt`. Deleted when handled |
| `commentLimits/{uid}`                     | `recent[]`: when the person last commented (epoch ms, last hour only), for the rate limit                                                                           |

`{parent}` is the target's document: `definitions/{slug}` for a word.

- **Comments are one document each, not an array on the word** (the prototype kept a request's thread in one document to save reads: [11](11-comment-threads.md)). Votes would mean constant writes to one shared document, a busy thread would hit the 1 MiB limit, and paging needs a query. Reads are cached instead (below).
- **Votes live beside the comments, per target, not under each comment** (the first plan was `comments/{id}/votes/{uid}`). Then "which of these did I up vote?" is one query on this word's `commentVotes` (`where uid ==`, costing one read per vote you made here) instead of a read per comment shown.
- **Dates are set by the server's clock** (`Timestamp.fromMillis(Date.now())`), not `serverTimestamp()`, so the next page's cursor (`{votes}.{ms}`) points at a comment exactly.
- **Composite indexes** on `comments`, in `firestore.indexes.json`: Top (`votes` desc, `createdAt` desc), and both orders within one language (`lang`, then `votes` desc, `createdAt` desc; `lang`, then `createdAt` desc). Newest across all languages uses the single-field index. Deploy them with the rules.
- **Only the author's name and username leave the server**, read through the cached profile (`getUserProfile`), so a changed name shows everywhere. Never the uid, email or anything else.
- Every write goes through the Admin SDK in a transaction that checks fresh data (the word still exists, the comment isn't yours or hidden, you haven't voted or reported already). The rules deny clients, and `rules/firestore.rules.test.ts` proves it for all four paths.

## Reads and cost

- A page of comments (`getComments`, per order, language and cursor) and the counts (`getCommentCounts`: all and each language, five aggregation reads) are cached for days and tagged `comments:{kind}~{id}`. Posting, voting, deleting and moderating clear the tag, so the next reader sees the change.
- **The discussion fails on its own.** If its reads fail (say, an index still building after a deploy), the word's page renders as usual and the section says "Comments couldn't load right now. Try again in a few minutes." The error is logged. Show more and the order or language buttons already announce a failed load. Added 2026-11-27, after production hit exactly this ([firebase.md](../technical/firebase.md)).
- **What the viewer voted for is read fresh** (it's theirs alone): one query, only for signed-in viewers. Authors' names come from the cached profiles.
- The first page is rendered on the server inside its own `<Suspense>`, so the word never waits on it, and it's crawlable. **Show more** and changing the order call `GET /api/comments/{kind}/{id}?sort=top|newest&after={cursor}`, which answers `private, no-store` (it depends on the session); its page reads are cached like the first page. Pages loaded one after another can overlap when votes change: repeats are dropped.
- Open reports (`getOpenReports`, `getOpenReportCount`) are cached and tagged `commentReports`.

## Accessibility

- The section is a `section` named by its **Discussion** heading; each comment is an `article` with the author as an `h3`, so screen reader users can jump between comments.
- Results are announced in a `role="status"` region (Comment posted, Up voted. 5 up votes now., Showing the newest comments first., 20 more comments shown.) and problems in `role="alert"`.
- **Focus:** after posting, on the new comment. After **Show more**, on the first new comment. After deleting, on the announcement (the comment is gone). After hiding or showing again, on the comment. After reporting, it stays on Report, where the dialog gives it back. Changing the order or the language leaves it on the button (buttons aren't `disabled` while loading). **See N comments in other languages** goes away once pressed, so focus moves to the first comment it shows.
- **Up vote** is a toggle (`aria-pressed`) named after its comment and count: "Up vote the comment by Maya Thompson (4 up votes)". Report, Delete, Hide and Show again name their comment too.
- Form errors are linked to the text box (`aria-invalid`, `aria-describedby`), which takes focus. The character count isn't a live region (it would talk over typing); it's read with the box.
- The comment's text, and the language picker's options, have `lang`.
- Buttons have visible outlines, Delete a red one; everything wraps at 320px and 200% zoom (long names and words break). Skeletons don't pulse with reduced motion.

## Analytics

`discussion-join` (`on`, `id`, `to: sign-up | sign-in`) when a signed-out reader chooses Create an account or Sign in, and `comment-post` (`on`, `id`) when Post comment is pressed. Never the text. Votes and reports aren't sent: they're already in Firestore. See [analytics](../technical/analytics.md).

## Adding a target (organizations, later)

1. Add the kind to `COMMENT_TARGET_KINDS`, and its document path and page in `targetPath` and `targetHref` (`src/lib/comments/index.ts`).
2. Decide who reads, comments and moderates, in `src/lib/comments/access.ts` (`canModerate`) and in the actions, scoped by organization and membership role (AGENTS.md: super users don't moderate claimed organizations). The API route and actions check `commentTargetSchema` and the rules on the server; the UI only hides buttons.
3. Render a `DiscussionContainer` for it, and add its paths to the rules tests.

## Code

| Piece                                                                            | Where                                                                                                          |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Targets, the comment schema, rate limit, cursors, who can do what (pure, tested) | `src/lib/comments/index.ts`                                                                                    |
| Firestore: pages, counts, posting, votes, reports, moderation                    | `src/lib/comments/store.ts`                                                                                    |
| Who moderates, and what the log calls a target                                   | `src/lib/comments/access.ts`                                                                                   |
| What one viewer sees (authors, their votes)                                      | `src/lib/comments/views.ts`                                                                                    |
| Server actions                                                                   | `src/app/actions/comments.ts`                                                                                  |
| Next page / other order                                                          | `src/app/api/comments/[kind]/[id]/route.ts`                                                                    |
| On a word's page                                                                 | `src/app/[locale]/dictionary/discussion-container.tsx`, `discussion-client.tsx`                                |
| Reported comments                                                                | `/admin/comments` (`src/app/[locale]/admin/comments/`)                                                         |
| UI (all in Storybook)                                                            | `CommentItem`, `CommentForm` (molecules), `Discussion` (organism), `AdminCommentsPage`, `useDiscussion` (hook) |
| Test comments                                                                    | `comments` in `scripts/seed-data.json` (on words that exist locally, with votes and one report)                |

**Verified 2026-11-27** in a real browser against the seeded emulators.

Languages (added the same day):

- **Signed out, English, Mutual Aid** (two English comments, one Spanish, one Vietnamese): "English (2)" pressed, "All languages (4)" beside it, two comments shown. All languages announced "Showing comments in all languages: 4.", kept focus on the button, and marked the others "Español" and "Tiếng Việt" (each with `lang`).
- **Vietnamese, Solidarity** (one English comment): "Tiếng Việt (0)" pressed, "Chưa có bình luận bằng Tiếng Việt." and "Xem 1 bình luận bằng ngôn ngữ khác"; pressing it announced the change and put focus on the English comment, marked "English".
- **As Luis, English UI:** the form said "Written in English · Change"; Change put focus on the picker. Posting in Spanish tagged the comment `es`, marked it "Español", and the counts read "English (1) · All languages (2)"; deleting it put them back.

The first version:

- **Signed out:** `/dictionary/mutual-aid` showed four comments, Top first, with counts and no buttons, and Join the discussion. Sign in went to `/sign-in?next=/dictionary/mutual-aid#discussion` and, as Luis, came back to the discussion with the form.
- **As Luis:** posting nothing showed "Write your comment first." on the focused, invalid box. Posting announced "Comment posted.", put focus on it at the top and made the count 5. His own comments had only Delete; his seeded vote on Maya's showed pressed. Up voting Marcus's announced "Up voted. 1 up vote now." and pressed the button; again took it back. Newest re-ordered and announced it. Report without a reason said "Choose what's wrong with it."; with one, "You already reported this comment. Thanks." (his seeded report). Deleting asked first, then announced "Comment deleted." with focus on it, and the count went back to 4.
- **As Jordan (super user):** `/admin` said "1 comment was reported." `/admin/comments` showed it reported twice for spam; Hide announced the result, focused it and emptied the list. The word's page showed it hidden with Show again and Delete (Hide and Delete on the rest), the admin log read "Jordan Lee hid a comment on Mutual Aid", and signed-out HTML had only "Hidden by a moderator."
- **Paging:** with 25 extra comments, both orders came back in two pages, 26 comments, no repeats or gaps.
- **Found and fixed:** after signing in, the discussion first showed the signed-out list (vote buttons on Luis's own comment). Next 16 keeps recently visited pages alive with their state; the client part is now keyed by viewer (a hash of the uid), so it starts fresh.
- **Found and fixed:** buttons were `disabled` while a request ran, which drops keyboard focus (pressing Up vote with Enter left focus nowhere). They now use `aria-disabled` (the `Button` atom dims it) and the hook ignores repeat presses; checked: after Enter, focus stays on Up vote and "Up voted. 1 up vote now." is announced.

Not checked yet: a screen reader pass, the Storybook a11y panel in both themes, phone width in the real app (the stories cover long text), the rate limit in the browser (unit-tested), and deploying the new index.
