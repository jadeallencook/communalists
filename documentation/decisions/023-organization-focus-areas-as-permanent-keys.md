# 023 · Organizations: focus areas instead of a type, stored as permanent keys

**Date:** 2026-11-23
**Status:** Accepted. Changes the "type" field in [#22](022-organizations-design-handles-roles-limits.md).
**Context:** [#22](022-organizations-design-handles-roles-limits.md)'s single "type" list mixed two questions: what kind of group it is (tenant union, club, student group) and what it works on (food, a community fridge, disaster relief). Groups fit several choices, and a general mutual aid network had to pick one. The user also asked whether stored values should be readable keys or opaque IDs, so labels can change later.
**Decision:**

- Replace `type` with **`focusAreas`**: what the group works on, **1 to 3** from a fixed translated list of short labels (General, Food, Housing, Transportation, Technology, …, Other). Shortened the same day: one word where possible, choosing the broader word where one word narrows the meaning (Lending over Tools, Environment over Gardening), with keys renamed to match before anything shipped. The full list is in [features/16](../features/16-organizations.md#focus-areas).
- Drop "kind of group" for now; add it later as an optional field if browsing needs it.
- Store **readable keys** (`food`, `disasterRelief`) and treat them as **permanent**: never rename or reuse one. Labels come from the message files, so wording can change freely. Retire a key by hiding it from forms (`RETIRED_FOCUS_AREAS`), not by deleting it. A test locks the key lists for focus areas, reach, join policy and visibility.

**Alternatives:** Keep the mixed type list (confusing, and single-select forced general networks into one box); two fields, kind and focus (more for creators to fill in, and nobody browses by kind yet); single-select focus (doesn't fit groups that do several things); no cap (groups tick everything to show up in every search); opaque IDs (labels are already separate from keys, so IDs add nothing, and they make the database and logs unreadable; changing a key's meaning needs a migration either way).
**Consequences:** Done before any real organizations existed, so no migration. The form uses controlled checkboxes that disable at the cap (`ChoiceGroup` gained `selected`/`max`); cards and profiles list the areas. Phase 2 filters by focus area. Docs updated: features/16, technical/data-model.
