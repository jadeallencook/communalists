# 055 · Marked words: hover shows the definition, a click opens its page

**Date:** 2026-11-26
**Status:** Accepted
**Context:** Phase 2 of the dictionary ([features/19](../features/19-dictionary.md)): underline some words on the homepage. Issue #140 planned a button that opens a popover on click. The user asked instead for the definition to show on hover, and a click to go to the word's page.
**Decision:**

- A marked word is a **link** to the word's page (`/dictionary/{slug}` since [decision #57](057-dictionary-at-slash-dictionary-with-a-to-z-letters.md)) with a dotted underline. Hovering **or keyboard focus** shows a tooltip (Radix, via the shadcn `Tooltip` atom) with the short definition. It's read as the link's description, stays open while hovered, and closes with Escape. Click, tap or Enter opens the page. Touch screens have no hover, so a tap goes straight to the page.
- The definitions come from `GET /api/definitions?locale=`, served from the cached word list with a 5-minute CDN cache, loaded by a hook only when a page has a marked word. The provider sits in the root layout, so any page can mark words.
- The homepage marks mutual aid networks, organization, mutual aid and tool library, in each language's own copy (rich-text tags).

**Alternatives:** the issue's click-to-open popover (one more step to reach the page, and the user preferred hover); hover only, with no keyboard focus (fails WCAG 1.4.13 and keyboard users); reading the definitions in the homepage's server container (the page is prerendered and the build can't read Firestore, so it would have to render per request).
**Consequences:** One small public request (`/api/definitions`) on pages with marked words, cached at the CDN. Editing a word can take up to 5 minutes to show in tooltips (its page updates at once). New analytics event `definition-open`. Docs updated: [features/19](../features/19-dictionary.md), [analytics](../technical/analytics.md), [accessibility](../technical/accessibility.md), `AGENTS.md`.
