# 030 · Editing organizations: the create form reused; handle owners-only with holds

**Date:** 2026-11-23
**Status:** Accepted
**Context:** Owners could manage members but not edit anything else. The user asked to edit all the other fields. The docs already set who edits (owners and moderators) and the handle rules (owners only, once per 30 days, old handle held 30 days, no redirects; decision [#22](022-organizations-design-handles-roles-limits.md)).
**Decision:**

- `/org/{handle}/edit` reuses the create form in an edit mode, so the two can't drift. Owners and moderators can edit every field; only owners change the handle.
- A handle change moves the claim and turns the old `handles/{old}` document into a hold (`heldUntil`), which blocks others until it ends and never resolves. Expired holds can be claimed by anyone, including by a new organization.
- Membership copies are updated after the transaction, in batches, so large groups don't hit Firestore's 500-writes-per-transaction limit. A failure there leaves a stale copy on some dashboards, not a broken organization.
- Every save with changes is logged with the list of fields, next to moderation actions.

**Alternatives:** a separate edit form (two forms to keep in step); letting moderators change the handle (it breaks every link and flyer, so it stays with owners); redirects from old handles (the user chose no redirects); updating copies inside the transaction (fails for groups over ~490 members).
**Consequences:** Rule of thumb for the future: any change to a field that's copied elsewhere must update the copies, and adding a copied field needs a plan for existing records. Docs updated: features/16, technical/data-model.
