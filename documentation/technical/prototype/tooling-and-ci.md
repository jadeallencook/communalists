# Prototype: Tooling and CI

> **History.** This describes the 2022–2024 prototype (commit `7ebc168`). For the current setup, see [../tooling-and-ci.md](../tooling-and-ci.md).

Volunteer engineers came and went, so the tooling was set up to make the right way the easy way. This setup is worth bringing back almost exactly.

## Git hooks (husky 8)

| Hook         | Runs                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `pre-commit` | `npx lint-staged` (Prettier on staged `.ts`/`.tsx`) → `npm run pretty` (whole repo) → `npm test` |
| `commit-msg` | `.git/hooks/commit-msg $1`, from `git-commit-msg-linter`                                         |

- Commit messages follow **Conventional Commits** (`feat:`, `fix:`, `chore(scope):`). Both `commitlint.config.js` and `.commitlintrc.json` extend `@commitlint/config-conventional` (one is redundant).
- `validate-branch-name` is installed. Its config isn't in the repo, so it uses the default pattern (`feature/…`, `fix/…`, etc.).

## CI (`.github/workflows/check-ts.yml`, on every push)

Three parallel jobs on Ubuntu 22.04 with Node from `.nvmrc`:

1. **Lockfile drift:** runs `npm install` and fails if `git diff` shows changes. You can't merge a `package.json` change without the matching lockfile.
2. **Formatting:** runs Prettier and fails if anything changed.
3. **Types:** `npx tsc --noEmit`.

There is no lint job, test job, or build job, and no deploy workflow is in the repo.

## Formatting and linting

- Prettier: 4 spaces, single quotes, semicolons, ES5 trailing commas.
- `.eslintrc` exists but **conflicts** with Prettier (it asks for tabs) and isn't run anywhere. `@typescript-eslint/parser` isn't even installed.

## Tests

- Jest + ts-jest is configured with `--passWithNoTests`. **There are no tests.** The helpers in `src/utils/` (`filter-requests`, `format-phone-number`, `isAfterHours`) are where the real bugs are, and they'd be easy to test.

## Path aliases

Defined twice, in `tsconfig.json` `paths` and in Webpack `resolve.alias`. They must be kept in sync by hand:

`@pages @components @utils @assets @database @interfaces @objects @custom-types @api @forms`

(`@database` points to a folder that doesn't exist. The `npm run mock` script points at `jobs/mock-database.ts`, which also doesn't exist.)

## Lessons from getting it running again (2026)

The dev server failed with TypeScript parse errors in `@types/node`. The cause: `@types/node` had drifted to a version TypeScript 4.8 can't parse, and the active Node wasn't the pinned 16.17.0. The fix was restoring the lockfile's versions and running `nvm use`. Pin exact versions and commit the lockfile — that's exactly what the drift check exists for.

## Carry forward to the rebuild

- Husky (or lefthook) + lint-staged + commitlint
- The three CI checks, plus `lint`, `test`, and `build`
- Path aliases defined **once** (Next.js and Astro both read `tsconfig` paths)
- An `.nvmrc` / `engines` pin on a current LTS
- One ESLint config that matches Prettier (`eslint-config-prettier`)
