# 009 · Foundation scaffold choices

**Date:** 2026-11-20
**Status:** Accepted
**Context:** Initializing the rebuild after decisions [#3](003-nextjs-app-router-framework.md)–[#8](008-locale-routing-from-first-commit.md). The user chose the 2025 monochrome look, pnpm, and ESLint/Prettier/commitlint, Vitest and Storybook from the first commit, with a foundation-only first pass.
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
