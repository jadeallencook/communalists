# 076 · Graphics: an editor in steps, layouts as specs, pickers with pictures

**Date:** 2026-11-28
**Status:** Accepted
**Context:** The first version of /graphics ([#75](075-graphics-tool-templates-drawn-in-the-browser.md)) put every input on one page, and the user found it hard to get around. They also plan to add many more layouts (most of all), templates and colour sets. Each layout was hand-written arithmetic in `layout.ts`, and each choice was a radio list of names, and neither approach scales.
**Decision:**

- **Steps:** What's it for → Words → Photo and logo → Look. There's a step bar to jump around, plus Back and Next, and the last step ends with Save. The preview stays visible: above the steps on phones, to their left on wide screens, so focus order matches what people see. Less common words (details, host, QR link) fold under **More**.
- **Layouts are specs** (`LayoutSpec`, one file each in `src/lib/graphics/layouts/`): stacked regions (photo or words), bands, rules, decorations and a footer, with colours as roles. One engine fits every spec to every size. Tests run over every registered layout automatically: nothing leaves the page, nothing overlaps, no words sit on a photo or under a decoration, and every word passes 4.5:1 contrast in every colour set. A Storybook gallery shows every layout × size. The `add-graphic-layout` skill explains how to add one.
- **Layouts are shared, with suggestions:** any layout works with any template, and each template lists the layouts and colour sets it suggests first (its first ones are where it starts).
- **Pick by picture:** templates and layouts show small previews drawn with the person's own words, size and colours. Colour sets show swatches. Underneath they're native radio buttons, grouped under headings (Suggested for…, Words only, With a photo).
- Grew to seven layouts (Big words, Stripe, Centered, Framed, Reverse, Picture on top, Picture below) and twelve colour sets.

**Alternatives:**

- **Collapsible sections or tabs** instead of steps: the user chose steps. They're clearest on phones, one small screen at a time.
- **A visual layout builder** (a super-user page saving layouts to Firestore): later, if ever. It would write the same specs, so specs come first.
- **Keeping layouts as code functions:** full freedom, but each layout would be hand-written arithmetic that's hard to keep consistent or check.
- **Layouts per template:** each layout would serve only one kind of event. Shared layouts give more combinations from each one made.

**Consequences:** `TEMPLATES` now holds suggestion lists (`layouts`, `palettes`) instead of one layout and colour set. Layout names no longer have descriptions (the picture shows them). Specs can't yet place regions side by side or put text over a photo; those would be new spec options. Docs updated: [features/23](../features/23-graphics.md), `AGENTS.md`, the new `.claude/skills/add-graphic-layout` skill.
