# 006 · Tailwind + shadcn/ui for the design system

**Date:** 2026-11-20
**Status:** Accepted
**Context:** The prototype used Bootstrap + styled-components. The 2025 attempt tried Tailwind + shadcn, then switched to CSS modules (the reason wasn't recorded).
**Decision:** Tailwind v4 + shadcn/ui, with brand tokens as CSS variables in the theme.
**Alternatives:** Tailwind only inside shadcn components with CSS modules elsewhere (two systems), or Radix + CSS modules (continuing the 2025 direction).
**Consequences:** This reverses the 2025 move away from Tailwind. If the original reason resurfaces, record it here.
