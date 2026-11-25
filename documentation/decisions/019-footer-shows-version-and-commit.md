# 019 · Show version and commit in the footer

**Date:** 2026-11-21
**Status:** Accepted
**Context:** The user wanted to see which version is live on the server, and suggested the `package.json` version, bumped on every change.
**Decision:** The footer shows `v{version} ({commit})`, e.g. `v4.0.0 (be4248f)`, with the commit linked on GitHub. The commit comes from `VERCEL_GIT_COMMIT_SHA` at build time; local builds show `(dev)`. The version is bumped **by hand at milestones** (something user-visible ships), not on every change. It continues from the existing `4.0.0`.
**Alternatives:** Version only, bumped every change (drifts the first time someone forgets, which defeats the purpose); commit only; automatic bumps from Conventional Commits with release-please (worth it once we work through PRs).
**Consequences:** "Is the server current?" is answered by comparing the footer's commit with `git log`. Version numbers mean milestones, not builds.
