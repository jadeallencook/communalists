# 034 · A "Hygiene" focus area

**Date:** 2026-11-24
**Status:** Accepted
**Context:** The user asked where a free shower program would go. None of the focus areas fit: Health was the nearest, and Housing only by stretching it. Showers, essentials and haircuts were a large share of the prototype's listings ([features/03](../features/03-events-directory.md)), and they're what the first unclaimed organizations will offer ([features/18](../features/18-unclaimed-organizations.md)).
**Decision:** Add the key `hygiene` (Hygiene / Higiene / Vệ sinh cá nhân / 个人卫生), covering showers, laundry, hygiene kits and haircuts. It sits after Clothing in the list, with the other basic needs. The seeded shower day uses Hygiene and Health.
**Alternatives:** Using Health (people looking for a shower wouldn't think to pick it); "Personal care" (vaguer, and harder to translate); a broader "Basic needs" (it would overlap with Food, Clothing and Housing, so filters would mean less).
**Consequences:** 20 focus areas; the key is permanent (the list test locks it). Focus areas describe the organization, not each service. Once events exist, an event will need its own category, so a church's shower can be found even if its focus areas are Faith and Food. Plan that with the calendar tool. Docs updated: features/16.
