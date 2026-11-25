# Tooling and CI

Every change runs through the same checks locally (git hooks) and in CI. The prototype's version is in [prototype/tooling-and-ci.md](prototype/tooling-and-ci.md). Its conventions (Conventional Commits, 4-space Prettier, the lockfile check) carried over.

## Setup

```sh
nvm install                   # Node 24.22.3 from .nvmrc (minimum 24.15)
corepack enable               # once; provides pnpm at the version in package.json
pnpm install
pnpm dev                      # http://localhost:3000 → redirects to /en
```

`pnpm dev` (`scripts/dev.mjs`; `npm run dev` works too) does the rest:

1. Creates `.env.local` from `.env.example` if it's missing.
2. Starts the Firebase emulators, or reuses ones already running, and waits for Auth. Then runs `scripts/seed.mjs --if-missing`, which adds the test data only if any of it is missing (about half a second otherwise).
3. Starts Next with `METADATA_SERVER_DETECTION=none`, so Firestore doesn't wait seconds looking for Google's metadata server (and Next doesn't show a `MetadataLookupWarning`).
4. Starts `next dev`. Extra arguments pass through: `pnpm dev --port 3001`.
5. On Ctrl-C, stops Next, then lets the emulators save to `.emulator-data/`.

It also starts only Auth and Firestore (`--only auth,firestore`; the Realtime Database isn't used), removes leftover `firebase-export-*` folders, and names any process blocking an emulator port.

It warns when Node doesn't match `.nvmrc`. `firebase-tools` is a dev dependency, so no global install is needed. The emulators need **Java 21+** (`brew install openjdk@21`), and the script says so if it's missing. `pnpm dev:next` runs Next alone.

## Scripts

| Script                                   | What it does                                                                                                                                                                                                                                              |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                               | Local development: `.env.local`, emulators and Next together (above)                                                                                                                                                                                      |
| `pnpm dev:next` / `build` / `start`      | Next.js only                                                                                                                                                                                                                                              |
| `pnpm lint`                              | ESLint (Next core-web-vitals + TypeScript rules, Prettier conflicts off)                                                                                                                                                                                  |
| `pnpm typecheck`                         | `next typegen` (route + root-param types), then `tsc --noEmit`                                                                                                                                                                                            |
| `pnpm format` / `format:check`           | Prettier                                                                                                                                                                                                                                                  |
| `pnpm test` / `test:watch`               | Vitest (jsdom + Testing Library)                                                                                                                                                                                                                          |
| `pnpm storybook` / `build-storybook`     | Storybook 10 on port 6006                                                                                                                                                                                                                                 |
| `node scripts/build-places.mjs <dir> US` | Regenerates the city-picker data from GeoNames downloads (see `accounts-and-sessions.md`)                                                                                                                                                                 |
| `pnpm seed`                              | Test accounts and organizations (`scripts/seed-data.json`) in the running emulators; resets them if they exist. `--if-missing` (used by `pnpm dev`) only seeds when something is missing ([getting-started → Test data](../getting-started.md#test-data)) |
| `pnpm emulators`                         | The same script without Next: Auth (9099) + Firestore (8080) emulators, UI on 4000, project `demo-communalists`; saves to `.emulator-data/` on Ctrl-C                                                                                                     |

## Dev toolbar

A **Dev** menu in a corner of every page, only in local development (decision #24): one-click sign-in as a test account (then the dashboard), **Reset test data** (`pnpm seed` plus clearing the cached reads it changed), a link to the emulator UI, and a corner picker remembered in `localStorage`.

| Piece                                  | Where                                                                |
| -------------------------------------- | -------------------------------------------------------------------- |
| The guard and test-account list (pure) | `src/lib/dev/index.ts` (`isLocalDev`, `TEST_ACCOUNTS`)               |
| Actions (`devSignIn`, `resetTestData`) | `src/app/actions/dev-tools.ts`                                       |
| UI and corner                          | `DevToolbar` (organism), `useDevToolbarCorner` (both in Storybook)   |
| Wiring                                 | `src/app/[locale]/dev-toolbar-container.tsx`, rendered by the layout |
| Test data                              | `scripts/seed-data.json`, `scripts/seed.mjs`                         |

**Keeping it out of production.** `isLocalDev(process.env)` is true only for `NODE_ENV=development`, not on Vercel, with no service-account key, with both emulator hosts set, and a project ID starting with `demo-`. The layout renders the toolbar only then, and **each action checks it again**: Next server actions can be called directly by their ID whether or not any page renders them, so hiding the button alone wouldn't be enough. Sign-in also only accepts the seeded emails. Verified 2026-11-23 on a production build pointed at the emulators: no toolbar, and direct calls to both actions failed with "Dev tools are only available in local development" and set no session cookie. Unit tests cover the guard.

**Adding a tool:** add a row to `DevToolbar` (props only), and if it needs the server, a server action in `dev-tools.ts` that calls `assertLocalDev()` first. Its text is English and stays out of `messages/*.json`: only developers ever see it.

**Resetting keeps you signed in.** Setting a Firebase password, even to the same value, signs that account out everywhere, so the seed only resets a test account's password when it no longer matches `password123`.

## Git hooks (husky 9)

| Hook         | Runs                                                                                  |
| ------------ | ------------------------------------------------------------------------------------- |
| `pre-commit` | `lint-staged`: `eslint --fix` + Prettier on staged code; Prettier on JSON/MD/CSS/YAML |
| `commit-msg` | `commitlint` with `@commitlint/config-conventional`                                   |

Tests and the build run in CI, not in the hook, to keep commits fast.

## CI (`.github/workflows/ci.yml`)

One job on every push to `main` and every PR: `pnpm install --frozen-lockfile` (fails on lockfile drift) → `format:check` → `lint` → `typecheck` → `test` → `build` → `build-storybook`.

**PR title (`.github/workflows/pr-title.yml`).** PRs are squash-merged, so the PR title becomes the commit message on `main`. This job runs the title through `commitlint` (the same config as the `commit-msg` hook) whenever a PR is opened, edited or pushed to. The title reaches the script through an environment variable, so a crafted title can't inject commands.

## Branch protection on `main`

A GitHub ruleset, "Protect main" (Settings → Rules → Rulesets), set up in [decision #41](../decisions/041-branch-protection-on-main.md). Its definition is kept in `.github/rulesets/main.json` so rule changes get reviewed like code. **GitHub doesn't read that file**: change the ruleset on GitHub as well, in the same PR, by editing it there or importing the file (New ruleset → Import a ruleset). To check for drift, export the live ruleset from its page and compare.

| Rule                 | Setting                                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Pull request         | Required; 1 approval from a code owner (`.github/CODEOWNERS`: `@jadeallencook`, `@claytonleonardcook`, `@sebzicodes`)   |
| After new pushes     | Earlier approvals are dismissed; someone other than the last pusher must approve                                        |
| Conversations        | All must be resolved                                                                                                    |
| Required checks      | `Lint, types, format, tests, build` and `PR title follows Conventional Commits`, from GitHub Actions; branch up to date |
| Merge method         | Squash only; linear history                                                                                             |
| Signed commits       | Required (GitHub signs squash merges made on the site)                                                                  |
| Force push, deletion | Blocked                                                                                                                 |
| Bypass               | Repository admin role, which in this personal repo is only the owner (each bypass is logged)                            |

Outside the ruleset, in Settings → General → Pull Requests: only squash merging is allowed, the default message is the PR title and description, and "Always suggest updating pull request branches" is on.

**If you rename a CI job,** update the required check in the ruleset in the same change. Otherwise every PR waits forever on a check that never reports.

## Conventions

- **Prettier:** 4 spaces, single quotes, semicolons, ES5 trailing commas. Markdown and YAML use 2 spaces (with 4, Prettier writes lists as `-   item`). `prettier-plugin-tailwindcss` sorts classes, including inside `cn()` and `cva()`.
- **Path alias:** `@/*` → `src/*`, defined once in `tsconfig.json`. Vite/Vitest read it through `resolve.tsconfigPaths`.
- **Tests:** next to the code as `*.test.ts(x)`. `messages/messages.test.ts` fails if any locale is missing a key or has an empty string (the prototype silently rendered blanks).

## pnpm 12 supply-chain settings (`pnpm-workspace.yaml`)

- **Build scripts are denied unless approved.** pnpm 12 _fails the install_ when a dependency's install script is neither allowed nor denied. Each entry in `allowBuilds` has a comment saying why. Only `esbuild` is allowed (its script just verifies its binary).
- **Minimum release age.** pnpm won't install versions published in the last day or so. Storybook's `init` tried to add `minimumReleaseAgeExclude` entries to get around this for a same-day release. We pinned the previous version (10.6.7) instead. **Don't add exclusions; pin an older version.**

## Gotchas found while setting up

- **Turbopack's disk cache can serve an old `globals.css`.** On 2026-11-23 new theme variables in `src/app/globals.css` didn't show up in `pnpm dev` or even in `pnpm build`, while class changes in components did. The build was reusing a stale Tailwind transform from `.next/cache/turbopack`. Moving that folder aside fixed the build. If a change to `globals.css` doesn't show: stop `pnpm dev`, delete `.next/cache/turbopack` and `.next/dev`, and start again. Both are caches and are rebuilt.

- shadcn's `init` failed halfway under pnpm 12 because of the unapproved build scripts above. Re-running after setting `allowBuilds` worked.
- `CI=1` makes pnpm use `--frozen-lockfile`, so CLI generators (Storybook `init`) can't add dependencies under it. Run `pnpm install` afterwards.
- **Version:** `package.json` `version` is bumped by hand at milestones (decision #19), not per commit. `next.config.ts` inlines it with `VERCEL_GIT_COMMIT_SHA` as `NEXT_PUBLIC_APP_VERSION` / `NEXT_PUBLIC_COMMIT_SHA`, for the footer (`src/lib/build-info.ts`).
- jsdom 31 needs Node ≥ 24.15, so `engines` is `>=24.15 <25`. `.nvmrc` pins an exact LTS (24.22.3) so everyone and CI run the same version.
- **Keep an upper bound on `engines`.** Vercel's `engines` overrides the project's Node.js setting and picks the newest major that matches. With `>=24.15`, production ran on Node 26, while we develop and test on 24. Raise the bound deliberately, after testing on the new major.
- **Vercel's functions can't `require()` ES modules.** Plain Node 24 can, so local runs hide it. On 2026-11-21 every production sign-in crashed with `ERR_REQUIRE_ESM`: `firebase-admin` 14 → `jwks-rsa` 4 `require()`s the ESM-only `jose` 6. It happened on Node 24 and on 26; capping Node at 24 (above) was **not** the fix, even though I first thought it was. Fixed with a pnpm override pinning `jwks-rsa` to 3.2.2, which uses CommonJS `jose` 4 and the same API. See `pnpm-workspace.yaml` and [tech-debt](tech-debt.md#rebuild-temporary-workarounds).
- **New dependencies can bring build scripts that only Linux flags.** Adding `firebase-tools` (2026-11-22) pulled in `re2`, a native add-on. CI and Vercel failed with `ERR_PNPM_IGNORED_BUILDS: re2`, but clean installs on macOS, even with an empty store, didn't. After adding a dependency, check the first CI run, and allow or deny anything it names in `pnpm-workspace.yaml` with a reason.
- **Run the emulators through `scripts/dev.mjs`, never `firebase emulators:start` directly.** Ctrl-C in a terminal signals the whole process group, so the emulators' Java processes die before the CLI can save. That leaves an unfinished `firebase-export-*` folder, nothing in `.emulator-data/`, and Java emulators still holding their ports. The script runs the emulators in their own process group and sends SIGINT only to the CLI, which saves and then stops them (found 2026-11-22: no save had ever completed before this fix).
- **Reproduce Vercel's module loading locally** with `NODE_OPTIONS=--no-experimental-require-module`. Run `pnpm start` that way when a dependency changes, or when production fails where local doesn't.
- **Git doesn't track empty folders.** Storybook's `staticDirs` points at `public/`, which was empty, so it existed locally but not in CI, and `build-storybook` failed there only (first CI run, 2026-11-21). `public/.gitkeep` keeps the folder. To reproduce CI exactly, build from `git archive HEAD` rather than the working tree.
- **Storybook doesn't get Tailwind from `next.config.ts`.** Next compiles Tailwind v4 through the `@tailwindcss/turbopack` loader in `next.config.ts`, but Storybook builds with Vite and never reads that file. Without `@tailwindcss/vite` in `.storybook/main.ts` (`viteFinal`), stories render with theme tokens but **no utility classes**: serif text, unstyled buttons, visible `sr-only` labels (seen 2026-11-21). Keep `@tailwindcss/vite` on the same version as `tailwindcss`.
- **Turbopack can't optimize AVIF images you import** ("AVIF image not supported … will emit without optimization"). Keep source images as JPEG/PNG/WebP in `src/assets/`; Next's optimizer still serves AVIF/WebP to browsers. The homepage photo arrived as AVIF named `.jpeg` and was converted to JPEG.
- **`shadcn add` prompts to overwrite shared atoms** (e.g. `command` re-ships `button.tsx` and `input.tsx`), and piped answers don't reach every prompt. `--overwrite` is fine when those atoms are unmodified shadcn originals: run Prettier, then `git diff` to confirm nothing changed.
- **`vitest --root /` scans the whole filesystem.** To try a TypeScript module quickly, run it with Node 24 directly (`node file.mts`; types are stripped).
- An old global Firebase CLI (12.x) works, but it swaps in an older cached Firestore emulator JAR. Keep it current.
