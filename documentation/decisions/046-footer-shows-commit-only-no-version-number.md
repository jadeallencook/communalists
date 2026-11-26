# 046 · Footer shows the commit only, no version number

**Date:** 2026-11-25
**Status:** Accepted (supersedes [#19](019-footer-shows-version-and-commit.md))
**Context:** Decision #19 put `v{version} ({commit})` in the footer, with the `package.json` version bumped by hand at milestones. Nobody bumped it: the footer said `v4.0.0` for every build since the rebuild started, so the number told readers nothing, and could suggest nothing had shipped. Since decision #42 every change lands through a squash-merged pull request, so release automation became possible. The user asked whether to remove the version or automate it.
**Decision:** The footer shows only the short commit it was built from, linked on GitHub (`be4248f`), or `dev` for local builds. `package.json` keeps a `version` field (tools expect one), but nothing displays it and nobody needs to bump it.
**Alternatives:** release-please, bumping the version from Conventional Commit PR titles and writing a changelog (accurate, but every release needs a release PR merged, and there's another workflow to maintain; worth revisiting if we ever publish release notes or a mobile app with store versions); bumping the patch version on every merge (a number that changes each build but says no more than the commit, and needs a bot that can push to protected `main`).
**Consequences:** "Is my change live?" is answered by comparing the footer's commit with `git log`, as before. There's no human-readable release number; if one is needed later, pick up release-please.
