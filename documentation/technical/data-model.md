# Data Model

> **Scope.** The first section is the **rebuild's** Firestore schema (same project, databases emptied, decision #4). Everything after it describes the **prototype's** data, kept for its lessons.

## Rebuild (current)

All access is through the Admin SDK on the server; rules deny clients ([firebase.md](firebase.md#security-in-the-rebuild-server-only-access)). No Realtime Database.

| Collection      | Doc ID          | Fields                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Written by                                                                                                          |
| --------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `users`         | uid             | `displayName`, `username`, `usernameChangedAt`, `locale` (preferred language), `location { placeId, country, label, lat, lng, geohash }`, `profile { visibility (`public`/`groups`/`name`), pronouns?, bio?, languages[], showArea, socials[], website?, groups { show, hidden[] } }` ([features/17](../features/17-profiles.md)), `createdAt`, `updatedAt`. All optional; a missing `profile` reads as the private defaults                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Account setup and settings ([accounts-and-sessions](accounts-and-sessions.md))                                      |
| `organizations` | auto            | `name`, `handle`, `focusAreas[]` (1–3 keys, [decision #23](../decisions/023-organization-focus-areas-as-permanent-keys.md)), `description`, `location` (same shape as users), `streetAddress?` (optional, public, one line; decision #35), `reach { scope, radiusMiles?, radiusKm? }`, `languages[]`, `website?`, `contactEmail?`, `phone?` (E.164 plus `;ext=N`; decision #36), `foundedYear?` (number), `socials[{ platform, handle }]` (links built at render; older `url` entries converted on read), `joinPolicy`, `visibility`, `memberListVisibility` (`public`/`members`/`hidden`; missing means `members`), `handleChangedAt` (for the 30-day limit), `status` (`active`/`archived`; archived ones have `archivedAt`, `archivedBy`, decision #37), `memberCount`, `createdBy`, `createdAt`, `updatedAt`; unclaimed ones: `claimStatus: 'unclaimed'` (removed when claimed), then `claimedBy`, `claimedAt` ([features/18](../features/18-unclaimed-organizations.md)) | Create (phase 1); edit (phase 3); super users and claims ([features/18](../features/18-unclaimed-organizations.md)) |
| `usernames`     | the username    | `uid`, `createdAt`, `heldUntil` (old usernames after a change). Claimed in the same transaction as the profile save; same rules as `handles`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Account setup and settings                                                                                          |
| `handles`       | the handle      | `orgId`, `createdAt`, `heldUntil` (old handles after a rename: still claimed but no longer resolving, until this date)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Same transaction as the organization                                                                                |
| `memberships`   | `{orgId}_{uid}` | `orgId`, `uid`, `role` (`owner`/`moderator`/`member`), `status` (`active`/`pending`/`invited`/`banned`/`archived`; `archived` while the organization is deleted, with the old status in `previousStatus`), `org { name, handle, focusAreas }` and `member { displayName, username }` (copies, for listing; member lists repair missing copies from `users` and write them back), `joinedAt` / `requestedAt` / `bannedAt`, `banReason` (banned only)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Create (owner); joining (phase 2)                                                                                   |

| `claimRequests` | `{orgId}_{uid}` | `orgId`, `uid`, `intent` (`claim`/`remove`), `role`, `message`, `status` (`pending`/`approved`/`denied`), `outcome` (`decided`/`resolvedByOther`), `org { name, handle }`, `claimant { displayName, username }` (copies), `requestedAt`, `decidedAt`, `decidedBy` | The claim page; super users on `/admin` |
| `adminLog` | auto | `action` (`createUnclaimed`, `editUnclaimed`, `approveClaim`, `approveRemoval`, `denyClaim`, `deleteUnclaimed`, `restoreOrganization`, `makeUnclaimed`, `exportOrganizations`), `orgId`, `orgName` (empty for `exportOrganizations`), `actorUid`, `target { uid, displayName }?`, `fields[]?`, `count?` (organizations exported), `createdAt`. Append-only | Every super-user action |

**Stored keys are permanent.** Values from fixed lists (`focusAreas`, `reach.scope`, `joinPolicy`, `visibility`, `memberListVisibility`, `role`, `status`, moderation `action`) are stored as readable keys and never renamed once live; labels come from `messages/*.json`, so wording changes need no migration. `src/lib/organizations/options.test.ts` locks the lists.

Queries in use: `memberships where uid == X and status == active` (dashboard), and the same plus `role == owner` (the 5-owned limit); for finding organizations, `organizations` ordered by `location.geohash` between geohash bounds (local), and `reach.scope == national/international` with `status == active`, `visibility == listed` (and `location.country` for national). Moderation: `memberships where orgId == X` (a group's people), the same plus `role == owner` and `status == active` (the last-owner check), `memberships where uid == X` (name sync), and `organizations/{id}/moderationLog` ordered by `createdAt` (append-only: `action` (`approve`, `deny`, `block`, `remove`, `ban`, `unban`, `makeModerator`, `makeOwner`, `makeMember`, `editProfile` with `fields[]`, `claim`, `deleteOrganization`, `restoreOrganization`), `target { uid, displayName }`, `actor { uid, displayName }` (or `{ uid, team: true }` for a super user), `reason?`, `createdAt`). Unclaimed organizations and claims: `claimRequests where status == pending`, `claimRequests where orgId == X and status == pending`, `organizations where claimStatus == unclaimed and status == active`, and `adminLog` ordered by `createdAt`; recently deleted: `organizations where status == archived`, filtered to 30 days in memory. All are equality-only or a range or order on one field, so no composite index is needed. Design and rules: [features/16](../features/16-organizations.md).

## Prototype

In the prototype, all data lived in one Firebase project: four Firestore collections plus two Realtime Database paths. Enum values are in [`../data/enums.json`](../data/enums.json).

## Diagram

```
Firebase Auth user (uid)
   │
   ├── Firestore accounts/{uid}          location, joined, lastUpdated
   ├── RTDB displayNames/{uid}           "Display Name"
   │
   ├── Firestore organizations/{orgId}   members[], moderators[], requests[]  ← uid arrays
   │
   └── referenced by uid in:
        requests/{id}.coordinator / .driver
        donations/{id}.coordinator / .driver
        threads/{id}.comments[].user

Firestore requests/{id}  ──1:1──  threads/{id}  ──1:1──  donations/{id}   (same id space)
RTDB requestFormStatus: boolean
```

## Firestore

### `requests/{autoId}`

| Field           | Type        | Notes                                                          |
| --------------- | ----------- | -------------------------------------------------------------- |
| `name`          | string      | required                                                       |
| `email`         | string      | required                                                       |
| `phone`         | string      | formatted `(xxx) xxx-xxxx`, may be `''`                        |
| `location`      | LocationKey | e.g. `san-jose-ca`                                             |
| `language`      | LanguageKey | `english` \| `spanish` \| `vietnamese` \| `chinese`            |
| `method`        | MethodKey   | `email` \| `phone` \| `text`                                   |
| `health`        | string      | optional, **sensitive**                                        |
| `needs`         | string      | required free text, often holds an **address**                 |
| `stage`         | StageKey    | `submitted` → `started` → `ready` → `complete`, or `cancelled` |
| `timestamp`     | Timestamp   | creation time (set at form mount)                              |
| `driver`        | uid \| `''` |                                                                |
| `hasDriver`     | boolean     | derived from `driver`, kept for queries                        |
| `coordinator`   | uid \| `''` |                                                                |
| `organizations` | string[]    | always `['communalists']`                                      |

Queried by: `stage ==` (always), plus optional `location ==`, `language ==`, `hasDriver ==`, `coordinator ==`.

### `donations/{autoId}`

Same as `requests`, minus `health`, `needs` and `organizations`, plus `body: string` (always saved empty; see [04](../features/04-donations.md)).

### `threads/{requestOrDonationId}`

| Field          | Type                                                                       |
| -------------- | -------------------------------------------------------------------------- |
| `comments`     | `{ user: uid, body: string, timestamp: Timestamp, isArchived: boolean }[]` |
| `lastModified` | Timestamp                                                                  |

### `organizations/{autoId}`

| Field                   | Type             | Notes                   |
| ----------------------- | ---------------- | ----------------------- |
| `name`                  | string           |                         |
| `joined`, `lastUpdated` | Timestamp        |                         |
| `website?`, `about?`    | string           | never shown             |
| `phone?`, `email?`      | **number** (sic) | typed wrong, never used |
| `moderators`            | uid[]            |                         |
| `members`               | uid[]            |                         |
| `requests?`             | uid[]            | pending join requests   |

### `accounts/{uid}`

| Field                     | Type        | Notes                                                           |
| ------------------------- | ----------- | --------------------------------------------------------------- |
| `location`                | LocationKey | collected at sign-up                                            |
| `joined`, `lastUpdated`   | Timestamp   | set at module load (bug)                                        |
| `name`                    | string      | **only on older accounts**; still read by comment author lookup |
| `approved`, `role`, `bio` | —           | **old accounts only**, from the removed application flow        |

## Realtime Database

| Path                 | Type    | Read                                    | Write                    |
| -------------------- | ------- | --------------------------------------- | ------------------------ |
| `requestFormStatus`  | boolean | everyone (public request page)          | moderators (UI-enforced) |
| `displayNames/{uid}` | string  | every signed-in user, whole map at once | the user themself        |

## Enums

| Enum                 | Values                                                                                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Locations (10)       | Campbell, Cupertino, Gilroy, Los Altos, Los Gatos, Milpitas, Mountain View, San Jose, Santa Clara, Sunnyvale (keys like `san-jose-ca`)                                              |
| Languages            | English, Español, Tiếng Việt, 中文                                                                                                                                                  |
| Contact methods      | Email, Phone Call, Text                                                                                                                                                             |
| Stages               | Received (1/4), Coordinating (2/4), Ready (3/4), Fulfilled (4/4), Cancelled                                                                                                         |
| Driver filter        | `not-assigned` → "Pending", `assigned` → "Coordinated"                                                                                                                              |
| Volunteer roles (13) | Driver, Coordinator, Security, Tech Support, Social Media, Photography, General Labor, Meal Prep, Event Planning, Graphic Design, Emotional Support, Legal Support, Medical Support |
| Event tags           | shower, food, essentials, medical, haircut, recovery, legal, mail, groceries                                                                                                        |

## Suggested relational shape for the rebuild

```sql
profiles      (id = auth uid, display_name, location, language, created_at)
organizations (id, name, slug, website, about, created_at)
memberships   (user_id, org_id, role: member|moderator, status: pending|active|rejected, created_at)
cases         (id, org_id, type: request|offer, name, email, phone, location, language,
               contact_method, health, details, stage, coordinator_id, driver_id, created_at, updated_at)
case_events   (id, case_id, actor_id, kind: comment|stage|assign|unassign, body, payload jsonb, created_at)
services      (id, organization_name, venue, street, city, zip, tags[], is_religious,
               schedule jsonb, website, description, updated_at)   -- replaces events.ts
settings      (key, value)                                          -- request_form_open, etc.
```

`case_events` replaces both `threads` and the missing audit log. `driver_id IS NOT NULL` replaces `hasDriver`.

## Production data snapshot (2026-11-20)

Before the databases were emptied (decision #4), production (`communalists`) was backed up to CSV/JSON. The backup lives **outside the repo** because it contains personal data. Aggregate facts only:

| Store             | Path                | Records                                                  |
| ----------------- | ------------------- | -------------------------------------------------------- |
| Firestore         | `requests`          | 174, created 2023-05-30 → 2024-03-10                     |
| Firestore         | `threads`           | 161, holding 478 comments                                |
| Firestore         | `accounts`          | 103 (older ones still carry `role.*`, `bio`, `approved`) |
| Firestore         | `organizations`     | 1                                                        |
| Realtime Database | `displayNames`      | 103                                                      |
| Realtime Database | `requestFormStatus` | 1 flag                                                   |

- `donations`, `details`, `comments`, `applications` and `users` were empty. The donation form never produced a stored donation, which fits the `body` bug in [features/04](../features/04-donations.md).
- Requests kept arriving until **2024-03-10**, two months after the last code commit (Jan 2024).
- About 92% of requests have a comment thread, so comments were central to how volunteers worked.
- Firebase Auth users were not exported.
