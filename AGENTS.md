# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository.

## Project

Communalists is a **platform for mutual aid networks**: anyone can sign up, create or join **organizations** (e.g. "South Bay Mutual Aid", "Oakland Auto Club"), and run them with **tools** built for mutual aid (requests + kanban, a lending library, calendars, documents…). Each tool can have a public side and a members-only side, and each organization gets a public page at `{slug}.communalists.com`. It's like Facebook Groups, with purpose-built tools instead of a feed. The UI is in English, Spanish, Vietnamese and Chinese. Read `documentation/product-vision.md` first.

Two earlier codebases came first: a React + Webpack + Firebase prototype (2022–2024, commit `7ebc168`) and a Next.js + Prismic marketing shell (2025, commit `81eed51`). Both were removed, and the repo now starts from these docs. The rebuild uses **Next.js (App Router) + Firebase + Tailwind/shadcn/ui, hosted on Vercel, with locale routing (`en`, `es`, `vi`, `zh`) from day one**. See `documentation/decisions.md` #3–#8. What both attempts taught is kept in `documentation/`.

## Working methodology

The prototype was for discovery, and so is the rebuild. We expect to change direction, reverse earlier calls, and try things the prototype never did. The docs make that safe: each new choice is made knowing what came before and why.

**Keeping the docs current is a core part of the work, not a cleanup step afterward.** A change isn't done until the docs match it.

1. **Read first.** Before working on a feature, read its doc and any technical doc it touches (table below). Start from what we already learned.
2. **Treat docs as guidance, not law.** The prototype's choices are a starting point. If the user picks a different direction, follow the user and update the docs to match. Don't argue for the old design just because it's written down. Do point out anything in the docs that suggests the new direction could repeat a known mistake.
3. **Update in the same change.** When a feature, data shape, rule, dependency or decision changes, edit the matching doc in the same commit or PR. Don't leave a doc describing behavior that no longer exists.
4. **Write down what you learn.** If you hit a non-obvious constraint, a bug's root cause, a library quirk, a cost or performance finding, or a user preference about how the product should work, add it to the relevant doc. If nothing fits, create a new one. If it would have saved you time, it belongs in the docs.
5. **Log decisions.** Every meaningful choice gets an entry in `documentation/decisions.md`: what we chose, what we considered, and why. That covers picking a framework, dropping a feature, changing the data model, or going against something in these docs.
6. **Keep history, don't erase it.** When the rebuild replaces a prototype behavior, rewrite the doc to describe the **current** behavior. Keep the old approach in a short "Prototype" note when the lesson still matters. Delete only what is truly obsolete.
7. **Fix stale docs on sight.** If you notice a doc that's wrong, outdated, or missing a link, fix it now, even if it isn't part of your task. Mention it in your summary.
8. **Say what you changed.** At the end of a task, list the docs you created or updated, or say plainly that none needed changes.

Docs describe _what_ and _why_. Leave the line-by-line _how_ to the code, and don't duplicate it there.

## Read before you build

`documentation/` is the source of truth for product behavior and lessons learned. Start with `documentation/README.md`. The same docs are browsable in Storybook (`pnpm storybook`, or storybook.communalists.com) under **Documentation**. Storybook generates those pages from the `.md` files, so only ever edit the `.md` files.

| Need                               | Read                                                                               |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| What a feature must do             | `documentation/features/NN-*.md`                                                   |
| Data shapes and enums              | `documentation/technical/data-model.md`, `documentation/data/enums.json`           |
| Known bugs to avoid repeating      | `documentation/technical/tech-debt.md`                                             |
| Firebase cost and security lessons | `documentation/technical/firebase.md`                                              |
| How the rebuild is put together    | `documentation/technical/architecture.md`, `tooling-and-ci.md`, `design-system.md` |
| Vercel projects, domains, DNS      | `documentation/technical/deployment.md`                                            |
| Framework choice and build order   | `documentation/technical/rebuild-plan.md`                                          |
| Seed data                          | `documentation/data/events.json`, `documentation/data/translations.json`           |
| Choices already made, and why      | `documentation/decisions.md`                                                       |

## Codebase

| Path                                                      | What                                                                                                                                                                                                              |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/[locale]/`                                       | All pages. The root layout lives here, so every route is locale-prefixed                                                                                                                                          |
| `src/i18n/`                                               | `routing.ts` (locales), `navigation.ts` (use its `Link`/`useRouter`), `request.ts`                                                                                                                                |
| `messages/{en,es,vi,zh}.json`                             | Translations. Add every key to all four; a test enforces it                                                                                                                                                       |
| `src/components/{atoms,molecules,organisms,pages}/`       | Presentational components by size (see "Components and Storybook"). shadcn installs into `atoms/`                                                                                                                 |
| `src/hooks/`                                              | Shared UI logic (`useSignUpForm`)                                                                                                                                                                                 |
| `src/assets/`                                             | Images imported by components (`import x from '@/assets/x.jpg'`). Use `public/` only for files that need a fixed URL; `src/app/icon.png` / `opengraph-image.png` for app icons; Firebase Storage for user uploads |
| `src/lib/auth/`, `src/lib/users.ts`                       | Session cookies and user profiles (server-only); see `documentation/technical/accounts-and-sessions.md`                                                                                                           |
| `src/lib/firebase/`                                       | `client.ts` (browser) and `admin.ts` (server-only; bypasses rules)                                                                                                                                                |
| `src/proxy.ts`                                            | Locale redirects (Next 16's name for middleware)                                                                                                                                                                  |
| `firestore.rules`, `database.rules.json`, `firebase.json` | Deny-all rules (deployed to production 2026-11-20) and emulator config. Deploy rules with `firebase deploy --only firestore:rules,database --project communalists`                                                |

Commands: `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format`, `pnpm build`, `pnpm storybook`, `pnpm emulators`. Run `lint`, `typecheck`, `test` and `format:check` before saying a change is done. Details are in `documentation/technical/tooling-and-ci.md`.

**Next.js 16 is newer than most training data.** Before using a Next.js API you're unsure of, read the bundled docs in `node_modules/next/dist/docs/`. Known differences: `proxy.ts` replaces `middleware.ts`; Cache Components needs `generateStaticParams` for root params; read the locale with `next/root-params`, not `setRequestLocale`. See `documentation/technical/architecture.md`.

**pnpm 12:** don't add `minimumReleaseAgeExclude` entries; pin an older version instead. New build scripts must be explicitly allowed or denied in `pnpm-workspace.yaml`, with a comment saying why.

## Components and Storybook

Two rules for all UI work (set by the user 2026-11-21, decision #13):

1. **No business logic in presentational components.** They take props and render, nothing else: no data fetching, server actions, sessions, Firebase, or validation rules. Logic lives in `src/lib/` (domain code with no React or Next imports, so a future React Native app can reuse it), `src/hooks/` (shared UI logic), and thin **containers** in `src/app/` that fetch data, wire actions, and render a page. Pass server actions in as props (`formAction`, `signOutAction`); never import them into `src/components/`.
2. **Every new page or component gets a story**, in one of these Storybook categories (the sidebar enforces the order):

| Storybook title          | Folder                        | What goes there                                                            |
| ------------------------ | ----------------------------- | -------------------------------------------------------------------------- |
| `Documentation/…`        | `documentation/`, `AGENTS.md` | Generated from the `.md` files; never write these stories by hand          |
| `Components/Atoms/…`     | `src/components/atoms/`       | Smallest building blocks: the shadcn primitives (`shadcn add` writes here) |
| `Components/Molecules/…` | `src/components/molecules/`   | A few atoms with one job: `FeatureCard`, `LocaleSwitcher`                  |
| `Components/Organisms/…` | `src/components/organisms/`   | Page sections: `SiteHeader`, `HeroBanner`, `SignUpForm`                    |
| `Pages/…`                | `src/components/pages/`       | Whole-page views. Routes render them with real data; stories use mocks     |
| `Hooks/…`                | `src/hooks/`                  | A demo component showing the hook's states, with mocked dependencies       |

Story conventions: put `Name.stories.tsx` next to the component, cover the important states (empty, error, loading, long text), use `parameters: { layout: 'fullscreen' }` for full-width pieces, and use `fn()` from `storybook/test` for actions. Components must be synchronous (use `useTranslations`, not `await getTranslations`), because Storybook can't render async Server Components.

## Current product rules

These are the rules we're building to today. They can change. When one does, update it here, update the feature doc, and log it in `documentation/decisions.md`.

- **Multi-tenant:** every piece of tool data belongs to exactly one organization. Scope every query, rule and server check by organization and by the user's membership role.
- **Open sign-up, gated data:** anyone can create an account and an organization. Being signed in grants nothing inside an organization; membership and role do.
- **Public vs internal:** each tool declares what is public (anyone, signed out included) and what is members-only. Default to members-only.
- **Languages:** `en`, `es`, `vi`, `zh` for the UI. Organization content (names, pages, items) is written by users and isn't translated. A form's language field should default to the visitor's UI language.
- **Access checks run on the server or in security rules, never only in the UI.**
- **Privacy:** tools like Requests collect names, phone numbers, addresses and health conditions. Never expose them publicly, never log them, and collect no personal fields without a clear use. The prototype removed unused fields on purpose (`documentation/features/14-removed-experiments.md`).
- **Shared devices:** clear any cached organization data on sign-out.
- **Requests tool** (from the prototype): pipeline `submitted` → `started` → `ready` → `complete`, plus `cancelled`; oldest first; intake can be paused without a deploy, and it fails closed.

## Engineering conventions

- TypeScript in strict mode. Validate every form and every server input with a shared schema.
- Commits follow **Conventional Commits** (`feat:`, `fix:`, `chore(scope):`), enforced by commitlint.
- Format with Prettier: 4 spaces, single quotes, semicolons, ES5 trailing commas.
- CI must check lockfile drift, formatting, types, lint, tests and build. Keep the lockfile committed and pin Node in `.nvmrc`.
- Define path aliases once, in `tsconfig.json`.
- Write tests for date and time logic (event open/closed in `America/Los_Angeles`), filtering and phone formatting. These were the buggy areas before.
- Keep security rules or database policies, and indexes, in the repo, with tests.

## Git

- **Never commit or push.** Leave every change uncommitted in the working tree; the user reviews, commits and pushes. Switching branches is fine, but never discard uncommitted work to do it.
- When a task is done, summarize what is ready to commit (files and a suggested Conventional Commit message).

## Don't

- Don't use hash routing or a client-only SPA for public pages. They need real, crawlable, locale-prefixed URLs.
- Don't hard-code content organizers need to edit (services or events, FAQ). Keep it in a DB or CMS.
- Don't duplicate the request and donation stacks. Model them as one case entity with a `type`.
- Don't commit secrets. Firebase web config is public, but service-account keys and env files are not.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
