# 08 · Organizations and Membership

Volunteers belong to organizations. **Being a member of any organization is what unlocks the Requests tab.** Moderators approve join requests. This is the dashboard's landing page (`/dashboard` and `/dashboard/overview`).

## Roles

| Role           | How you get it                                                                                  | What it unlocks                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Signed-in user | Sign up                                                                                         | Overview and Settings tabs; can request to join organizations                   |
| Member         | A moderator approves your join request                                                          | Requests tab: triage, assignment, comments                                      |
| Moderator      | Your UID is in the org's `moderators` array (set by hand in Firestore, or by `addOrganization`) | Approve join requests; toggle the [kill switch](02-request-form-kill-switch.md) |

There's no UI to promote someone to moderator, remove a member, leave an organization, or create an organization (`src/api/add-organization.ts` exists, but nothing calls it).

## Data

`organizations/{orgId}` in Firestore:

```ts
{ name, joined, lastUpdated, website?, about?, phone?, email?,
  moderators: uid[], members: uid[], requests?: uid[] /* pending joins */ }
```

Membership is stored as **UID arrays on the organization**, not as a separate membership collection.

## Overview tab UI

- **Organizations card:** lists every organization with its name, member count and "Joined X days ago".
  - If you're not a member: a **Join Organization** button. Once clicked it changes to a disabled **Request Pending**.
  - If you're a member: a **View Members** button that opens the modal.
- **Organization modal:**
  - Moderators see a **Member Requests** list, each with an **Approve** badge.
  - Everyone sees the member list with **Moderator** or **Standard** badges. Names come from the RTDB `displayNames` map, falling back to "Anonymous".

## Writes

`src/api/update-organization-requests.ts`:

- Request to join: `updateDoc(org, { requests: arrayUnion(uid) })`
- Approve: `updateDoc(org, { members: arrayUnion(uid), requests: arrayRemove(uid) })` in **one** update, so the user moves from pending to member atomically.
- Both update the local cache in `DashboardContext` right away, with no refetch.

## Gaps

- **No reject or deny.** A pending request stays until it's approved.
- **Organizations don't scope data.** A member of _any_ organization sees _every_ request. `requests.organizations` exists (always `['communalists']`) but no query filters on it. If the rebuild supports several organizations, scope requests by org in both the queries and the security rules.
- The `moderators` value of the third `state` option in `updateOrganizationRequests` does nothing.
- `fetchOrganization` in the context is a no-op.
- All organizations, including their full member UID lists, are loaded for every signed-in user.
- The approve permission is enforced only in the UI. Rules must make sure only moderators can change `members`, and that a user can add only **themselves** to `requests`.

## In the rebuild

Use a relational shape (`memberships(user_id, org_id, role, status)`) whether you stay on Firestore or move to Postgres. It makes reject, leave, promote and audit trails simple, and lets row-level security scope requests to the user's organizations.
