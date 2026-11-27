# Accessibility

**Accessibility is the top priority for everything we build** (set by the user 2026-11-23, [decision #29](../decisions/029-accessibility-top-priority.md)). Many people who use mutual aid have a disability: low vision, blindness, motor or tremor, deafness, cognitive or learning disabilities, chronic illness and fatigue. Many are older, on an old phone, or reading in a second language. If they can't use a tool, it isn't doing its job. A change isn't done until it meets this page.

**The floor is [WCAG 2.2](https://www.w3.org/TR/WCAG22/) level AA.** Where AAA is cheap (larger targets, plainer language), do it.

## Checklist for every page and component

**Keyboard and focus**

- Everything works with a keyboard alone, in a sensible order, with a **visible focus ring** (don't remove outlines; the shadcn atoms already show one).
- Dialogs trap focus, close with Escape, and return focus to what opened them (Radix does this; keep using the `dialog` atom).
- **After an action, put focus somewhere sensible.** If the thing you acted on disappears (an approved request, a removed member), move focus to the result message or the list heading, not the top of the page.
- No keyboard traps, no hover-only controls.

**Screen readers**

- Use real elements: `button` for actions, `a` for navigation, `label` for every field, `fieldset`/`legend` for groups, headings in order (one `h1`).
- **Every control has a name that makes sense on its own.** Buttons repeated per row name their target: "Remove Luis Hernández", not just "Remove" (visible text can stay short; add `aria-label`).
- Decorative icons and avatars are `aria-hidden`. Icon-only buttons have an `aria-label`.
- **Changes are announced:** results and confirmations in `role="status"`, errors in `role="alert"` and linked to their field (`aria-invalid`, `aria-describedby`). Live-updating results say how many there are now.
- The page language is set (`<html lang>`, per locale). User-written content may be in another language; that's accepted for now.

**Seeing**

- Text contrast **4.5:1** (3:1 for large text and for borders of controls and focus rings), in **both light and dark** themes. Small labels on a `bg-muted` chip use `text-foreground`, not `text-muted-foreground` (4.35:1 in light, too low).
- **Never rely on colour alone, including to show something is clickable.** Every action button has a visible border or fill: use `outline` (or `default`/`destructive`), not `ghost`, for actions in page content. Destructive actions get a red outline. `ghost` is only for the header's navigation and icon buttons.
- **Controls use the `control` colour for their edges** (`border-control`: outline buttons, inputs, textareas, selects, checkboxes, filter chips), which is ≥ 3:1 in both themes. `border` stays soft for decorative lines (cards, dividers). The focus ring (`--ring`) is solid and ≥ 3:1.
- Works at **200% zoom** and at **320px** wide with no sideways scrolling. **Rows with actions stack on narrow screens** (name, then the buttons wrapping onto their own lines) and sit side by side only from `md` up. Names wrap rather than being cut off. **Button text wraps too**: the `Button` atom has a minimum height instead of a fixed one, no `whitespace-nowrap`, and `max-w-full`, so a long label (often a translated one, like "Ver todas las organizaciones cerca de Oakland, California") wraps onto a second line instead of pushing the page sideways (fixed 2026-11-24). Check new pages in Spanish and Vietnamese at 320–375px, since their labels run longest. Better still, keep labels short and don't repeat what a heading already says ("See all nearby", not "See all organizations near Oakland, California"). **Organization cards** wrap the name and details too: a role or Unclaimed label sits beside the name, or under it when there isn't room, and the details ("Food · 3 mi away · Santa Clara, California") break only between parts.

**Moving and touching**

- Targets at least **24×24px** (44px for main actions on phones where we can).
- Respect **reduced motion**: pulsing skeletons and spinners use `motion-safe:` (or stop) when the person asks for less motion.
- Nothing times out without warning.
- **Content that appears on hover** (tooltips, like marked dictionary words) also appears on keyboard focus, can be hovered without disappearing, and closes with Escape (WCAG 1.4.13). Never put the only way to reach something in a hover: a marked word is also a link to its page ([features/19](../features/19-dictionary.md#marked-words-definition)).

**Understanding**

- Plain, short wording; say what will happen before it happens ("Remove Luis? They can ask to join again"). Confirm anything destructive.
- Errors say what's wrong and how to fix it.
- Consistent places for things across pages.

## How we check

1. **Storybook's a11y panel** (axe) on every story you add or change, in both themes. Fix violations, don't suppress them.
2. **Keyboard pass:** Tab through the page and do the main task without a mouse.
3. **Screen reader pass** on new flows: VoiceOver (macOS: Cmd+F5) or NVDA (Windows). Listen to what each control is called.
4. **Zoom to 200%** and narrow to 320px.
5. Say what you checked in the change summary.

## Known gaps (fix list, 2026-11-23)

**Fixed 2026-11-23:** the members page squeezed names to one letter per line on phones (now stacked), its actions were borderless text (now outlined, red for remove and ban), and its repeated buttons didn't name the person (now "Remove: Luis Hernández"). Control borders were 1.26:1 in light mode and the focus ring 2.6:1 (now the `control` and `ring` tokens, measured: outlines 4.3:1 light / 5.4:1 dark, focus ring 7.5:1 / 10.6:1, role labels 18:1 / 14.5:1, small grey text 4.74:1 / 7.66:1). The join panel's Leave, the homepage banner's secondary button and the header's Sign in are outlined too.

Still to fix:

- **Members page and join panel:** after an action, the row (or button) disappears and focus falls to the top of the page.
- **/find:** after filters change, the new result counts aren't announced.
- **Skeletons and spinners** pulse regardless of reduced-motion settings.
- **Contrast** measured on the members page only; other pages use the same tokens but haven't been measured one by one.
- **Header:** the signed-in Dashboard link is still a borderless `ghost` button (common for navigation, and it's marked when current). Sign in is outlined.
- **The Storybook a11y check only reports** (`a11y: { test: 'todo' }`); it doesn't fail anything, and stories aren't run in CI.
