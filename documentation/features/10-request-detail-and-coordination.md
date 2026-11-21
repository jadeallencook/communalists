# 10 · Request Detail and Coordination

Opening a request shows everything about it, and lets a volunteer claim a role and move it through the pipeline. It's available as a modal over the triage table, and as a standalone, shareable page at `/view-request/:id`.

## Layout

An accordion with three sections (`alwaysOpen`):

1. **Information** (read-only): request link with an "(Open)" anchor (modal only), full name, spoken language, location, email, phone, preferred contact method, health conditions, and request details. Empty fields show "N/A".
2. **Communication**: the [comment thread](11-comment-threads.md).
3. **Coordination**:
   - **Current Stage** select (applied only on **Save Changes**).
   - **Assigned Driver**: shows the volunteer's display name, or "None Assigned". Buttons: **Volunteer** (claim) and **Remove**.
   - **Request Coordinator**: same control.

Footer: **Copy Link** (modal only; changes to "Link Copied" for 2 s), **Close**, **Save Changes**.

The modal title reads "Request Received **3 days ago**", with a calendar-icon tooltip showing the exact date.

## Volunteer assignment

`src/api/update-volunteer.ts` writes right away (no Save needed):

| Action             | Write                                |
| ------------------ | ------------------------------------ |
| Claim driver       | `{ driver: myUid, hasDriver: true }` |
| Remove driver      | `{ driver: '', hasDriver: false }`   |
| Claim coordinator  | `{ coordinator: myUid }`             |
| Remove coordinator | `{ coordinator: '' }`                |

- `hasDriver` is a **derived boolean** kept next to `driver`. It exists because Firestore handles `!=` and "is empty" queries poorly, so "has a driver" becomes a simple equality filter. Keep this idea if you stay on Firestore. In SQL it's just `driver_id IS NOT NULL`.
- The role keys come from a larger list in `objects/roles.ts` (driver, coordinator, security, tech, social, photographer, laborer, cook, planner, designer, emotional, legal, medical). Only `driver` and `coordinator` are used. The rest came from the removed volunteer application ([14](14-removed-experiments.md)). It's a ready-made list if you ever want role-based matching.

## Shareable request page

- `/view-request/:id` loads the request directly by document ID and renders the same form outside the dashboard.
- It's how volunteers sent each other links over text or Signal. With `HashRouter`, links look like `https://…/#/view-request/<id>`.
- Not found: it shows "404: Request not found", but **also redirects to `/sign-up`** because `navigate()` is called during render.

## Bugs and risks

- **Anyone can remove anyone.** The Remove button is enabled for any member, not just the person assigned or a moderator.
- Last write wins: two volunteers who claim at the same moment overwrite each other. Use a transaction or a conditional update ("only if empty").
- Assignment changes don't update the `DashboardContext` cache, so the table's Delivery badge stays stale until Refresh.
- The stage `select` uses `defaultValue`, and the modal reopens with cached data. It's easy to show a stale stage.
- `RequestModal` calls `fetchRequest(id)` on open. That sets the **global** `isLoading`, which blanks the whole table behind the modal for a moment.
- The route is public. Whether a signed-out visitor can read a request (name, phone, **health conditions**) depends entirely on Firestore rules, which aren't in the repo. **Check this before the old project is shut down, and make it impossible in the rebuild.**
- There is no history of who changed the stage or when.

## In the rebuild

- One `/dashboard/requests/[id]` route that works as both an intercepted modal (Next.js parallel and intercepting routes) and a full page, behind auth.
- An audit log or activity entries for stage changes and assignments. They can share the comment feed ("Alex claimed driver", "Stage → Ready").
- Server actions with authorization checks: only the assignee or a moderator can unassign.
