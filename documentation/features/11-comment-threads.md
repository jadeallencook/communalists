# 11 · Comment Threads

Volunteers coordinate on each request through a comment feed: "I can drive Thursday", "Called her, she needs diapers too". It's in the **Communication** section of the request detail.

## UI

- An input ("Coordinate with drivers and share updates on aid requests…") and a **Send Message** button at the top. Both are disabled while sending.
- Comments show as toast-style cards: author name, timestamp (`MM/DD/YYYY h:mm:ss`), and body. They're listed in insertion order (oldest first).
- Unknown author: "@comrade".
- Empty state: "No comments have been made yet. Be the first volunteer to start the discussion for this request!"

## Storage: one document per thread

`threads/{requestId}` in Firestore:

```ts
{ comments: { user: uid, body: string, timestamp: Timestamp, isArchived: boolean }[],
  lastModified: Timestamp }
```

- **History:** comments were first stored as one document per comment. Opening a request cost one billed read *per comment*. Commit `a377129` (May 2023) moved them into one document per request: **N reads became 1**.
- New comments use `arrayUnion`, which is atomic, so two people posting at once don't overwrite each other.
- `addComment` reads the doc first to choose `updateDoc` or `setDoc`. That extra read could be avoided with `setDoc(..., { merge: true })`.
- The thread ID equals the request ID. Donations reuse the same collection, so IDs share one namespace.
- Limit: a Firestore document is at most 1 MiB, which is fine for a thread on one request.

## Author names

The comment list calls `getUsernames(uids)`, which reads **`accounts` documents** and pulls their `name` field. But sign-up stores names in the RTDB `displayNames` map, not in `accounts` (see [07](07-authentication.md)). So **comment authors usually show as "@comrade"**, while the rest of the dashboard shows real names. Use `displayNames` here too (it's already in `DashboardContext`).

`getUsernames` uses Firestore's `in` operator, which caps how many IDs it accepts in one query (10 when this was written, 30 today). A thread with more distinct authors than that would fail.

## Other gaps

- `isArchived` is stored but never read, so comments can't be edited, deleted or hidden.
- The thread is refetched by toggling an `isSubmitting` flag after each post. It doesn't update in real time; other volunteers' comments appear only when the modal is reopened.
- No notifications when someone comments on a request you're assigned to.
- `ViewRequestForm/Comments` and `ViewDonationForm/Comments` are near-identical copies. The donation copy crashes on a missing thread (`Object.keys(undefined)`).

## In the rebuild

- If you stay on Firestore: a `threads/{id}/comments` subcollection with an `onSnapshot` listener gives real-time updates for about the same read cost. Or keep the single document and listen to it.
- If you move to Postgres: a `comments(case_id, author_id, body, created_at, deleted_at)` table, plus a realtime channel (Supabase Realtime, or Pusher / Ably) if live updates matter.
- Put system events (stage changes, assignments) in the same feed.
