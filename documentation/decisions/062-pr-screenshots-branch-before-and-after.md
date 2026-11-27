# 062 · PR screenshots: before and after, hosted on a `pr-screenshots` branch

**Date:** 2026-11-27
**Status:** Accepted
**Context:** Reviewers of UI changes had to run the branch or open the Storybook preview to see what changed. The user asked for the prepare-pull-request skill to add screenshots to the description automatically when the UI changes, with before and after views. `gh` can't upload images to a PR, so they need a home.
**Decision:**

- The skill's step 8 takes screenshots when the diff touches components, pages, messages or global CSS: the branch on port 3000 ("after"), and `main` from a separate git worktree on port 3001 ("before"), both on the local emulators.
- `pnpm pr:screenshots` (`.claude/skills/prepare-pull-request/screenshots.mjs`) commits the images to the `pr-screenshots` branch under `pr-<number>/`, using git plumbing and a temporary index, so the working tree and current branch are never touched. It never force-pushes. It then writes a **Screenshots** section into the description between marker comments (replaced on re-runs). Before/after pairs show side by side.
- That branch is never merged. It carries its own `vercel.json` with `git.deploymentEnabled: false`, so pushes to it don't build previews. CI only runs on `main` and pull requests.
- Links point at `raw.githubusercontent.com` pinned to the commit.

**Alternatives:** Uploading through the person's signed-in browser, the way a person drags images in (no extra branch, but it needs their Chrome and breaks when GitHub's page changes). Committing images into the PR branch (squash-merging would put them on `main` for good). "After" only (cheaper, but a reviewer can't see what changed).
**Consequences:** The repo is public, and pushed images stay reachable even after a file is removed, because links are pinned to commits. So the skill only allows the local app with seeded test data, and the agent checks each image for personal data before uploading. Removing an image for good would mean rewriting that branch and asking GitHub to purge caches. The branch grows over time, and old `pr-<n>` folders can be deleted. Docs updated: `.claude/skills/prepare-pull-request/SKILL.md`, `technical/tooling-and-ci.md`, decision #44 (status note).
