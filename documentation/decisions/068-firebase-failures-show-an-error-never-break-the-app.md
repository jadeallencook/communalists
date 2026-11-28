# 068 · If Firebase fails, show an error; never break the app

**Date:** 2026-11-27
**Status:** Accepted
**Context:** Twice in one day, a Firestore query that failed in production broke a page: `/admin` (decision [#60](060-admin-sections-fail-alone-and-backfill-from-the-app.md)), then dictionary word pages, because the discussion's indexes were still building ([features/20](../features/20-comments.md)). Readers got React errors (#419, #441) and a broken page. The app had no `error.tsx`, so anything that escaped fell through to the framework's bare error screen. The user set the rule: if Firebase fails to load, the application shouldn't break; it should show an error.
**Decision:**

- **A part of a page that reads Firestore fails on its own.** Its container catches the read, logs `[area] … failed` with the message only (never personal data), and renders that part's own "couldn't load" state. The rest of the page renders as usual. Examples: the discussion's `DiscussionUnavailable`, and `/admin`'s sections.
- **When the read is the page itself** (a word, an organization), the page may throw. `src/app/[locale]/error.tsx` then shows a translated "Something went wrong" inside the site's header and footer, with **Try again** (Next's `retry`), **Go to the homepage**, and the error's reference id (`digest`) to match the server log. Focus moves to its heading.
- **The last resort** is `src/app/global-error.tsx`, for failures in the root layout itself. It has no translations or header, so it says the same thing in all four languages, with Try again.
- **Missing isn't failing.** A word that doesn't exist is still `notFound()`. A failed read must never be shown as a 404 or as "nothing here".
- **Client loads** (Show more, filters) catch their own errors and announce them; they never throw into React.
- Indexes are still deployed and **Enabled** before the code that needs them merges (the `prepare-pull-request` skill checks), so these states stay rare.

**Alternatives:** an error boundary around every component (heavy, and it hides which part failed); retrying failed reads automatically (an index still building, or a quota error, won't fix itself in a retry, and retries cost reads); doing nothing beyond deploying indexes first (a timeout or outage would still break pages).
**Consequences:** New reads are written with their failure state, and a story for it. Existing pages weren't all audited when this was written; the containers that render several reads should be checked against this rule. Docs: `AGENTS.md` (engineering conventions), [firebase](../technical/firebase.md), [features/20](../features/20-comments.md).
