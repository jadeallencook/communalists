# 037 · Deleting organizations: owners archive, handle held 30 days, super users restore; "Make unclaimed"

**Date:** 2026-11-24
**Status:** Accepted. Fills in the "Deleting" plan from decision [#22](022-organizations-design-handles-roles-limits.md), but holds the handle for 30 days instead of reserving it forever.
**Context:** The user created an organization on production without ticking "unclaimed", so they were listed as its owner, and there was no way to delete one.
**Decision** (the user's choices, from options with trade-offs):

- **Make unclaimed:** a super user who owns an organization and is its only member can hand it to the team as unclaimed, keeping its handle and details. This fixes the mistake without deleting and retyping.
- **Any owner can delete,** after typing the organization's name. Deleting **archives** it: the data is kept, the page and listings disappear, members lose access, and memberships are marked `archived` with their old status kept.
- **The handle is held for 30 days**, like a rename, and then freed.
- **Super users can restore** within 30 days from `/admin`. That brings everything back, including each membership's status.

**Alternatives:** deleting and re-adding (with a held handle, the re-added page would need a new address for a month); freeing the handle at once (an impostor could take a known group's address); reserving it forever (a mistaken delete could never get its address back); only the sole owner can delete (stops one owner deleting a shared group, but clunky); no restore, or erasing the data at once (no undo; erasing becomes right once tools hold personal data, as a separate hard-delete job).
**Consequences:** Every query that counts memberships keeps working, because archived memberships aren't `active`. A takedown approved from a claim (features/18) also shows up as restorable, but its handle stays reserved rather than held. Hard deletion after 30 days is not built yet. Docs updated: features/16, features/18, technical/data-model.
