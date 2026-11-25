# 013 · Presentational components, atomic folders, and a story for everything

**Date:** 2026-11-21
**Status:** Accepted
**Context:** The user may build a React Native app later and wants every page and component viewable in Storybook.
**Decision:** Business logic stays out of presentational components (it lives in `src/lib`, `src/hooks` and thin route containers). Components are grouped as atoms, molecules, organisms and pages. Every page, component and hook gets a story under Documentation, Components/Atoms, Molecules, Organisms, Pages, or Hooks. shadcn installs into `atoms/`.
**Alternatives:** Feature folders (`components/sign-up/…`); stories only for shared components.
**Consequences:** Pages are presentational views (`src/components/pages/`) that routes fill with data; server actions are passed in as props. Header and footer became synchronous so Storybook can render them. Rules are in `AGENTS.md` → "Components and Storybook".
