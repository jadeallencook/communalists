# 036 · Organizations can have a public phone number and a year founded

**Date:** 2026-11-24
**Status:** Accepted
**Context:** Researching the first unclaimed organizations showed most of them publish a phone number rather than an email (one has only a contact form), and calling is how people check hours before going. The user also asked for the year a group was founded, which many groups lead with ("since 1983").
**Decision:**

- **Phone:** optional and public, with a `tel:` link. Typed numbers are read with the group's country and stored as E.164 plus `;ext=N` (one string, so edits compare simply). Shown in national format to visitors in the same country, international otherwise. Parsing and formatting use **`libphonenumber-js`** (`src/lib/phone.ts`, tested), and the form gets its length limit from `options.ts`, so the library stays out of the browser bundle.
- **Year founded:** optional, four digits, 1800 to the current year, shown as "Since {year}".

**Alternatives:** Hand-written US phone rules (phone formatting was a buggy area in the prototype, and other countries will come); storing what was typed (the same number typed two ways would look like a change, and couldn't be formatted or dialed reliably); a separate extension field (one more input for a rare case); a full founding date (nobody knows the day; the year is what groups show).
**Consequences:** A new dependency, `libphonenumber-js` (its small "min" metadata). Numbers without an area code are refused with a message saying to include it. Edits log "the phone number" and "the year founded". Docs updated: features/16, technical/data-model.
