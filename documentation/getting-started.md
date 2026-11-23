# Getting Started

From a fresh machine to a running app and your first change. You don't need a Firebase or Vercel account: local development runs against the Firebase emulators and never touches real data.

## 1. Install the prerequisites

| Tool                                 | Why                                   | Check           |
| ------------------------------------ | ------------------------------------- | --------------- |
| [nvm](https://github.com/nvm-sh/nvm) | Installs the Node version in `.nvmrc` | `nvm --version` |
| **Java 21+**                         | The Firebase emulators run on Java    | `java -version` |
| Git                                  | —                                     | `git --version` |

On macOS, install Java with `brew install --cask temurin@21` (a prebuilt JDK; macOS finds it without extra steps), then open a new terminal. Avoid `brew install openjdk@21`: on macOS versions Homebrew no longer builds bottles for (13 Ventura, as of 2026-11), it compiles from source and fails without the full Xcode app. Without Homebrew, the JDK 21 `.pkg` from [adoptium.net](https://adoptium.net) works the same way.

After installing nvm or Java, open a new terminal (or `source ~/.zshrc`). Shells that were already open won't find `nvm` or `java`.

## 2. Set up the project

```sh
git clone https://github.com/techletariats/communalists.git
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
2. starts the Firebase emulators (Auth, Firestore), or reuses ones already running;
3. starts Next.js at **http://localhost:3000** (redirects to `/en`).

Stop it with **Ctrl-C**. The emulators save their data to `.emulator-data/` on the way out, so your test accounts are there next time. Pass Next options through: `pnpm dev --port 3001`.

**Try it:** create an account at http://localhost:3000/en/sign-up, finish account setup (name, language, city), and you'll land on the welcome page. To look inside the local database, open the emulator UI at http://127.0.0.1:4000.

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
- **Pushing to `main` deploys to communalists.com.** The footer shows `v{version} ({commit})`, so you can confirm your commit is live. Bump `package.json` `version` only when a milestone ships ([decision #19](decisions.md)).

## Troubleshooting

| Symptom                                               | Fix                                                                                                                                                         |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[dev] The Firebase emulators need Java 21 or newer.` | Install Java 21+ (above), open a new terminal, run `pnpm dev` again                                                                                         |
| `[dev] Node X is running; .nvmrc asks for Y.`         | `nvm use`. It usually still works, but some packages need at least 24.15                                                                                    |
| Sign-in says "Something went wrong" locally           | You ran `next dev` (or `pnpm dev:next`) without the emulators. Use `pnpm dev`                                                                               |
| Your communalists.com account doesn't work locally    | Expected. Local uses its own emulator accounts; sign up locally                                                                                             |
| Test accounts disappeared                             | Stop with Ctrl-C (not `kill`), so the save finishes. Saves only happen through `pnpm dev` or `pnpm emulators`, not `firebase emulators:start`               |
| `[dev] These emulator ports are in use…`              | Leftover emulators from a run that was killed. Run the `kill …` command it prints                                                                           |
| Port 3000 already in use                              | Another Next dev server is running. Stop it, or `pnpm dev --port 3001`                                                                                      |
| `pnpm` not found, or the wrong version                | `corepack enable`, then open a new terminal                                                                                                                 |
| `pnpm install` refuses a package's build script       | pnpm 12 asks for each one. Allow or deny it in `pnpm-workspace.yaml` with a comment ([tooling-and-ci](technical/tooling-and-ci.md))                         |
| Works locally, fails on Vercel                        | Check `vercel logs`. Reproduce Vercel's module loading with `NODE_OPTIONS=--no-experimental-require-module` ([tooling-and-ci](technical/tooling-and-ci.md)) |

## Next

- [Product vision](product-vision.md): what we're building
- [Architecture](technical/architecture.md): how the pieces fit
- [Accounts and sessions](technical/accounts-and-sessions.md): sign-up, sign-in, account setup, local Firebase
- [Decision log](decisions.md): why things are the way they are
