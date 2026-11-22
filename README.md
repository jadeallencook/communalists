# Communalists

A platform for mutual aid networks. Anyone can sign up, create or join organizations, and run them with tools built for mutual aid: requests, a lending library, calendars, documents. Available in English, Español, Tiếng Việt and 中文.

**Status:** rebuilding. Accounts are live at [communalists.com](https://communalists.com) (sign-up, sign-in, password reset, account setup); organizations and tools are next.

## Getting started

You need:

- **Node 24** via [nvm](https://github.com/nvm-sh/nvm) (the exact version is in `.nvmrc`; at least 24.15)
- **Java 21+**, for the Firebase emulators (`brew install openjdk@21` on macOS)
- Git

No Firebase or Vercel account is needed. Local development runs against the Firebase emulators with a fake project (`demo-communalists`) and never touches real data.

```sh
nvm install           # Node from .nvmrc
corepack enable       # once; provides pnpm at the pinned version
pnpm install
pnpm dev              # creates .env.local, starts the emulators and Next → http://localhost:3000
```

Full walkthrough and troubleshooting: [`documentation/getting-started.md`](documentation/getting-started.md).

Create a test account at `/en/sign-up`. It's kept in `.emulator-data/` between runs; stop `pnpm dev` with Ctrl-C so it saves. Emulator UI: http://127.0.0.1:4000.

Other commands: `pnpm storybook` (components and docs, port 6006), `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm format`. Commits must follow [Conventional Commits](https://www.conventionalcommits.org/); git hooks lint, format and check the message. Details: [`documentation/technical/tooling-and-ci.md`](documentation/technical/tooling-and-ci.md).

## Docs

- [`AGENTS.md`](AGENTS.md): how we work, conventions, and rules for contributors and AI agents
- [`documentation/`](documentation/README.md): every feature, technical decision and lesson from earlier versions
- [`documentation/decisions.md`](documentation/decisions.md): why things are the way they are
