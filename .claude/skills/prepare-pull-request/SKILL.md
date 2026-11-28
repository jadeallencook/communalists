---
name: prepare-pull-request
description: Put the working tree's changes on a new branch, commit them, push, and open a pull request against main that passes this repo's checks (Conventional Commit title, green CI, docs updated). Use only when someone asks to open, create or prepare a pull request (or "a branch and a PR") for their changes. Never on your own initiative.
---

# Prepare a pull request

`main` is protected ([decision #42](../../../documentation/decisions/042-branch-protection-on-main.md)). Every change lands through a pull request that:

- is approved by a code owner who didn't push the last commit;
- passes `Lint, types, format, tests, build` and `PR title follows Conventional Commits`;
- is up to date with `main`;
- is squash-merged, so **the PR title becomes the commit message on `main`**.

This skill gets a change into that shape. Background: `documentation/technical/tooling-and-ci.md` → Branch protection.

**Only when asked.** Agents don't commit or push on their own (`AGENTS.md` → Git). A request to open a pull request is the exception, and it covers only the changes it names. It doesn't cover merging, force-pushing, or later commits nobody asked for.

## Steps

1. **See what changed.** Run `git status` and `git diff` (and `git diff --staged`). Name the one topic the PR is about. If the tree mixes unrelated work, **ask** which files go in, and leave the rest uncommitted. Never stash, reset or discard someone's work to make a clean branch.
2. **Make sure it's done.** Run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm format:check`. If code changed, also run `pnpm build`, since CI runs it. Fix any failures, or stop and report them; never open a PR you know is red. Then check the working methodology in `AGENTS.md`:
   - The docs match the change.
   - A meaningful choice has its file in `documentation/decisions/` and a row in the index.
   - UI work meets `documentation/technical/accessibility.md`.
   - New components have stories.
   - **If `firestore.indexes.json` changed,** the new indexes must be deployed and showing **Enabled** in the Firebase console **before** the PR merges, or production fails with `FAILED_PRECONDITION` (it happened twice on 2026-11-27, `/admin` and the dictionary discussion; `documentation/technical/firebase.md`). Put the deploy command at the top of **For the reviewer** as a step to do before merging, not after.
3. **Branch.** Run `git fetch origin`. If you're on `main`, create the branch from where you are with `git switch -c <type>/<short-subject>`, like `feat/find-organizations`, `fix/nearby-label` or `docs/pull-request-skill`. Uncommitted changes come along. Use lowercase hyphenated words, and pick a type from the title in step 5. If `main` is behind `origin/main`, say so in the PR. The **Update branch** button or `git merge origin/main` catches it up before merging; never rebase a branch someone else has pulled.
4. **Commit.**
   - Stage files **by name**. Don't use `git add -A` or `git add .`.
   - Never stage `research/` (git ignores it, and it holds unverified research and exports of unlisted organizations), `.env*`, service-account keys, `.claude/settings.local.json` or anything else with a secret. If one is staged, unstage it and warn the person.
   - Read `git diff --staged` before committing.
   - The commit message is a Conventional Commit (`type(scope): subject`), checked by the `commit-msg` hook. The `pre-commit` hook runs lint-staged.
   - **Never** pass `--no-verify`. If a hook fails, fix the cause and make a new commit; don't amend a commit that's already pushed.
   - End the message with any attribution lines your tool's instructions give you.
5. **Write the title.** It becomes the commit on `main`, so it follows Conventional Commits: `feat(orgs): …`, `fix(auth): …`, `docs(skills): …`, `chore(repo): …`.
   - Choose `feat` and `fix` for user-visible changes. Choose `docs`, `chore`, `refactor`, `test`, `ci` and `build` for everything else.
   - Use an existing scope from `git log --oneline` when one fits.
   - Keep it under about 72 characters, so GitHub doesn't cut it off ("…") the way it did for #129.
   - Check it before opening: `echo "<title>" | pnpm exec commitlint`.
6. **Push.** Run `git push -u origin <branch>`. Never force-push to a branch others use, and never push to `main`.
7. **Open the PR.** Write the body to a file in a temp or scratch folder, then run `gh pr create --base main --head <branch> --title "<title>" --body-file <file>`. Write the body for a reviewer who hasn't seen the conversation, and include these sections:

   ```md
   ## What

   One short paragraph: what changes for whom.

   ## Why

   The problem or request behind it. Link the decision file if there is one.

   ## Changes

   - Each change in a line, grouped by area.

   ## Docs

   The docs created or updated, or "None needed" and why (AGENTS.md rule 9).

   ## Checks

   - `pnpm lint`, `typecheck`, `test`, `format:check` (and `build` if run): pass
   - Accessibility: what was checked, or "No UI changes"

   ## For the reviewer

   Anything to look at closely, open questions, follow-ups left out on purpose.
   ```

   - End the body with any attribution lines your tool's instructions give you.
   - CODEOWNERS requests reviewers automatically, so don't `@`-mention people.
   - Put package names, roles and code like `@types/node` in backticks, because GitHub notifies any bare `@name`.

8. **Add screenshots if the UI changed.** Do this when the diff touches `src/components/`, a `.tsx` file under `src/app/`, `messages/` or `src/app/globals.css`. Skip it for docs, tooling and logic-only changes. The images go to the `pr-screenshots` branch, which is never merged ([decision #62](../../../documentation/decisions/062-pr-screenshots-branch-before-and-after.md)), and a **Screenshots** section is added to the description.

   **The repo is public, and pushed images stay public** (links are pinned to commits, so deleting a file doesn't take it down). Only screenshot the **local app on the emulators** (`pnpm dev`, which seeds test accounts), signed in with the dev toolbar's test accounts. Never use production, a Vercel preview or anyone's real account. Look at every image before it goes up: no real names, emails, phone numbers or addresses, and no browser chrome showing other tabs.
   1. **After:** with `pnpm dev` running on this branch (port 3000), open each changed screen with the browser tool and save a screenshot. Cover what a reviewer needs: each changed page or component in its main states (signed out and signed in if it differs, open menus or dialogs), at **desktop (1280px wide)** and **phone (about 400px)** when the layout differs. Move the mouse off links and buttons first so hover styles don't show. Take saved screenshots at full size (no `scale` option): the saved file is shrunk too. Keep it to about six views.
   2. **Before:** take the same views of `main`, from a separate worktree so this branch's files are never touched:

      ```sh
      git worktree add ../communalists-before origin/main
      cp .env.local ../communalists-before/
      cd ../communalists-before && pnpm install --frozen-lockfile && pnpm dev --port 3001
      ```

      `pnpm dev` there reuses the running emulators, and sign-in carries over between the two ports. Skip "before" for screens that are new in this PR. Afterwards, stop that server and run `git worktree remove ../communalists-before`.

   3. **Upload:** caption each view, starting with "Phone" or "Desktop". Put `--before <path>` just before a view to pair it with its `main` version:

      ```sh
      pnpm pr:screenshots --pr <number> \
        --before before-phone.jpg after-phone.jpg="Phone: header" \
        after-dialog.png="Desktop: new leave dialog"
      ```

      Pairs show side by side under **Before (main)** and **After (this PR)**. Run it again to replace the section; `--dry-run` prints the Markdown without pushing anything.

   If no browser tool is available, skip this step and write "Screenshots: not taken (no browser available)" under **Checks**.

9. **Hand it over.** Run `gh pr checks <number>` once to see the checks start. Give the person:
   - the PR link;
   - the branch;
   - the title;
   - whether screenshots were added;
   - what was left uncommitted, if anything.

   **Don't merge it, approve it or bypass the ruleset.** A code owner who didn't push the last commit approves it, and GitHub never lets authors approve their own PR.

## If something goes wrong

- **The push is rejected because the remote branch already exists:** pick a new branch name, or ask. Don't force-push.
- **`gh` isn't signed in:** ask the person to run `! gh auth login`. Then continue.
- **CI fails after opening:** say which check failed. Fix it with a new commit only if the person asks.
- **`pr:screenshots` says the push was rejected:** someone pushed to `pr-screenshots` at the same moment. Run it again; it never force-pushes.
- **The title check fails:** fix it with `gh pr edit <number> --title "…"`, which re-runs the check, since editing the title is part of opening the PR.
