# 19 · Photos for organizations and profiles (rebuild)

Organizations and people can add a photo. It replaces the initials in the small shape next to their name: on the organization's page, its cards (dashboard, `/find`, nearby), the profile page, the "Preview as…" panel and the header's account menu. Designed with the user on 2026-11-25 ([decision #42](../decisions/042-photos-in-firestore-served-by-our-route.md)). **Built 2026-11-25.**

## Who can change a photo

| Photo             | Who can change it                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------ |
| An organization's | Its owners and moderators (the same people who can edit it); super users on unclaimed ones |
| A person's        | Only that person                                                                           |

Checked again on the server, on fresh data, in the same transaction that writes the photo. Organization photo changes go in the moderation log ("edited the photo"), and super users' changes to unclaimed ones go in `adminLog`.

## Where you change it

- **Hover the photo** on the organization page or your own profile page: a small pencil button appears on its corner, overlapping it without covering it. Only people who may change the photo get the button.
  - It also appears on **keyboard focus** (Tab to it), and it's **always shown on touch screens**, which can't hover. A hover-only control would lock out keyboard and phone users (see [accessibility](../technical/accessibility.md)).
- **On the edit pages:** `/org/{handle}/edit` and `/account/profile` have a **Photo** section with a visible "Change photo" button.
- Both open the same dialog: choose a file, then **drag the photo** (or use the four **arrow buttons**, a single-tap alternative to dragging, WCAG 2.5.7) and the **Zoom** slider to fit it in the shape. A small preview shows it at the size pages use. **Save photo** saves it right away, separately from the rest of the form. **Remove photo** goes back to initials.

## Who sees it

- **Organization photos are public** while the organization is active, like the rest of its page.
- **A person's photo follows their profile visibility** ([17](17-profiles.md)): only people who can see the rest of their profile see it. Everyone else sees initials. "Just my name" means just the name: no photo either.
- The photo's address checks this again on every request, so a copied link doesn't show a hidden photo to someone else. "No photo" and "not allowed" both answer 404, so a hidden photo's existence isn't revealed.

## Size and files

- People pick **JPEG, PNG or WebP**, at least **128 px** on the shorter side (smaller looks blurry), up to 20 MB. The original never leaves their device: the browser crops it and sends a 512 px square.
- The server checks the bytes really are an image (not just the file name or type), then stores a **256 px square WebP** (usually 5–30 KB). That's about the size of the shape it fills (28 to 64 CSS px), sharp on high-density screens and no bigger.
- Re-encoding **removes EXIF data**, including where a photo was taken.
- People are circles; organizations are rounded squares, and the crop's outline matches.

## Data

- `photos/{kind}_{id}` (`org_{orgId}`, `user_{uid}`): `data` (bytes), `type` (`image/webp`), `updatedAt`. Server-only.
- `organizations/{id}.photoVersion` and `users/{uid}.photoVersion`: when it was saved (epoch ms); missing without a photo. Pages use it to decide whether to show a photo, and it's part of the URL (`/api/photos/{kind}/{id}?v=…`), so a new photo never shows an old cached one.
- `memberships/*.org.photoVersion`: copied like the name, so dashboard cards need no extra read.

## Built (2026-11-25)

| Piece                                                | Where                                                                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Sizes, URLs, picking rules, crop math (pure, tested) | `src/lib/photos.ts`                                                                                                |
| Checking and re-encoding uploads (sharp, tested)     | `src/lib/photo-process.ts`                                                                                         |
| Reading the form, fresh reads for the route          | `src/lib/photo-store.ts`                                                                                           |
| Writing: organizations / people                      | `setOrganizationPhoto` in `src/lib/organizations/index.ts`, `setUserPhoto` in `src/lib/users.ts`                   |
| Serving with the access check                        | `src/app/api/photos/[kind]/[id]/route.ts`                                                                          |
| Server actions                                       | `saveOrganizationPhotoAction` (`org/[handle]/actions.ts`), `saveProfilePhotoAction` (`account/profile/actions.ts`) |
| Photo or initials                                    | `Avatar` (molecule)                                                                                                |
| Hover button, edit-page field and crop dialog        | `PhotoEditor` (organism) with `usePhotoCrop` (hook)                                                                |

## Not yet

- Member lists and the members page still show initials. Showing photos there needs each member's visibility copied onto memberships (like the name), so the list can decide without extra reads.
- No photo when creating an organization; add it from the page or the edit page right after.
