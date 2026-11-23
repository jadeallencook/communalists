# Accessibility

**Accessibility is the top priority for everything we build** (set by the user 2026-11-23, [decision #29](../decisions.md)). Many people who use mutual aid have a disability: low vision, blindness, motor or tremor, deafness, cognitive or learning disabilities, chronic illness and fatigue. Many are older, on an old phone, or reading in a second language. If they can't use a tool, it isn't doing its job. A change isn't done until it meets this page.

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

- Text contrast **4.5:1** (3:1 for large text and for borders of controls and focus rings), in **both light and dark** themes. Check `muted-foreground` on `muted` especially.
- Never rely on colour alone (pair it with text or an icon).
- Works at **200% zoom** and at **320px** wide with no sideways scrolling.

**Moving and touching**

- Targets at least **24×24px** (44px for main actions on phones where we can).
- Respect **reduced motion**: pulsing skeletons and spinners use `motion-safe:` (or stop) when the person asks for less motion.
- Nothing times out without warning.

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

Found by review, not yet fixed:

- **Members page:** repeated buttons ("Approve", "Remove", "Ban", "Make moderator") don't name the person.
- **Members page and join panel:** after an action, the row (or button) disappears and focus falls to the top of the page.
- **/find:** after filters change, the new result counts aren't announced.
- **Skeletons and spinners** pulse regardless of reduced-motion settings.
- **Contrast** of small muted text and role badges hasn't been measured in both themes.
- **The Storybook a11y check only reports** (`a11y: { test: 'todo' }`); it doesn't fail anything, and stories aren't run in CI.
