# 004 · Firebase as the backend, same project, emptied

**Date:** 2026-11-20
**Status:** Accepted
**Context:** The prototype used Firebase Auth, Firestore and Realtime Database without rules or indexes in the repo.
**Decision:** Keep the existing Firebase project, but empty its databases and start a new schema. Security rules and indexes live in the repo with emulator tests. Authorization runs on the server (Admin SDK in server actions and route handlers), never only in the UI.
**Alternatives:** Postgres (Supabase/Neon) is a better fit for relational data like memberships and audit logs. New Firebase projects. Migrating the old data.
**Consequences:** No legacy data to support. Export the old rules (and data, if wanted) before emptying. _Done 2026-11-20:_ production was backed up outside the repo (see `technical/data-model.md`), both databases were emptied, and deny-all rules were deployed for Firestore and Realtime Database. The relational sketch in `technical/data-model.md` needs a Firestore version.
