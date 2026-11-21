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

## Security in the rebuild: server-only access

`firestore.rules` and `database.rules.json` (in the repo, deployed 2026-11-20) **deny every client request**. Everything works anyway because:

- **Security rules only apply to client requests**: the web or mobile SDK, or the REST API called with an end user's token.
- **All our reads and writes go through the Firebase Admin SDK** on the server (`src/lib/firebase/admin.ts`, used by server actions and route containers). Admin requests authenticate as a **service account** and **skip the rules entirely**. Their permissions come from Google Cloud IAM.

```
Browser ──form post──▶ server action (Vercel) ── checks the session, validates ──▶ Admin SDK ──▶ Firestore
Browser ──direct Firestore request──▶ ✗ denied by rules
```

What follows from that:

- **The server is the only gate.** Every server action and container must check authorization itself, for example taking the uid from the verified session cookie, never from the request.
- **`FIREBASE_SERVICE_ACCOUNT_KEY` is the master key.** Whoever holds it can read and write all data. Keep it only in Vercel's environment variables (marked sensitive). If it leaks, delete it under Project settings → Service accounts and generate a new one.
- **Opening client access later** (e.g. live updates on a kanban board) means writing real rules for just those collections, scoped by organization membership and role, with emulator tests. Everything else stays denied.

## Security in the prototype: the big unknown

**Neither `firestore.rules` nor `database.rules.json` was in the prototype's repo.** Firebase web config keys are public by design, so the rules _are_ the security model. The client code assumes all of the following; each must be enforced by rules or it's open:

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
- **Prototype:** the `communalists-test` project was the default for development. The production config came from the `FIREBASE_CONFIG` env var at build time. That variable is still on the `communalists` Vercel project but **unused by the rebuild**; it can be removed.
- **Rebuild (2026-11-21):** only `communalists` (production) is used. Local development and tests use the emulators under the fake project ID `demo-communalists`. The `demo-` prefix keeps the emulators from reaching any real Google service. `communalists-test` and `communalists-demo` still exist in the Firebase account but nothing uses them. There's no `.firebaserc`, so CLI commands pass `--project` explicitly. `communalists-test` is a candidate for a separate preview-deployment project (see `deployment.md`).
- `storageBucket` changed from `*.appspot.com` to `*.firebasestorage.app` (Firebase's newer default). Storage isn't used.
