# 14 · Removed Experiments

These features were built and then removed. Knowing why they were cut saves you from rebuilding them by reflex.

| Feature | Removed in | What it was | Why it was cut |
|---|---|---|---|
| Volunteer application and approval | `8e6c8f4` (Jun 2023, −519 lines) | Sign-up collected a bio, role checkboxes (driver, cook, legal…) and an `approved` flag. Admins reviewed applications in an Applications tab (`ApplicationsTable`, `ApplicationModal`, `ViewApplicationForm`, `AccountsCard`, `approve-account.ts`). Unapproved users saw `NotApprovedPage`. | Organizers didn't use it. Collecting personal data nobody used was a liability. Organization join approval ([08](08-organizations-and-membership.md)) replaced it as the gate. |
| Dashboard chat | `35360e4` (Apr 2023) | A `ChatPage` tab in the dashboard, built on a third-party package. | "Unknown bugs." Per-request comment threads ([11](11-comment-threads.md)) covered the real need. |
| Multiple named organizations | `c910685`, `3d1c0bf` | Two partner organizations (`sjfnd`, `svdsa`) were wired into the components. | Removed "for the moment". Requests now default to `organizations: ['communalists']`. |
| Donations dashboard | Commented out in `DashboardPage.tsx` | See [04](04-donations.md). | Unfinished (stage saving never implemented). |
| Location and language filters | Commented out in `FilterForm` | Filter the request table by city or language. | Not recorded. Probably too many Firestore index combinations, or little use. |

## Leftovers still in the code

- `objects/roles.ts` (13 volunteer roles), `interfaces/roles.ts`
- `src/api/get-unapproved-accounts.ts`, `src/api/get-volunteers.ts` (query the removed `approved` field)
- `src/pages/Dashboard/NotApprovedPage.tsx`
- `src/utils/organize-applications-by-date.ts`
- Snippets `sign-up-form.bio.*`, `role.label`, `success.*`
- `types/race.ts`, `types/pronouns.ts`, `types/country.ts`, `types/us-state.ts`: demographic types from an earlier, larger sign-up form

## Lesson

Each removal moved toward **collecting less data and having fewer moving parts**. The flows that survived (request → triage → assign → comment → fulfil, plus moderator-approved membership) are the real product. Rebuild those first.
