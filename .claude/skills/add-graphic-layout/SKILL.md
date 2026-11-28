---
name: add-graphic-layout
description: Add a new layout, colour set or template ("What's it for") to the graphics tool at /graphics ("Make some propaganda"). Covers the layout spec format in src/lib/graphics/layouts/, the names in all four messages files, template suggestions, the automatic tests and the Storybook gallery. Use when asked to create, design, add or change a graphics layout, colour theme or template.
---

# Add a graphics layout, colour set or template

Background: `documentation/features/23-graphics.md` and decisions #75–#76. If this file and that doc disagree, the doc wins: fix this file.

Layouts are **data, not drawing code**. A layout is a `LayoutSpec` (`src/lib/graphics/layout-spec.ts`). The engine (`src/lib/graphics/layout.ts`) turns it into shapes for any size and handles fitting text, shrinking photos and the footer (host, logo, QR code). Only change the engine when a design truly needs something specs can't say, and then add it as a new spec option that every layout can use.

## A layout

1. **Talk it through first.** Ask what it should look like (or work from a sketch or screenshot the user gives), and say which spec pieces you'll use. If it needs something specs can't do yet (side-by-side regions, text over a photo, rotated text, icons), say so and suggest the closest version, or propose a new spec option.
2. **Write `src/lib/graphics/layouts/{name}.ts`** exporting one `LayoutSpec`, with a one-line comment saying what it looks like. The building blocks:
   - `regions`: full-width bands stacked from the top down to the footer. Each has a `height` (share of the space; one region can be `'rest'`; use `{ default, square, story }` when shapes need different shares), an optional `fill` colour, and either `photo: true` (with `minHeight`) or words: `start` (stack down from the top), `end` (stack up from the bottom), or `center`.
   - Blocks: text `{ role, color, band?, align?, scale? }` (roles `tagline`, `title`, `when`, `place`, `details`) or a rule `{ rule: color, width?, align? }`. Every layout must show all five roles, both with and without a photo.
   - `withoutPhoto`: required when a region has a photo. That's the layout without a photo (usually a colour block in its place).
   - `decorations`: `rect`, `circle` (positions as shares of width and height) or `frame` (a border). Keep them out from under the words.
   - `footer: { fill?, color? }`, `background`, `margin`.
   - **Colours are roles, never hex:** `background`, `text`, `accent`, `onAccent`. Pairs that are always readable are `text` on `background` (or the reverse), `accent` on `background` (or the reverse), and `onAccent` on `accent`. Never put words on a photo.
3. **Register it** in `src/lib/graphics/layouts/index.ts`. The key is permanent (analytics and file names use it), kebab-case.
4. **Name it** under `Graphics.layout.options.{key}` in `messages/en.json`, `es.json`, `vi.json` and `zh.json`. Short and plain ("Picture below"), translated, not left in English.
5. **Suggest it** from the templates it suits (`TEMPLATES[...].layouts` in `src/lib/graphics/templates.ts`). The first suggestion is where a template starts, so only put it first on purpose.
6. **Check it:**
   - `pnpm test src/lib/graphics`: every layout at every size, with and without a photo, must stay on the page, never overlap words, never cut text with the sample content, keep decorations off the words, and pass contrast for every colour set.
   - `pnpm storybook` → **Components/Organisms/GraphicGallery**: look at every size, and switch Controls to long text, Chinese and minimal content and to a few dark and light colour sets.
   - Then the usual `pnpm lint`, `pnpm typecheck`, `pnpm format:check`.
7. **Update the docs:** the layouts list in `documentation/features/23-graphics.md`. A new spec option also gets a line in the doc and a decision file.

## A colour set

Add it to `PALETTE_KEYS` and `PALETTES` in `src/lib/graphics/palettes.ts` (four colours: `background`, `text`, `accent`, `onAccent`), plus a name under `Graphics.palette.options` in all four messages files. The tests reject it unless `text` and `accent` each reach 4.5:1 on `background`, and `onAccent` reaches 4.5:1 on `accent`. Add it to the suggestions of templates it suits.

## A template ("What's it for")

Add the key to `TEMPLATE_KEYS` and `TEMPLATES` (suggested layouts and colour sets, best first) in `src/lib/graphics/templates.ts`. Then, in all four messages files, add:

- `Graphics.templates.{key}`: the `label` and `description` people pick from.
- `Graphics.copy.templates.{key}`: the words it starts with: `name` (lower-case, for the alt text), `title`, `tagline`, `details`.

Keys are permanent. Suggest translations yourself, and point out wording that's sensitive (legal or safety topics, like ICE watch) for the user to have checked by native speakers.
