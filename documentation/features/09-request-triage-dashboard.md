# 09 · Request Triage Dashboard

The core volunteer tool at `/dashboard/requests`. Organization members see aid requests, filter them by pipeline stage, and open one to coordinate it.

## The pipeline

| Key | Label | Badge |
|---|---|---|
| `submitted` | Received (1/4) | default |
| `started` | Coordinating (2/4) | |
| `ready` | Ready (3/4) | |
| `complete` | Fulfilled (4/4) | |
| `cancelled` | Cancelled | |

Every request starts at `submitted`. Any member can move a request to any stage, and there are no transition rules.

## Table

Sorted **oldest first** (by `timestamp`), so the longest-waiting request is on top. A result count ("3 Results") sits above the table.

| Column | Content |
|---|---|
| Received | Relative time: "3 days ago", "2 hours ago", "Just now" |
| Requester | Name |
| Location | City name, or "Location Unknown" |
| Language | Language name in its own script |
| Delivery | "Coordinated" if a driver is assigned, otherwise "Pending" |
| Stage | Stage badge |

Clicking a row opens the [request modal](10-request-detail-and-coordination.md). Rows fade in one after another (`animationDelay: index * 0.05s`).

Empty state: "There are currently no requests that match that search criteria. Please adjust the filters above…"

## Filters

| Control | Behavior | Where it filters |
|---|---|---|
| Delivery | Any / Pending / Coordinated | Firestore `hasDriver == bool` |
| Stage | One stage at a time (default Received) | Firestore `stage ==` |
| **Only Yours** button and checkbox | Requests where you are the coordinator | Firestore `coordinator == uid` |
| Refresh | Refetch with current filters | — |
| Search box | Name or email substring, case-insensitive | **Client only** (Firestore can't do substring search) |
| Location, Language | Built, then **commented out** in `FilterForm` | Firestore `==` |
| Kill switch (moderators) | See [02](02-request-form-kill-switch.md) | — |

## Caching strategy (important)

`DashboardContext` keeps an in-memory map of every request fetched so far.

1. When the filters change, it first runs `filterRequests(cache, filters)` on the client.
2. **It only calls Firestore if the cached result is empty.**
3. Fetched results are merged into the cache and never evicted, until sign-out.
4. Stage changes update the cache right away, with no refetch.

This was done to keep Firestore reads (and the bill) down. The cost is **staleness**: if the cache already holds one match, new requests that also match won't appear until the user clicks **Refresh**. Volunteers had to learn to press Refresh.

## Access control

- The Requests tab is hidden in the nav for non-members (`isRestricted: true`). Visiting `/dashboard/requests` directly still renders the page; only Firestore rules can block the data.
- Visiting an unknown `/dashboard/:route` crashes, because `routes[route]` is undefined.

## Bugs

- **The Delivery filter is broken on the client.** The server filters on `hasDriver`, but `filterRequests` compares the filter value (`'assigned'` or `'not-assigned'`) against `request.driver` (a UID). With a Delivery filter set, the table is always empty.
- The "Only Yours" aria-label says "coordinating or driving", but only `coordinator` is checked.
- When the Firestore query has several `where` clauses, it needs composite indexes. Those index definitions aren't in the repo.
- No pagination: a busy stage loads every matching document.
- `getRequests` sees `filters.coordinator` as truthy and uses it as the UID directly, while `getDonations` ignores the value and uses `currentUser.uid`. Inconsistent, but both behave the same today.

## In the rebuild

- Server-render the list with real pagination and URL-based filters (`?stage=started&mine=1`), so views can be bookmarked and shared.
- Use a real-time subscription or short-lived cache (React Query / SWR with `staleTime`) instead of "fetch only when cache is empty".
- Use full-text search (Postgres `ILIKE` or trigram, Algolia or Typesense) if requests grow past a few thousand.
- Add "unassigned", "age > N days" and a language filter. Coordinators matched people by language.
