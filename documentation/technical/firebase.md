# Firebase: Cost, Security and Gotchas

What Firebase taught this project. Read it whether the rebuild stays on Firebase or not.

## Read-cost optimizations that worked

Firestore bills per document read, so the team reshaped data around how screens read it:

| Problem                                                                     | Fix                                                                                 | Commit               |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------- |
| One document per comment → N reads to open a request                        | One `threads/{id}` doc with an `arrayUnion`-appended array → 1 read                 | `a377129` (May 2023) |
| One read per person to show names                                           | A flat `displayNames` map in Realtime Database, read once (RTDB bills by bandwidth) | `d153141` (Jun 2023) |
| Refetching the same requests on every filter change                         | `DashboardContext` cache: filter locally, fetch only on a miss                      | `dcbc734` (May 2023) |
| "Has a driver" needs `!=` or an empty check, which Firestore handles poorly | A derived `hasDriver` boolean → plain equality                                      | `1bdb5b2`            |
| Hard to see how many reads a screen caused                                  | A styled `[communalists]` console log on every fetch                                | —                    |

Each fix has a cost: staleness (cache), the whole roster sent to every client (display names), duplicate fields that can drift (`hasDriver`), and a document size cap of 1 MiB (threads).

## Query limits that shaped the code

- **No substring search.** Name and email search runs on the client over cached results.
- **Composite indexes.** `stage == X && hasDriver == Y && coordinator == Z` needs an index for each combination of filters. The location and language filters were probably dropped partly for this reason. The `firestore.indexes.json` file isn't in the repo.
- **`in` queries are capped** (10 IDs then, 30 now). `getUsernames` would break on big threads.
- `!=` queries exclude documents that lack the field, and need ordering on that field.

## Security: the big unknown

**Neither `firestore.rules` nor `database.rules.json` is in the repo.** Firebase web config keys are public by design, so the rules _are_ the security model. The client code assumes all of the following; each must be enforced by rules or it's open:

| Data                                                     | Who should be able to…                                                                 |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `requests` (name, phone, **health**, address in `needs`) | Create: anyone. Read and update: org members only. Never public.                       |
| `/view-request/:id`                                      | Must fail for signed-out visitors.                                                     |
| `requests.driver` / `.coordinator`                       | Set to **your own** uid or `''`; clearing someone else's should need moderator rights. |
| `organizations.requests`                                 | Users add **only themselves**.                                                         |
| `organizations.members` / `moderators`                   | Moderators only.                                                                       |
| `threads`                                                | Members only. The `user` field must equal `request.auth.uid`.                          |
| `accounts/{uid}`, `displayNames/{uid}`                   | Write: owner only.                                                                     |
| `requestFormStatus`                                      | Read: public. Write: moderators.                                                       |

**Before deleting anything, export the live rules** from the Firebase console (`firebase firestore:rules:get` or the console) and keep them with these docs. Also export the data if the rebuild will migrate it (`gcloud firestore export`, and an RTDB JSON export).

## Config gotchas

- RTDB needs `databaseURL` in the app config. The committed config lacked it, and the working-tree change adds it.
- Mixing `getDatabase()` / `getAuth()` without `app` and with `app` only works with a single default app.
- The `communalists-test` project was the default for development. The production config came from the `FIREBASE_CONFIG` env var at build time. Keep the separate dev and prod projects.
- `storageBucket` changed from `*.appspot.com` to `*.firebasestorage.app` (Firebase's newer default). Storage isn't used.
