# 042 · Photos for organizations and profiles, stored in Firestore and served by our own route

**Date:** 2026-11-25
**Status:** Accepted
**Context:** The user asked for photos on organizations (for their owners and moderators) and on profiles (for the person), changed from a small edit button that appears when hovering the photo, and also from the edit pages. The organizations doc had planned a logo in Firebase Storage, but Storage was never set up.
**Decision:**

- **Who:** organization photos are changed by owners and moderators (super users on unclaimed ones), the same people who can edit the organization. A person changes only their own.
- **Privacy:** a person's photo follows their profile visibility; organization photos are public.
- **Storage:** one small document per photo, `photos/{kind}_{id}`, holding a 256 px WebP (5–30 KB), served by `/api/photos/{kind}/{id}?v={version}`. The route checks visibility on every request with fresh reads (no `'use cache'`), and browsers cache each version's URL.
- **Processing:** the browser crops (drag, arrow buttons, zoom) and sends a 512 px square; the server re-checks and re-encodes with `sharp` (now a direct dependency), which also drops EXIF data.
- **Editing:** a pencil button on the photo's corner, shown on hover, keyboard focus, and always on touch screens; plus a "Photo" section on the edit pages. The photo saves on its own, not with the form.

**Alternatives:**

- _Firebase Storage_ (the earlier plan): needs the bucket turned on (newer projects need the paid Blaze plan), separate rules and the Storage emulator, and its download links are public, so a "Just my name" photo would be private only because its link is hard to guess. Worth revisiting for large files (documents, item photos in the lending library).
- _Auto center-crop_ instead of a crop tool: simpler, but cuts off faces.
- _Hover only_ for the edit button, as first described: keyboard and touch users couldn't reach it. Showing it on focus and on touch screens keeps the look the user asked for.
- _Caching the route's reads with `'use cache'`:_ tried first. In `next dev` the route's cached profile read stayed stale after the pages' `updateTag`, and also made the next page load show the old profile. Fresh reads (two documents, one round trip) avoid that, and the versioned URL keeps repeat views off the server.

**Consequences:** `organizations.logoPath` (never written) became `photoVersion`, copied onto memberships. New `photos` collection; rules still deny clients. Member lists still show initials (they need each member's visibility on the membership copy first). Docs updated: [features/19](../features/19-photos.md) (new), [16](../features/16-organizations.md), [17](../features/17-profiles.md), [data-model](../technical/data-model.md), [firebase](../technical/firebase.md), [accessibility](../technical/accessibility.md), README, AGENTS.md.
