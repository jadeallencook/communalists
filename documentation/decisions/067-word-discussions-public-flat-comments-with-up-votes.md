# 067 · Discussions on words: public, flat comments with up votes

**Date:** 2026-11-27
**Status:** Accepted
**Context:** Phase 3 of the dictionary ([features/19](../features/19-dictionary.md)). The user wants people to comment on each word so its definition can improve over time, to up vote the most useful comments, and to use the discussion as a reason to create an account. Comments on organization pages may come later.
**Decision:**

- **Anyone can read; commenting, up voting and reporting need an account** with setup finished. Signed-out readers see the comments and "Join the discussion" (Create an account / Sign in), which come back to the discussion. Chosen over hiding comments from signed-out readers: the discussion itself is what makes signing up worth it, and it stays crawlable.
- **One flat list, no replies**, sorted Top (default) or Newest, 20 at a time. Chosen over one level of replies: simpler with a screen reader and to moderate, and enough for suggesting definitions.
- **Up votes only**, one per person per comment, not on your own. No editing.
- **Moderation from day one** (all four of the options offered): authors delete their own; anyone signed in reports, with a reason; super users hide (undoable) or delete, on the word's page and on `/admin/comments`, each logged in `adminLog`; at most 5 comments per person per hour.
- **Called "Discussion"** in the UI (the user's choice over "Discourse", for plain language and translation).
- **Built for any target** (`{ kind, id }`, `src/lib/comments/`), so organization pages can reuse it with their own access rules.
- **Votes are stored per target** (`definitions/{slug}/commentVotes/{commentId}_{uid}`), not under each comment as first planned, so "which did I vote for" is one query. Comment pages and counts are cached and tagged; the viewer's votes are read fresh.
- **Sign-in and sign-up take `?next=`** (sanitized with `safeNextPath`), so people come back to the discussion, and `requireAccount` now passes its `next` to sign-in too.

**Alternatives:** signed-in-only reading (a bigger push to sign up, but hides what would convince people, and isn't crawlable); one level of replies; a thread stored in one document like the prototype ([11](../features/11-comment-threads.md); votes would rewrite it constantly and it caps at 1 MiB); votes under each comment (a read per comment shown to know your votes); shipping without reports or a rate limit (public user content with no brakes).
**Consequences:** New collections `commentReports` and `commentLimits`, new subcollections on words, a composite index on `comments` (`votes`, `createdAt`), new `adminLog` actions (`hideComment`, `unhideComment`, `deleteComment`, `dismissCommentReport`) and a "comments" activity group. Removing a word deletes its discussion. Docs updated: [features/20](../features/20-comments.md) (new), [features/19](../features/19-dictionary.md), [features/16](../features/16-organizations.md), [data model](../technical/data-model.md), [analytics](../technical/analytics.md), [accounts and sessions](../technical/accounts-and-sessions.md), [accessibility](../technical/accessibility.md), [getting started](../getting-started.md), the docs index and `AGENTS.md`.
