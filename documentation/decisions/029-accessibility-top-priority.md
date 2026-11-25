# 029 · Accessibility is the top priority

**Date:** 2026-11-23
**Status:** Accepted
**Context:** The user set this for everything we build: many people using the platform may have a disability, and it has to be accessible to everyone.
**Decision:** WCAG 2.2 AA is the floor for every page and component, checked before a change is done (Storybook a11y panel in both themes, a keyboard pass, a screen reader pass on new flows, 200% zoom). The rules, how to check, and the current gaps live in [technical/accessibility.md](../technical/accessibility.md); `AGENTS.md` lists it first among the product rules.
**Alternatives:** an accessibility pass before launch (cheaper now, but problems pile up and get designed in); AA only where convenient (shuts out the people mutual aid serves).
**Consequences:** Work takes a little longer and every summary says what was checked. Gaps found in what's already built are listed in the accessibility doc and fixed next. Docs updated: technical/accessibility (new), AGENTS, README index.
