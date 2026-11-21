# Data Model

> **Scope.** This describes the **prototype's** data. The rebuild keeps Firebase (same project, databases emptied, decision #4), but its Firestore schema hasn't been designed yet. Use the relational sketch at the end as the conceptual model, and record the new schema here when it's decided.

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
