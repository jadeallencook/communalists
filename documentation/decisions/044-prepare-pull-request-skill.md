# 044 · prepare-pull-request skill: agents open pull requests when asked

**Date:** 2026-11-25
**Status:** Accepted
**Context:** Since decision #42, every change reaches `main` through a squash-merged pull request. That means a branch, green CI, a Conventional Commit title (it becomes the commit on `main`) and a code owner's review. `AGENTS.md` said agents never commit or push, so every PR was made by hand. The user asked for a shared skill that any developer's agent can use to open a PR for their changes.
**Decision:** A project skill, `.claude/skills/prepare-pull-request/SKILL.md`. When asked, an agent:

1. runs the CI checks locally;
2. creates a `type/short-subject` branch without discarding any work;
3. stages files by name (never `research/` or secrets);
4. commits through the hooks (never `--no-verify`);
5. checks the title with commitlint;
6. pushes and opens the PR with a standard body (What, Why, Changes, Docs, Checks, For the reviewer).

It never merges, approves, force-pushes or bypasses the ruleset. The Git rule in `AGENTS.md` changes from "never commit or push" to "don't commit or push unless asked". A request for a PR covers that PR only.
**Alternatives:**

- _Keep "never commit or push"_: every PR stays manual, and titles and bodies vary in quality.
- _Claude Code's built-in `/ship`_: it also reviews the PR and watches it until it's merged. It isn't in the repo, so it doesn't know this repo's rules (`research/`, docs, accessibility, the commitlint title check), and not every contributor uses the same tool.
- _A `.github/pull_request_template.md` only_: it helps people who open PRs on GitHub, but doesn't run the checks or stop someone from staging `research/`. The skill's body format can become a template later if humans want one.

**Consequences:** Agents can commit and push, but only when someone asks for a PR. Each PR lists its docs and accessibility checks for the reviewer. Docs updated: `AGENTS.md` (Git), `technical/tooling-and-ci.md` (Branch protection), the user's agent memory.
