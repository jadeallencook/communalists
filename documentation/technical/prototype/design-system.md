# Prototype: Design System

> **History.** This describes the 2022–2024 prototype (commit `7ebc168`). For the current setup, see [../design-system.md](../design-system.md).

A thin brand layer over Bootstrap 5: a dark page, a red accent, the Albert Sans font, and heavy headings.

## Tokens (`src/theme.css`)

| Token                                    | Value                                                      | Use                                                                     |
| ---------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| `--primary`                              | `#bc3737`                                                  | Buttons, links, modal titles, console log badge                         |
| `--white` / `--black`                    | `#fff` / `#000`                                            | Page text / modal text                                                  |
| Page background                          | `var(--bs-gray-900)`                                       | Dark theme everywhere                                                   |
| Secondary button                         | `var(--bs-gray-600)`                                       |                                                                         |
| `--spacing-small` / `-medium` / `-large` | 5 / 10 / 25 px                                             |                                                                         |
| Font                                     | **Albert Sans** (Google Fonts, weights 100, 200, 400, 800) | Everything                                                              |
| Headings                                 | `font-weight: 900`                                         | h1–h4 (note: weight 900 isn't loaded, so the browser fakes it from 800) |

Bootstrap is overridden with `!important` (all `button`s and `a` take the primary color). Tables use `variant="dark"`. The Organizations card uses `bg="danger"`.

## Responsive helpers

`.mobile-remove` / `.mobile-show` (≤ 576 px) and `.tablet-remove` / `.tablet-show` hide and show labels. Example: "Only Yours" shortens to "Yours"; "Request Received" shortens to "Received".

## Component conventions

- Every component and form is a folder: `index.tsx` + `style.ts`. The component is wrapped as `styled(Component)(style)` so it gets a `className`.
- `components/Template` is the scaffold to copy.
- Shared primitives: `Loading`, `Tooltip` (info icon + Bootstrap overlay), `Shared/Header` (hero with a background image), `CopyLinkButton`, and the `EventsTable` parts (`DayPagination`, `Time`, `Address`, `Tags`).

## Assets to keep

| File                                  | What                                       |
| ------------------------------------- | ------------------------------------------ |
| `src/assets/star.svg`                 | New brand mark (uncommitted)               |
| `src/assets/logo.png`                 | Old brand mark                             |
| `src/assets/network.png`              | Hero background                            |
| `src/assets/calendar.svg`, `info.svg` | Tooltip icons                              |
| `src/assets/eye.svg`                  | Unused                                     |
| Favicon                               | A base64 PNG inline in `public/index.html` |

**Copy `src/assets/` somewhere safe before deleting the repo.** These docs don't contain the image files.

## In the rebuild

Tailwind or CSS variables + CSS modules instead of Bootstrap + styled-components (styled-components needs extra setup with React Server Components). Keep the palette and the font. Load the heading weight you actually use. Fix contrast: `#bc3737` text on `gray-900` (`#212529`) is about 1.9:1, which fails WCAG even for large text (3:1). Use it as a button fill with white text, and use a lighter red for links on the dark background.
