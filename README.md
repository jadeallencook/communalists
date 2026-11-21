# Communalists

Tools and resources for communities to build and sustain mutual aid networks, starting with organizers in the South Bay (Santa Clara County, CA), in English, Español, Tiếng Việt and 中文.

**Status:** rebuilding. The foundation (Next.js, i18n, Firebase wiring, shadcn/ui, tooling) is in place; features are next.

## Getting started

```sh
nvm install           # Node 24.22.3 (from .nvmrc)
corepack enable       # provides pnpm
pnpm install
cp .env.example .env.local
pnpm dev              # http://localhost:3000
```

For local Firebase, install the [Firebase CLI](https://firebase.google.com/docs/cli) and Java 21+, then run `pnpm emulators` alongside `pnpm dev`.

## Docs

- [`AGENTS.md`](AGENTS.md): how we work, conventions, and rules for contributors and AI agents
- [`documentation/`](documentation/README.md): every feature, technical decision and lesson from earlier versions
- [`documentation/decisions.md`](documentation/decisions.md): why things are the way they are
