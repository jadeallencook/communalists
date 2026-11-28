# 22 · Notifications (rebuild)

A person's in-app inbox. Comrade requests are the first kind ([features/21](21-comrades.md)). Organizations posting events, asking members for things, and library checkouts are planned to use the same inbox. **Built 2026-11-28** ([decision #74](../decisions/074-comrades-and-a-shared-notifications-inbox.md)).

## What people see

- **A bell in the header** on every screen size, next to the account menu, linking to `/notifications`. A badge shows the unread count (up to 9, then "9+"). The link's name says it ("Notifications, 2 new"), so the badge is hidden from screen readers. If notifications can't be read, the bell still links, with no count.
- **`/notifications`**, signed in only: the 50 newest, newest first. Each row has who (linked to their profile, with a photo if the viewer may see it), what and when, and new ones are marked **New** in words, not only colour. Rows can carry their own actions: a comrade request still waiting has **Accept** and **Decline**. An account that's gone shows as "Someone", without a link.
- **Opening the page marks everything read**, so the bell clears. The **New** marks stay while the page is open.
- The dashboard has its own **Comrade requests** card; other kinds may get dashboard cards when they need answers.
- **In-app only:** no email and no live updates yet. The count updates when a page loads. `users.locale` (the preferred language) is kept for emails later.

## Rules for new kinds

1. Add the key to `NOTIFICATION_KINDS` (`src/lib/notifications/index.ts`; stored, never renamed), its message under `Notifications.kinds` in all four languages (with `<person>` around the name), and anything extra it needs in `NotificationList`.
2. Write it with `notify(tx, …)` **inside the transaction that changes the thing it's about**, and remove it with `unnotify` when it no longer applies (a request answered or taken back). Clear `notificationsTag(uid)` for each person in the action.
3. **Ids are `{kind}~{ref}~{uid}`**: one per thing per person, so doing it twice renews it instead of adding a copy.
4. **Never put personal details in a notification.** Store who did it (`actor`, a uid) and what it's about (`ref`), and read names and photos when showing them, under each person's current visibility.
5. **Fan-out:** one write per recipient. "An organization posted an event" to 300 members is 300 writes. Before building that, decide whether it's a batched background job or a per-organization feed that each member reads (cheaper, no writes).

## Data

- `notifications/{kind}~{ref}~{uid}` → `{ uid, kind, actor?, ref, read, createdAt }` (a server timestamp).
- Listed with `uid ==` ordered by `createdAt` desc, limit 50: a **composite index** in `firestore.indexes.json`, to deploy before merging. The bell counts unread among those 50 (no second query). Marking read uses `uid ==` and `read == false` (equality only, no index).
- Cached per person, tagged `notifications:{uid}`.
- **Old notifications aren't deleted yet.** A Firestore TTL policy on `createdAt` (say, 90 days) is the likely fix once volume grows.

## Code

Pure: `src/lib/notifications/index.ts`. Firestore: `store.ts`. Mark-read action: `src/app/actions/notifications.ts`. UI: `NotificationsBell`, `NotificationList`, `NotificationsPage`. Container: `src/app/[locale]/notifications/`. Bell: `src/app/[locale]/header-slots.tsx`.
