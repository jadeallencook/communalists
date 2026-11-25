# 18 · Super users and unclaimed organizations (rebuild)

While there are few users, the people running Communalists add organizations themselves so neighbors can find help nearby, such as a church's weekly free shower. These pages are **unclaimed**: nobody owns them, and the real organization can **claim** the page or ask for it to be **taken down**. Agreed with the user on 2026-11-24 ([decision #33](../decisions/033-super-users-and-unclaimed-organizations-claims.md)).

**Status:** built 2026-11-24. **Next:** super users add **events** to unclaimed organizations, once the calendar tool exists. That brings back the prototype's events directory ([03](03-events-directory.md)) with real data.

## Super users

A few accounts ("super users", or platform admins in code) can do what nobody else can. Today that's three things: add unclaimed organizations, act as the owner of every unclaimed organization, and decide claim requests.

- **Who:** the UIDs in `PLATFORM_ADMIN_UIDS`, comma or space separated, set per environment (Vercel production, and `.env.local`). The list is kept out of the repo. Locally, seeded accounts marked `"platformAdmin": true` are super users too (Jordan Lee; see [getting started](../getting-started.md#test-data)), but only when `isLocalDev()` is true.
- **Removing someone** takes effect on the next deploy (or restart, locally). The list is read on every check, and no session or token holds the role.
- **Checked on the server only:** `isPlatformAdmin(uid)` and `requirePlatformAdmin(next)` in `src/lib/auth/platform-admin.ts`. Every super-user action checks again, because server actions can be called directly.
- **Narrow on purpose.** Super users can't read members-only tool data or act inside claimed organizations. They have no role in an organization unless they're a member of it like anyone else. One stolen super-user account must not expose every group's private data. Add a new power only for a real need, and log it.
- **Audit:** every super-user action goes in `adminLog`, shown on `/admin` under **Recent super user actions**.

## Unclaimed organizations

| What             | How it works                                                                                                                                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Adding one       | A super user ticks **Add as an unclaimed organization** on the normal create form (`/org/new`; `/admin` links to it with the box ticked). Same fields and rules. The 5-owned limit doesn't apply, because nobody owns it.                             |
| Owner            | **None.** No membership is created, so the super user who added it is never listed. `createdBy` keeps their UID for the audit trail and is never shown.                                                                                               |
| Who manages it   | **Every super user acts as its owner** (`effectiveRole` in `src/lib/platform-admin.ts`): they can edit every field, including the handle (30-day limit still applies). Next: events.                                                                  |
| Edits in the log | Logged in the organization's own log as "The Communalists team changed …", never by name, so the eventual owner doesn't see who edited it. The admin log records which super user it was.                                                             |
| Its page         | An **Unclaimed** label, no member count and no member list, and a notice: Communalists volunteers added it so neighbors can find help nearby, the organization doesn't run the page, and details may be out of date, so check with them before going. |
| Joining          | **Off.** There's nobody to approve requests, so the Join button is replaced by the notice, and the server refuses to join (`unclaimed`).                                                                                                              |
| Finding it       | Listed in `/find` and the dashboard's "near you" like any listed group, with an **Unclaimed** label on the card (the user's choice, over link-only).                                                                                                  |

## Making an organization unclaimed

For a super user who added an organization the normal way by mistake, and so is listed as its owner ([decision #37](../decisions/037-deleting-organizations-restore-and-make-unclaimed.md)). **Make unclaimed** appears in the members' space when they're a super user, an owner, and its only active member. After a confirmation, their membership and any join requests are removed, and it becomes unclaimed with the same handle and details. It's refused when anyone else is a member, because they'd silently lose their group. Logged in the admin log.

Verified 2026-11-24: as Jordan, created Mistake Pantry without ticking unclaimed, so he was listed as Owner. **Make unclaimed** turned it into an unclaimed page, with its phone, year and address unchanged.

## Claiming or taking down

The notice has **Is this your organization? Claim it**, which goes to `/org/{handle}/claim` (sign-in and a finished account needed).

1. **The request:** what they want (**Manage this page** or **Take this page down**), their role there (up to 100 characters), and how the team can confirm it's them (10 to 1,000 characters, for example "call the church office and ask for me"). The form says that only the team sees it, together with their name and account email, and that we may email them about it.
2. **Review:** super users see pending requests on `/admin`, oldest first, with the role, the note, a link to the person's profile, and their **account email** (read from Firebase Auth when the page loads, never stored with the request). The page tells them to check outside the app before approving, for example by phoning the organization's public number. There's no automatic proof: a domain-email check would leave out the many small groups that use Gmail.
3. **Decision**, checked again on fresh data in one transaction (`decideClaim`):
   - **Approve a claim:** the person becomes the **owner**. The organization stops being unclaimed and super users lose their access to it. Its log says "{name} claimed this organization". The 5-owned limit applies.
   - **Approve a takedown:** the organization is **archived**, like an owner deleting it: the page and listings disappear and the handle stays reserved.
   - **Deny:** the request is marked denied. They see "We couldn't confirm your last request" and can send a new one.
   - Approving closes everyone else's pending request for that organization (`outcome: resolvedByOther`).
4. **The person sees** their request's status on the claim page (sent on {date}, with **Cancel request**). Once approved, the organization is on their dashboard. **No notifications yet:** there's no email sending, so the team emails them by hand if needed.

## Pages

| Route                 | Who         | What                                                                                                                 |
| --------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------- |
| `/admin`              | Super users | Claim requests (approve with a confirmation, or deny), unclaimed organizations, the admin log. 404 for everyone else |
| `/org/{handle}/claim` | Signed in   | The claim form, or the pending request with Cancel. Redirects to the page once claimed                               |
| `/dashboard`          | Super users | A **Super user** box with the number of requests waiting, linking to `/admin`                                        |

## Data

- `organizations/{id}`: `claimStatus: 'unclaimed'` while unclaimed (removed when claimed), `memberCount: 0`, `createdBy` (the super user). After a claim: `claimedBy`, `claimedAt`.
- `claimRequests/{orgId}_{uid}`: `intent` (`claim`/`remove`), `role`, `message`, `status` (`pending`/`approved`/`denied`), `outcome` (`decided`/`resolvedByOther`), `org { name, handle }` and `claimant { displayName, username }` (copies), `requestedAt`, `decidedAt`, `decidedBy`. One per person per organization; a new request after a denial replaces it.
- `adminLog/{id}`: `action` (`createUnclaimed`, `editUnclaimed`, `approveClaim`, `approveRemoval`, `denyClaim`), `orgId`, `orgName`, `actorUid`, `target { uid, displayName }?`, `fields[]?`, `createdAt`. Append-only.
- In an organization's `moderationLog`: `claim` entries, and `actor { uid, team: true }` for super-user edits.

All through the Admin SDK; the rules still deny clients. Queries: `claimRequests where status == pending`, `claimRequests where orgId == X and status == pending`, `organizations where claimStatus == unclaimed and status == active`, `adminLog` ordered by `createdAt`. All equality-only or one order, so no composite index. Reads are cached and tagged (`claims`, `adminLog`, `directory`); the actions that write clear them.

## Privacy

A claim collects a role and a free-text note, and shows the account email to super users. Nothing else is collected, and none of it is ever public or logged. Requests aren't deleted after a decision, so a disputed claim can be looked into later. If that turns out not to be needed, delete decided requests after a while.

## Built (2026-11-24)

| Piece                                                        | Where                                                                                                                                                                                                                             |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Who's a super user, `effectiveRole` (pure, tested)           | `src/lib/platform-admin.ts`                                                                                                                                                                                                       |
| Server gate                                                  | `src/lib/auth/platform-admin.ts`                                                                                                                                                                                                  |
| Claim form schema, page state, decision rules (pure, tested) | `src/lib/organizations/claims.ts`                                                                                                                                                                                                 |
| Firestore: requests, decisions, unclaimed list, admin log    | `src/lib/organizations/claim-store.ts`; `createUnclaimedOrganization` in `src/lib/organizations/index.ts`                                                                                                                         |
| Pages and actions                                            | `/admin`, `/org/{handle}/claim`; the unclaimed path in `/org/new` and `/org/{handle}/edit`                                                                                                                                        |
| UI                                                           | `UnclaimedNotice`, `ClaimOrganizationForm`, `ClaimOrganizationPage`, `AdminPage`; unclaimed states on `OrganizationPage`, `OrganizationProfile`, `OrganizationCard`, `DashboardPage`, `CreateOrganizationForm` (all in Storybook) |

**Verified 2026-11-24** in a real browser against the seeded emulators:

- **Signed out:** the unclaimed page showed the label, the notice and **Claim it**, with no member count or join button.
- **As Jordan (super user):** the dashboard showed "1 claim request waiting", and the nearby card was labeled Unclaimed. On `/org/new?unclaimed=1` the box was ticked; creating Downtown Free Laundry led to its unclaimed page, with Edit and no owner. Editing its description worked.
- **As Maya (not a super user):** `/admin` gave a 404. The empty claim form showed both field errors, and a valid request showed "Request sent" with Cancel.
- **As Jordan again:** both requests were listed. Each button named its target ("Deny: Maya Thompson, Downtown Free Laundry"). Denying announced the result and moved focus to it. Approving Priya's claim on Eastside Shower Day asked for confirmation, and then the page showed Priya as Owner, 1 member and no label, with Jordan seeing **Ask to join** like anyone else. The admin log listed the add, the edit and the denial.
- **As Priya:** Manage members showed "Priya Patel claimed this organization", without naming a super user.
- The Spanish page showed "Sin reclamar".

Not checked yet: a screen reader pass, 200% zoom, and the Storybook a11y panel in both themes on the new stories. Approving a takedown is covered by the decision rules' tests, not tried in the browser.
