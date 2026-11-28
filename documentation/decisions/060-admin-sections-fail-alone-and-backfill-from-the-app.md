# 060 · Admin dashboard sections fail on their own, and the backfill runs from the app

**Date:** 2026-11-27
**Status:** Accepted
**Context:** After [#58](058-super-user-dashboard-counts-search-and-missing-details.md) was merged, `/admin` crashed in production (React error 441) because the new composite indexes hadn't been deployed: one `FAILED_PRECONDITION` query failed the whole page. Running the `missingDetails` backfill script against production also needed Google credentials on a laptop (`gcloud` wasn't installed). Umami's report also timed out at 8 seconds.
**Decision:** (the user chose option 1 of three)

- **Each dashboard read fails on its own.** The counts are split into four cached groups by the indexes they need (core, missing-details gaps, activity, backfill check). The container catches each read and logs it, and that section says "Couldn't load this section". Claims and Recently deleted still fail the page, because they are the page's job and use only single-field queries.
- **The backfill runs from `/admin`.** A super-user-only **Fill in missing details** button runs the same logic on Vercel with the server's credentials, logs a `backfillDetails` entry (with how many it updated), and clears the `directory` and `adminLog` tags, so the counts update right away. The button shows until the first `backfillDetails` entry exists (one count read). The script stays for the local emulators.
- **Umami timeout** raised from 8 to 20 seconds.

**Alternatives:** installing `gcloud` and using Application Default Credentials (a large install, and broad credentials left on a laptop); a downloaded service-account key (the master key on disk); one error boundary around the whole dashboard (still blanks everything).
**Consequences:** Deploy indexes **before** merging code that needs them; the PR description should say so. A section can quietly show "Couldn't load" while its index builds, so check the Vercel logs (`[admin] … failed`) if one stays blank. Docs: [features/18](../features/18-unclaimed-organizations.md#dashboard), [firebase](../technical/firebase.md), [analytics](../technical/analytics.md#reports-on-admin).
