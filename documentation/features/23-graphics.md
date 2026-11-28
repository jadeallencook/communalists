# 23 · Graphics: "Make some propaganda" (rebuild)

A free tool for making a flyer or social post for an event (a free store, clothing swap, protest, ICE watch, garden day or any event) from a template. People choose a template, fill in fields, maybe add a photo or logo, and save a PNG. It works without an account, and **everything happens in the browser**: nothing typed or added is sent to us. Designed with the user and **built 2026-11-28** ([decision #75](../decisions/075-graphics-tool-templates-drawn-in-the-browser.md)).

It's deliberately not Canva or Photoshop. Nothing is dragged or resized, because people tend to mess that up. Text shrinks to fit its space, and photos fill their frame.

## Name

The section is **Graphics** at `/graphics`. URLs stay in English; the menu label is translated as **Diseños**, **Đồ họa** and **设计** (not 图形, which means shapes; not _Gráficos_, which reads as charts in Spanish). The page's headline carries the voice: **"Make some propaganda"**. We kept "propaganda" out of the menu and URL because it doesn't say what the tool does, and in Vietnamese (_tuyên truyền_) and Chinese (宣传) it's tied to state messaging. "Flyers" was the first pick, but it would have boxed in the business cards, stickers and shirts planned for later.

## What people do

The editor is **four steps** ([decision #76](../decisions/076-graphics-steps-and-layout-specs.md)): a step bar at the top lets people jump to any step, and Back and Next move between them. The preview stays visible throughout: above the steps on phones (at most 40% of the screen), on the left beside them on wide screens. Moving to a step puts focus on its heading ("Step 2 of 4: Words").

1. **What's it for:** pick a template by its picture. Each picture is drawn with the template's own words. A template fills in a headline, a short line and the details (`Graphics.copy.templates` in the messages files), and starts with its first suggested layout and colour set.
2. **Words:** headline, short line, date, start and end times, and where (with a warning not to put a home address on a public graphic). Less common fields fold under **More**: details, "Hosted by", and a **link for a QR code** (printed under the code too, for people who can't scan). More opens by itself when the link isn't valid. Signed-in members can **fill in from their organization**: its name, a QR code to its page, its street address (only if Where is empty) and its logo. Signed out, the step offers "Sign in", with no dead end.
3. **Photo and logo**, both optional. Only layouts in the "With a photo" group show a photo. On any other layout the step says so and offers **Use a layout with a photo** (the template's photo suggestion). With a photo, people pick which part to keep (top, middle, bottom) rather than cropping.
4. **Look:** size, **layout**, **colours** and the **language on the graphic** (defaults to the page's). Layouts are picked by their pictures, drawn with the person's own words, colours and size. The template's suggestions come first ("Suggested for Free store"), then the rest, grouped as **Words only** and **With a photo**. Colours are swatches, suggestions first. The step ends with **Save image** (and **Share** on devices that can share files), as does the panel under the preview.

Changing the template or language replaces the words the template filled in, never words the person changed. Choosing a layout or colours by hand stops later template changes from overriding them. The **alt text** (every word on the graphic, in reading order) folds away under the preview, with a Copy button.

If text can't fit even at its smallest size, its end is cut with "…" and the preview says which fields to shorten, or suggests a bigger size.

## Sizes, layouts and colours

- **Sizes:** square post 1080×1080, tall post 1080×1350, story 1080×1920, and print at 300 dots per inch: Letter 2550×3300 and A4 2480×3508.
- **Layouts are specs, not drawing code** ([decision #76](../decisions/076-graphics-steps-and-layout-specs.md)). Each is a small `LayoutSpec` in `src/lib/graphics/layouts/`: full-width **regions** stacked from the top (a photo, or words stacked from the top, from the bottom or centred), optional **bands**, **rules** and **decorations** (rectangles, circles, a frame), a **footer** band, and colours given as **roles** (`background`, `text`, `accent`, `onAccent`), never hex values. The engine fits them to every size: text shrinks to fit, crowded columns close up their gaps, and a photo gives up height (down to its region's minimum) before any text is cut. Today: **Big words, Stripe, Centered, Framed, Reverse** (words only) and **Picture on top, Picture below** (with a photo). How to add one: the `.claude/skills/add-graphic-layout` skill.
- **Automatic checks for every layout** (`graphics.test.ts`): at every size, with and without a photo, nothing leaves the page, words never overlap or sit on a photo or under a decoration, the sample text fits, every word shows, and every word passes contrast (4.5:1) against what's behind it **in every colour set**. The **GraphicGallery** story draws every layout at every size with full, minimal, long and Chinese text.
- **Colour sets (12):** Paper and red, Black and yellow, Green and gold, Sky blue, Rose, Sunshine, Mint, Clay, Grape and orange, Ocean, Forest and lime, Hot pink. Each has to pass the contrast test to be added.
- **Templates suggest, they don't restrict:** each template lists its best layouts and colour sets (`TEMPLATES` in `templates.ts`). Every layout works with every template.

**Thumbnails** for the pickers are drawn only on the steps that show them, 250 ms after typing pauses, at 280px, as small JPEGs.

**Planned, not built:** business cards, stickers and shirts. Each size is data (`src/lib/graphics/formats.ts`) with `bleed` (a margin past the cut line) and `transparent` (no background) already drawn correctly, so adding one is a new size plus checking the layouts. PDF export and CMYK colour wait until someone sends files to a printer. Template artwork (illustrations, stock photos) will come later; when it does, each picture needs its licence and credit recorded next to it.

## How it works

- **Pure layout** (`src/lib/graphics/`, tested): `layoutGraphic` measures text with a function it's given, wraps and shrinks it (`fitText`; Chinese can break between any characters, other words split only when wider than the line), and returns shapes. `render.ts` draws them on a canvas. The preview is drawn at most 1350px on its longest side; the saved file is drawn full size into an offscreen canvas.
- **The file is made ahead of time**, 300 ms after typing stops, so Share can open on the press (browsers only allow sharing right after a press). Save and Share are dimmed and say "Getting the preview ready…" until it's made.
- **Fonts are bundled** (`@fontsource`: Anton for headlines, which covers Vietnamese; Noto Sans and Noto Sans SC), imported only on this page, and loaded before measuring. No text goes to a font service. A Chinese headline uses heavy Noto Sans SC, since Anton has no Chinese.
- **Dates and times** come from the date and time inputs and are written out in the graphic's language with `Intl`, treated as wall-clock time (formatted as UTC, never shifted). Minutes show only when needed ("10 AM – 2 PM", "6:30 – 8:00 PM").
- **QR codes** are made in the browser (`qrcode-generator`), always black on white with their quiet zone. Links without `https://` get it added; anything that isn't an http(s) link is refused with a message.
- **Pictures stay in memory.** They're decoded in the browser (EXIF orientation applied), never uploaded or stored, and the PNG drawn from a canvas carries no EXIF data such as GPS location. Drafts aren't saved either. On a shared computer, nothing stays behind after the tab closes.
- **Fill in** is a server action (`graphicOrganizationAction`): it checks the person is an active member, reads the cached organization, and returns its public details. The logo comes back as a `data:` URL, because drawing a Firebase Storage image straight onto a canvas would need CORS on the bucket and would block the export. If the logo can't be read, the rest still fills in. The person's organizations stream in behind `<Suspense>`; if they can't be read, the control isn't shown and the rest of the page works (decision #68).

## Accessibility

- All editing is in labelled form controls (radios, inputs, buttons). Nothing on the canvas is interactive. Picture pickers are native radio buttons named by their text (the pictures are decorative), with a check and a thicker border on the chosen one, not colour alone. The preview canvas is `role="img"`, described by the alt text box.
- Choosing a photo is a real button. Removing it moves focus back to "Change photo". Results ("Photo added.", "Saved free-store-square.png.") are announced in `role="status"`, and failures in `role="alert"`.
- The preview comes before the steps in the page, above them on phones and to their left on wide screens, so focus order matches what people see. Steps are buttons in a `nav` with `aria-current="step"`.
- The graphic itself is readable: every colour set passes contrast, text never goes over a photo, and the QR code's link is printed in words.

## Search and link previews

The title is **"Free Flyer Maker for Protests and Mutual Aid"**, the words people search for, while the page's headline keeps "Make some propaganda". It has a description and keywords in each language, `WebApplication` structured data (free, runs in the browser), a place in the sitemap, and its own link-preview card: three sample flyers and the headline, in the page's language ([technical/seo.md](../technical/seo.md)).

## Analytics

`graphic-template` (which template), `graphic-save` (template, size, layout, and download or share), `graphic-fill` and `graphic-copy-alt`. Never what the graphic says, who made it, or for which organization: a protest flyer's details are nobody's business ([technical/analytics.md](../technical/analytics.md)).

## Code

Pure: `src/lib/graphics/` (formats, palettes, templates and suggestions, text fitting, dates, links, QR, the layout spec format and engine, layouts in `layouts/`, alt text; tests in `graphics.test.ts`) and `render.ts` (canvas). Hook: `src/hooks/use-graphic-editor.ts` (state, steps, preview, the pickers' thumbnails, saved file). UI: `GraphicEditor` (steps, with `FillFromOrganization`), `StepBar`, `ThumbnailChoice`, `GraphicPreview`, `GraphicsPage`, and `GraphicGallery` (Storybook only). Container: `src/app/[locale]/graphics/`. Action: `src/app/actions/graphics.ts`.
