# Decision Log

Every meaningful product or technical choice made during the rebuild, newest first. Each entry records what we chose, what else we considered, and why, so a later change of direction starts from the full picture.

Add an entry when you choose a framework or library, change the data model, add or cut a feature, change a product rule, or go against something in these docs. If a decision replaces an earlier one, mark the old entry **Superseded by #N** rather than deleting it.

## Template

```md
### N. Short title — YYYY-MM-DD

**Status:** Accepted | Superseded by #N | Reverted
**Context:** What prompted this.
**Decision:** What we chose.
**Alternatives:** What else we considered, and why not.
**Consequences:** What this changes. Docs updated: …
```

## Decisions

### 10. Domains: communalists.com and storybook.communalists.com — 2026-11-21

**Status:** Accepted. Live 2026-11-21: `.com` serves the rebuild, `.org` and `www` redirect, Storybook is public.
**Context:** Before this, `communalists.com` (registered at Squarespace Domains, ex-Google Domains) 301-forwarded to `communalists.org`, which served the 2025 Next.js + Prismic site from Vercel at `www.communalists.org`. Email for `support@communalists.com` is forwarded through Squarespace's Mailgun preset.
**Decision:**

- **`communalists.com` (apex) is canonical.** `www.communalists.com` redirects to it.
- **`storybook.communalists.com`** is a second Vercel project from the same repo that builds Storybook. It's **public**.
- **`communalists.org` and `www.communalists.org` redirect to `communalists.com`**, keeping the path, once the new app is live. The 2025 site goes offline (code at `81eed51`).
- **Squarespace DNS:** remove only the "Domain Forwarding" preset (A `@` ×2, CNAME `www`). **Keep** the Email Forwarding preset (Mailgun MX + SPF), the `pic._domainkey` DKIM record, the Google verification CNAME and `_domainconnect`.
- Vercel is managed with the Vercel CLI (pinned 66.5.0, installed globally under Node 24.22.3).

**Alternatives:** `www` as canonical (Vercel's CNAME-friendly default); keeping the 2025 site on `.org`.
**Consequences:** `src/lib/site.ts` holds the canonical URLs, and `metadataBase` uses them. Support email is `support@communalists.com`, which settles the prototype's `.com`/`.org` mix.

### 9. Foundation scaffold choices — 2026-11-20

**Status:** Accepted
**Context:** Initializing the rebuild after decisions #3–#8. The user chose the 2025 monochrome look, pnpm, and ESLint/Prettier/commitlint, Vitest and Storybook from the first commit, with a foundation-only first pass.
**Decision:**

- **pnpm 12 via Corepack. Node pinned to 24.22.3 LTS in `.nvmrc`, minimum 24.15 in `engines`** (the oldest version jsdom 31 supports).
- **Next.js 16.4** with the template defaults `cacheComponents` and `partialPrefetching`. The locale is read through `next/root-params` (next-intl 4.15 deprecated `setRequestLocale` in its favor).
- **shadcn `radix-nova` preset** (Radix primitives, Lucide, Geist), neutral base. `--destructive` is the 2025 crimson `#a71d31`.
- **Geist** font: it covers Vietnamese, which the prototype's Albert Sans did not. CJK uses system fonts.
- **"Communalists" is never translated.** The prototype's Chinese rendering (公社主义者) reads close to "communists".
- **Storybook 10 (Vite builder) with the docs and a11y addons**, pinned to 10.6.7 so pnpm's minimum release age stays on.
- **Firestore rules deny everything**, and local development uses the `demo-communalists` emulator project.
- **Shell copy for es, vi and zh was written during scaffolding** and needs native-speaker review.

**Alternatives:** npm (what earlier attempts used), Storybook's Vitest/Playwright test integration (skipped because Playwright wasn't chosen), translating the brand name.
**Consequences:** See `technical/architecture.md`, `technical/tooling-and-ci.md` and `technical/design-system.md`. The prototype versions of those docs moved to `technical/prototype/`.

### 8. Locale routing from the first commit — 2026-11-20

**Status:** Accepted
**Context:** The public site serves English, Spanish, Vietnamese and Chinese speakers. The prototype kept the language in React state (reset on reload, invisible to search engines).
**Decision:** Scaffold `app/[locale]/…` with `next-intl` from day one, with locales `en`, `es`, `vi`, `zh`, seeded from `data/translations.json`.
**Alternatives:** English first and i18n later (faster start, but every route moves later).
**Consequences:** Every page and link is locale-aware from the start. Docs to follow: `features/05-localization.md`.

### 7. Services and events in Firestore, edited in the dashboard — 2026-11-20

**Status:** Accepted
**Context:** The prototype hard-coded events (every change needed a deploy). The 2025 attempt used Prismic for page content.
**Decision:** Services/events live in Firestore and are edited by moderators through an admin UI in the dashboard. Page copy and the FAQ live in the repo as translations. **No CMS.**
**Alternatives:** Prismic (a second data source to pay for and sync), repo-only content (needs a PR for every schedule change).
**Consequences:** The admin UI must exist before organizers can edit services. Until then, seed from `data/events.json`. Supersedes the Prismic approach in `technical/nextjs-prismic-attempt.md`.

### 6. Tailwind + shadcn/ui for the design system — 2026-11-20

**Status:** Accepted
**Context:** The prototype used Bootstrap + styled-components. The 2025 attempt tried Tailwind + shadcn, then switched to CSS modules (the reason wasn't recorded).
**Decision:** Tailwind v4 + shadcn/ui, with brand tokens as CSS variables in the theme.
**Alternatives:** Tailwind only inside shadcn components with CSS modules elsewhere (two systems), or Radix + CSS modules (continuing the 2025 direction).
**Consequences:** This reverses the 2025 move away from Tailwind. If the original reason resurfaces, record it here.

### 5. Host on Vercel — 2026-11-20

**Status:** Accepted
**Decision:** Deploy on Vercel, which the 2025 attempt also used. It has the best support for Next.js features (ISR, middleware, image optimization).

### 4. Firebase as the backend, same project, emptied — 2026-11-20

**Status:** Accepted
**Context:** The prototype used Firebase Auth, Firestore and Realtime Database without rules or indexes in the repo.
**Decision:** Keep the existing Firebase project, but empty its databases and start a new schema. Security rules and indexes live in the repo with emulator tests. Authorization runs on the server (Admin SDK in server actions and route handlers), never only in the UI.
**Alternatives:** Postgres (Supabase/Neon) is a better fit for relational data like memberships and audit logs. New Firebase projects. Migrating the old data.
**Consequences:** No legacy data to support. Export the old rules (and data, if wanted) before emptying. _Done 2026-11-20:_ production was backed up outside the repo (see `technical/data-model.md`), both databases were emptied, and deny-all rules were deployed for Firestore and Realtime Database. The relational sketch in `technical/data-model.md` needs a Firestore version.

### 3. Next.js (App Router) as the framework — 2026-11-20

**Status:** Accepted
**Context:** The goal is the full platform: public site plus volunteer dashboard.
**Decision:** Next.js App Router for both halves in one codebase.
**Alternatives:** Astro, which is better for a content-only public site, but the dashboard would become one big React island or a separate app.
**Consequences:** Resolves the open Astro vs Next.js question. See `technical/rebuild-plan.md`.

### 2. Reset `main` to docs only, removing the Next.js + Prismic attempt — 2026-11-20

**Status:** Accepted
**Context:** `main` held a second rebuild attempt (Next.js 15 + Prismic, 50 commits, Apr–Nov 2025) that covered only the public marketing shell. The docs had been written from the older prototype on another branch.
**Decision:** `main` holds only `AGENTS.md`, `CLAUDE.md` and `documentation/`. Both earlier codebases are removed from the working tree; their code stays in git history (prototype `7ebc168`, Next.js attempt `81eed51`).
**Alternatives:** Keep the Next.js app and add the docs next to it (keeps working pages, but carries over choices made before these docs existed).
**Consequences:** The rebuild starts from a blank slate. What the Next.js attempt taught is recorded in `technical/nextjs-prismic-attempt.md` and `features/15-little-free-library.md`. The framework choice is still open, though that attempt is evidence for Next.js + Prismic on the public side.

### 1. Preserve prototype discovery as living docs — 2026-11-20

**Status:** Accepted
**Context:** The React + Firebase prototype has a lot of tech debt and is being deleted before a rebuild in Astro or Next.js.
**Decision:** Record every feature, technical insight and known bug in `documentation/`, export the hard-coded data to JSON, and keep these docs up to date as the rebuild changes direction (see the methodology in `AGENTS.md`).
**Alternatives:** Keep the old repo as the reference (slow to search, and it describes the old design only). Start fresh with no record (loses the lessons, such as Firestore read costs and the security gaps).
**Consequences:** Every change must update the matching doc. `CLAUDE.md` symlinks to `AGENTS.md` so every agent reads the same instructions.
