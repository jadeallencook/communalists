# Design System

shadcn/ui on Tailwind CSS 4, with the **monochrome** look from the 2025 attempt: black and white primaries, neutral greys, a crimson for destructive actions, light and dark modes, and the star logo. The prototype's red, Bootstrap-based system is in [prototype/design-system.md](prototype/design-system.md).

## Setup

| Setting       | Value                                                         |
| ------------- | ------------------------------------------------------------- |
| shadcn style  | `radix-nova` (Nova preset: Lucide icons, Geist font)          |
| Primitives    | Radix UI (`radix-ui` package)                                 |
| Base color    | `neutral`                                                     |
| Tokens        | CSS variables in `src/app/globals.css`, in OKLCH              |
| Dark mode     | `.dark` class via `next-themes` (light / dark / system)       |
| Icons         | `lucide-react`                                                |
| Class merging | `cn` package (shadcn's replacement for clsx + tailwind-merge) |
| Config        | `components.json`                                             |

Add components with `pnpm dlx shadcn@latest add <name>`. They're copied into `src/components/ui/` and are ours to edit.

## Tokens that differ from shadcn's defaults

| Token           | Value                              | Why                                                                                                       |
| --------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `--destructive` | `oklch(0.475 0.171 19.96)` (light) | The 2025 brand crimson `#a71d31`                                                                          |
| `--font-sans`   | Geist, then CJK system fonts       | Geist covers Latin and **Vietnamese**; Chinese falls back to PingFang SC / Noto Sans SC / Microsoft YaHei |

Everything else is shadcn's neutral palette, which already matches the 2025 monochrome direction.

## Typography and languages

- **Geist** is loaded with the `latin`, `latin-ext` and `vietnamese` subsets. The prototype's Albert Sans has **no Vietnamese subset**, so Vietnamese diacritics fell back to another font mid-word. Check any new font for Vietnamese support.
- Chinese uses system fonts. A webfont for CJK is several MB, so don't add one without measuring.
- `<html lang>` follows the locale, so browsers pick the right CJK glyph variants.

## Storybook

`pnpm storybook` shows every `*.stories.tsx`. The toolbar switches **Locale** (all four) and **Theme** (light/dark). The a11y addon reports accessibility violations in its panel. Tailwind reaches Storybook through `@tailwindcss/vite` (see `tooling-and-ci.md`). Geist is loaded in `.storybook/preview.tsx` because the app loads it in its layout, which Storybook doesn't render. Its CSS variables go on `<html>`, not on a story wrapper, because Radix portals dropdowns, dialogs and tooltips to `<body>`; on a wrapper they render in serif. Storybook's `next/font` shim injects it at runtime from Google Fonts. Async Server Components (header, footer) aren't rendered in Storybook; their client-side controls are.

## Known issues

- **Dev-only console error: "Encountered a script tag while rendering React component."** `next-themes` 0.4.6 (latest, last published 2025-03) renders an inline `<script>` that React 19 warns about on client render. It's harmless: the script runs from the server HTML, so the theme still applies with no flash. Revisit if next-themes ships a fix, or replace it with a small in-house theme script.

## Open questions

- A refreshed logo / wordmark (currently the 2025 star favicon and a text wordmark).
- Whether to keep Geist for headings, or bring back a display font (it must support Vietnamese).
