# Tooling and CI

Every change runs through the same checks locally (git hooks) and in CI. The prototype's version is in [prototype/tooling-and-ci.md](prototype/tooling-and-ci.md). Its conventions (Conventional Commits, 4-space Prettier, the lockfile check) carried over.

## Setup

```sh
nvm install                   # Node 24.22.3 from .nvmrc (minimum 24.15)
corepack enable               # once; provides pnpm at the version in package.json
pnpm install
cp .env.example .env.local    # then fill in, or use the emulator values
pnpm dev                      # http://localhost:3000 → redirects to /en
```

The Firebase CLI is not a project dependency. Install it globally (`npm i -g firebase-tools`, latest). The emulators also need **Java 21+**.

## Scripts

| Script                               | What it does                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| `pnpm dev` / `build` / `start`       | Next.js                                                                                    |
| `pnpm lint`                          | ESLint (Next core-web-vitals + TypeScript rules, Prettier conflicts off)                   |
| `pnpm typecheck`                     | `next typegen` (route + root-param types), then `tsc --noEmit`                             |
| `pnpm format` / `format:check`       | Prettier                                                                                   |
| `pnpm test` / `test:watch`           | Vitest (jsdom + Testing Library)                                                           |
| `pnpm storybook` / `build-storybook` | Storybook 10 on port 6006                                                                  |
| `pnpm emulators`                     | Firebase Auth (9099) + Firestore (8080) emulators, UI on 4000, project `demo-communalists` |

## Git hooks (husky 9)

| Hook         | Runs                                                                                  |
| ------------ | ------------------------------------------------------------------------------------- |
| `pre-commit` | `lint-staged`: `eslint --fix` + Prettier on staged code; Prettier on JSON/MD/CSS/YAML |
| `commit-msg` | `commitlint` with `@commitlint/config-conventional`                                   |

Tests and the build run in CI, not in the hook, to keep commits fast.

## CI (`.github/workflows/ci.yml`)

One job on every push to `main` and every PR: `pnpm install --frozen-lockfile` (fails on lockfile drift) → `format:check` → `lint` → `typecheck` → `test` → `build` → `build-storybook`.

## Conventions

- **Prettier:** 4 spaces, single quotes, semicolons, ES5 trailing commas. Markdown and YAML use 2 spaces (with 4, Prettier writes lists as `-   item`). `prettier-plugin-tailwindcss` sorts classes, including inside `cn()` and `cva()`.
- **Path alias:** `@/*` → `src/*`, defined once in `tsconfig.json`. Vite/Vitest read it through `resolve.tsconfigPaths`.
- **Tests:** next to the code as `*.test.ts(x)`. `messages/messages.test.ts` fails if any locale is missing a key or has an empty string (the prototype silently rendered blanks).

## pnpm 12 supply-chain settings (`pnpm-workspace.yaml`)

- **Build scripts are denied unless approved.** pnpm 12 _fails the install_ when a dependency's install script is neither allowed nor denied. Each entry in `allowBuilds` has a comment saying why. Only `esbuild` is allowed (its script just verifies its binary).
- **Minimum release age.** pnpm won't install versions published in the last day or so. Storybook's `init` tried to add `minimumReleaseAgeExclude` entries to get around this for a same-day release. We pinned the previous version (10.6.7) instead. **Don't add exclusions; pin an older version.**

## Gotchas found while setting up

- shadcn's `init` failed halfway under pnpm 12 because of the unapproved build scripts above. Re-running after setting `allowBuilds` worked.
- `CI=1` makes pnpm use `--frozen-lockfile`, so CLI generators (Storybook `init`) can't add dependencies under it. Run `pnpm install` afterwards.
- jsdom 31 needs Node ≥ 24.15, so `engines` sets that minimum. `.nvmrc` pins an exact LTS (24.22.3) so everyone and CI run the same version.
- An old global Firebase CLI (12.x) works, but it swaps in an older cached Firestore emulator JAR. Keep it current.
