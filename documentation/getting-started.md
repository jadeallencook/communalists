# Getting Started

From a fresh machine to a running app and your first change. You don't need a Firebase or Vercel account: local development runs against the Firebase emulators and never touches real data.

## 1. Install the prerequisites

| Tool                                 | Why                                   | Check           |
| ------------------------------------ | ------------------------------------- | --------------- |
| [nvm](https://github.com/nvm-sh/nvm) | Installs the Node version in `.nvmrc` | `nvm --version` |
| **Java 21+**                         | The Firebase emulators run on Java    | `java -version` |
| Git                                  | —                                     | `git --version` |

On macOS, Java is `brew install openjdk@21`; follow the `sudo ln -sfn …` line Homebrew prints so `java` is found.

## 2. Set up the project

```sh
git clone https://github.com/jadeallencook/communalists.git
cd communalists
nvm install        # Node from .nvmrc (24.x)
corepack enable    # once per machine; provides the pnpm version pinned in package.json
pnpm install       # also installs the Firebase CLI and the git hooks
```

## 3. Run it

```sh
pnpm dev
```

That one command:

1. creates `.env.local` from `.env.example` if it's missing (nothing to fill in; see below);
2. starts the Firebase emulators (Auth, Firestore), or reuses ones already running, and adds the test accounts and organizations (below) if any are missing;
3. starts Next.js at **http://localhost:3000** (redirects to `/en`).

Stop it with **Ctrl-C**. The emulators save their data to `.emulator-data/` on the way out, so your test accounts are there next time. Pass Next options through: `pnpm dev --port 3001`.

While `pnpm dev` runs, every Firestore read is printed as `[firestore read #N] collection`, so you can see what a page costs.

**Try it:** click **Dev** in the bottom-right corner and pick a test account. You're signed in and on the dashboard in one click. (Or sign in normally as `maya.thompson@example.com` / `password123`.) To look inside the local database, open the emulator UI at http://127.0.0.1:4000.

### Test data

`pnpm dev` adds these whenever any are missing, along with dictionary words from any CSVs in `research/definitions/` (git-ignored, so only if you have the file; otherwise import one at `/admin/definitions/import`, see [features/19](features/19-dictionary.md#starter-words)). To put them back the way they started, use **Reset test data** in the dev toolbar, or run `pnpm seed` with the emulators running. The password for all of them is `password123`. A few test comments go on words that exist locally (mostly **Mutual Aid**), with up votes and one reported comment for `/admin/comments` ([features/20](features/20-comments.md)).

The toolbar lists these four first:

| Account                      | Profile                          | Organizations                                                                                                                               |
| ---------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `maya.thompson@example.com`  | Maya Thompson, San Jose, English | Owns South Bay Mutual Aid and Alum Rock Tenants Union; moderates Oakland Auto Club; member of Fremont Childcare Co-op                       |
| `luis.hernandez@example.com` | Luis Hernández, Oakland, Spanish | Owns Oakland Auto Club and Mutual Aid Disaster Network; member of South Bay Mutual Aid, East Bay Tool Library and Little Saigon Food Pantry |
| `sam.rivera@example.com`     | None: signs in to account setup  | None                                                                                                                                        |
| `jordan.lee@example.com`     | Jordan Lee, San Jose, English    | **Super user** (locally only): `/admin`, adds and edits unclaimed organizations and dictionary words, decides claims. Member of nothing     |

Under **More accounts** (collapsed) are eight more: Thanh Nguyễn, Wei Chen, Aisha Bello, Daniel Park, Rosa Martínez, Priya Patel, Marcus Johnson and Linh Trần. Between them they cover all four UI languages, own the four newer groups, and fill out member lists, so groups have between 3 and 8 members. Mark an account `"featured": true` in `seed-data.json` to list it at the top, and `"platformAdmin": true` to make it a super user locally (on top of any UIDs in `PLATFORM_ADMIN_UIDS`). To make your own local account a super user, add its UID to `PLATFORM_ADMIN_UIDS` in `.env.local` and restart. Emails use `example.com` and `example.net`, which are reserved and can never reach a real person.

Everyone except Sam has a username (`/comrade/maya-thompson`, or `/@maya-thompson`), and a few profiles cover each privacy level: Maya and Aisha are public (Aisha hides her groups), Luis and Thanh share with their groups, and Wei shows just her name. Sam's account setup asks for a username, suggested from the name.

| Organization                                                       | Shows off                                                                                                                         |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| South Bay Mutual Aid (`/organization/sbma`)                        | Local 25 mi, request to join, website, email, Instagram; 2 pending requests (Marcus, Priya) for Maya to approve; long description |
| Oakland Auto Club (`/organization/oakland-auto-club`)              | Local 50 mi, open joining, two moderators, public member list; Thanh is banned (with a reason in the log)                         |
| Alum Rock Tenants Union (`/organization/alum-rock-tenants`)        | Unlisted, invite only, member list shows just the count                                                                           |
| Mutual Aid Disaster Network (`/organization/disaster-network`)     | International reach; Maya has a pending request; long description                                                                 |
| East Bay Tool Library (`/organization/east-bay-tools`)             | Lending, Berkeley, open joining, English only                                                                                     |
| Fremont Childcare Co-op (`/organization/fremont-childcare`)        | Childcare, contact email only                                                                                                     |
| Santa Clara Community Garden (`/organization/sc-community-garden`) | Small radius (5 mi), English and Chinese                                                                                          |
| Little Saigon Food Pantry (`/organization/little-saigon-pantry`)   | One focus area, Vietnamese first                                                                                                  |
| Eastside Shower Day (`/organization/eastside-shower-day`)          | **Unclaimed** (added by Jordan); Priya has a pending claim for Jordan to approve or deny; long description                        |
| Westside Community Meal (`/organization/westside-community-meal`)  | **Unclaimed**, no requests: try claiming it                                                                                       |

The three long descriptions are there to test the four-line cut and **Read more** in the find page's details drawer.

- Seeding only touches these accounts and organizations (fixed IDs starting `seed-`), so anything you created yourself stays. If you took one of their handles, that organization is skipped. A seeded account or organization that's no longer in the file (say, after renaming one) is removed on the next seed or reset.
- Resetting doesn't sign you out. **Reset test data** also clears the app's cache; after `pnpm seed` from a terminal, restart `pnpm dev`, or pages can show cached data for a while.
- The data lives in `scripts/seed-data.json` (written by `scripts/seed.mjs`, and read by the dev toolbar), shaped to match what the app writes. Add to it when a feature needs something to look at, and update it when a data shape changes.

### Dev toolbar

The **Dev** button (bottom right, local development only) holds tools for working on the app:

- **Sign in as:** one click signs in as a test account and opens the dashboard. Switch accounts the same way.
- **Reset test data:** the same as `pnpm seed`, plus it clears the app's cache.
- **Emulator UI:** the local database and accounts.
- **Position:** move it to another corner (remembered in your browser). Next's own button is bottom left.

It only exists under `pnpm dev`, against the emulators, on a `demo-` project, and its actions refuse to run anywhere else ([tooling-and-ci → Dev toolbar](technical/tooling-and-ci.md#dev-toolbar)).

### Why `.env.local` needs nothing

It points everything at the emulators under a fake project, `demo-communalists`. The `demo-` prefix stops the emulators from contacting any real Google service, so no credentials are needed and production data is out of reach. The real Firebase values and the service-account key live only on Vercel. Don't put them in `.env.local`. [Accounts and Sessions → Local development](technical/accounts-and-sessions.md#local-development) has the details.

## 4. Find your way around

| Where                                               | What                                                                         |
| --------------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/app/[locale]/`                                 | Routes. Each route is a thin **container**: reads data, wires server actions |
| `src/components/{atoms,molecules,organisms,pages}/` | Presentational components: props in, markup out, no business logic           |
| `src/hooks/`                                        | Shared UI logic (form state, city search)                                    |
| `src/lib/`                                          | Domain logic, validation schemas, Firebase and session code                  |
| `messages/{en,es,vi,zh}.json`                       | Every UI string, in all four languages                                       |
| `documentation/`                                    | Product and technical docs (this file), also shown in Storybook              |

Browse every component, page and hook in isolation with `pnpm storybook` (http://localhost:6006), or online at [storybook.communalists.com](https://storybook.communalists.com).

## 5. Make a change

Read [`AGENTS.md`](../AGENTS.md) first; it's short and it's the rulebook. The rules people trip on most:

- **Read the feature's doc before building, and update docs in the same change.** The docs are living documents; a change isn't done until they match.
- **No business logic in components.** Put it in `src/lib/` or `src/hooks/`; containers in `src/app/` connect it.
- **Every new component, page or hook gets a story** in the matching Storybook category.
- **Every new string goes in all four message files.** A test fails if one is missing.
- **Signed-in pages call `requireAccount()`** in their container.
- **Validate every form and server input** with a shared Zod schema in `src/lib/validation/`.

Before you call something done:

```sh
pnpm lint && pnpm typecheck && pnpm test && pnpm format:check
```

## 6. Commit and ship

- Commits follow [Conventional Commits](https://www.conventionalcommits.org/): `feat(auth): …`, `fix: …`, `docs: …`. The `commit-msg` hook rejects anything else; the `pre-commit` hook lints and formats staged files.
- CI runs the same checks plus the production build on every push.
- **Pushing to `main` deploys to communalists.com.** The footer shows the commit it was built from, so you can confirm yours is live ([decision #46](decisions/046-footer-shows-commit-only-no-version-number.md)).

## Troubleshooting

| Symptom                                               | Fix                                                                                                                                                                                     |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[dev] The Firebase emulators need Java 21 or newer.` | Install Java 21+ (above), open a new terminal, run `pnpm dev` again                                                                                                                     |
| `[dev] Node X is running; .nvmrc asks for Y.`         | `nvm use`. It usually still works, but some packages need at least 24.15                                                                                                                |
| Sign-in says "Something went wrong" locally           | You ran `next dev` (or `pnpm dev:next`) without the emulators. Use `pnpm dev`                                                                                                           |
| `[seed] The emulators aren't running.`                | Start `pnpm dev` (or `pnpm emulators`) first, then `pnpm seed` in another terminal                                                                                                      |
| Your communalists.com account doesn't work locally    | Expected. Local uses its own emulator accounts: use a test account (`maya.thompson@example.com` / `password123`) or sign up locally                                                     |
| Test accounts disappeared                             | `pnpm seed` brings the built-in ones back. Stop with Ctrl-C (not `kill`) so the save finishes. Saves only happen through `pnpm dev` or `pnpm emulators`, not `firebase emulators:start` |
| `[dev] These emulator ports are in use…`              | Leftover emulators from a run that was killed. Run the `kill …` command it prints                                                                                                       |
| Port 3000 already in use                              | Another Next dev server is running. Stop it, or `pnpm dev --port 3001`                                                                                                                  |
| `pnpm` not found, or the wrong version                | `corepack enable`, then open a new terminal                                                                                                                                             |
| `pnpm install` refuses a package's build script       | pnpm 12 asks for each one. Allow or deny it in `pnpm-workspace.yaml` with a comment ([tooling-and-ci](technical/tooling-and-ci.md))                                                     |
| Works locally, fails on Vercel                        | Check `vercel logs`. Reproduce Vercel's module loading with `NODE_OPTIONS=--no-experimental-require-module` ([tooling-and-ci](technical/tooling-and-ci.md))                             |

## Next

- [Product vision](product-vision.md): what we're building
- [Architecture](technical/architecture.md): how the pieces fit
- [Accounts and sessions](technical/accounts-and-sessions.md): sign-up, sign-in, account setup, local Firebase
- [Decision log](decisions/README.md): why things are the way they are
