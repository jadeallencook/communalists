# 075 · Graphics: templates drawn in the browser, at /graphics

**Date:** 2026-11-28
**Status:** Accepted
**Context:** The user wanted a Canva-like tool for flyers and social posts for mutual aid events (free stores, clothing swaps, protests, ICE watch…). It should be template-based, not free-form; need no account; work on phones; and save a picture to the device.
**Decision:**

- **Name:** the section is **Graphics** (`/graphics`; labels Diseños, Đồ họa, 设计), and the page headline is **"Make some propaganda"**. "Propaganda" stays out of the menu and URL: it doesn't say what the tool does, and in Vietnamese and Chinese it's tied to state messaging. "Flyers" was the first pick, but we dropped it because business cards, stickers and shirts are planned.
- **Editing is a form, drawing is a canvas.** People pick a template, fill in fields, and choose the size, layout, colour set and language. Nothing is dragged or resized: text shrinks to fit and photos fill their frame (people choose top, middle or bottom). Layout is pure, tested code; drawing uses the HTML canvas.
- **Everything stays on the device:** no uploads, no saved drafts, nothing in analytics about the content. Signed-in members can fill in from an organization through a server action that returns only public details (the logo as a data URL, so the canvas can export it).
- **First version:** six templates, three layouts that handle every size, six colour sets that pass contrast, five sizes (square, tall and story posts; Letter and A4 print at 300 dpi), a QR code made in the browser, suggested alt text, Save, and Share where the device supports it. Each size is data with `bleed` and `transparent` built in, for cards and stickers later.
- **New dependencies:** `qrcode-generator` 2.0.4 (MIT, no dependencies) and `@fontsource/anton` 5.3.0 (OFL, covers Vietnamese).

**Alternatives:**

- **Free-form editing (dragging and resizing on the canvas):** rejected. It's what the user wanted to avoid, and a canvas you drag on is very hard to make work with a keyboard or screen reader.
- **HTML-to-image libraries** (draw the graphic as HTML, then screenshot it): rejected. Fonts and Safari are unreliable, and print sizes are heavy.
- **Satori in the browser** (as the share cards do on the server): rejected for now. It adds a ~2 MB WebAssembly download for layouts that a few hundred lines of canvas code handle.
- **Rendering on the server:** rejected. People's photos and event details would leave their device.
- **Saving drafts in the browser:** rejected for now. On a shared computer, a left-behind draft could reveal where a protest is.
- **Separate hand-made designs per size:** rejected. Layouts are worked out from each size, so a new size doesn't multiply the work. The user noted sizes may need their own templates later; a layout can still branch on a size's shape.

**Consequences:** a new public section in the header (Graphics, after Dictionary), in the sitemap, and four analytics events. Docs updated: [features/23](../features/23-graphics.md), [features/13](../features/13-navigation-and-layout.md), [technical/analytics.md](../technical/analytics.md), [README](../README.md), `AGENTS.md`.
