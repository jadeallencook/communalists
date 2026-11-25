# 042 · Branch protection on `main`: pull requests, code owner review, squash merges

**Date:** 2026-11-24
**Status:** Accepted
**Context:** Every push to `main` deploys to production on Vercel ([deployment](../technical/deployment.md)), and until now changes were pushed straight to `main`. CI ran only after the push, so a broken build or a failing test could reach production. Commit messages were checked only by the local commitlint hook, which a contributor can skip. Five people have committed. The repo is public, so rulesets work on the Free plan. It was in the `techletariats` org while this was being planned, then moved back to the personal account `jadeallencook/communalists` (same repo ID). Personal accounts have no teams or organization admins, which shaped the code owner and bypass choices below.
**Decision:** A GitHub **ruleset** named "Protect main" on the default branch:

- Changes go through a pull request with **1 approval from a code owner**. `.github/CODEOWNERS` assigns `*` to `@jadeallencook` (the repo owner), `@claytonleonardcook` and `@sebzicodes`. Any one of them can approve another's PR.
- New pushes **dismiss earlier approvals**, and someone other than the last pusher must approve.
- **All review conversations** must be resolved.
- Required checks: `Lint, types, format, tests, build` (CI) and `PR title follows Conventional Commits` (`pr-title.yml`). Both must come from GitHub Actions, and the branch must be **up to date** with `main`.
- **Squash merges only**, with linear history. The PR title becomes the commit message, which is why the title is checked.
- **Signed commits** required. Squash merges made on GitHub are signed by GitHub, so this mostly affects direct pushes.
- **Force pushes and deletion** blocked.
- The **Repository admin** role can bypass, for hotfixes. GitHub logs each bypass. In a personal repo only the owner has that role (collaborators get write access at most), so in practice only `@jadeallencook` can bypass.

**Alternatives:**

- _Direct pushes with only force-push and deletion blocked_: keeps the old workflow, but CI would still run after production deploys.
- _PRs with no bypass_: if one code owner is away, the other can't merge anything at all, hotfixes included.
- _Bypass for both code owners_: needs an organization (personal repos can't give collaborators admin), and the owner chose to move the repo out of one.
- _A `maintainers` team as code owner_: planned while the repo was in the org; personal accounts can't have teams.
- _0 approvals_ (PR plus green CI is enough): faster, but nobody else reads the change before it's live.
- _CODEOWNERS on sensitive paths only_ (security rules, auth, CI config): less review load. The user chose review on everything; narrower paths can still be added to CODEOWNERS later.
- _Rebase or merge commits_: keep every commit of a PR, but then each message depends on the contributor's local hook, and history is harder to read.
- _Classic branch protection_: can't list bypass actors as cleanly, and isn't exported as JSON.
- _A PR-title action from the Marketplace_: the repo already has commitlint, so the job pipes the title through it and adds no dependency.

**Consequences:** Work goes branch → PR → review → squash merge, and production deploys when the PR merges. GitHub never lets an author approve their own PR, so there are three code owners: with only two, one person being away would stall the other's PRs. Every code owner needs write access, or GitHub ignores them. The ruleset's definition is kept in `.github/rulesets/main.json` for review, like the security rules. GitHub doesn't apply it from there, so change both together. Renaming either CI job breaks the required check, so update the ruleset when you rename one. The repo's merge settings (squash only, PR title and description as the message, suggest updating branches) live in Settings → General, outside the ruleset. Docs updated: `technical/tooling-and-ci.md` (Branch protection, PR title check), `technical/deployment.md` (normal path), `AGENTS.md` (Git).
