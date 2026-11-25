# 16 · Organizations (rebuild)

The heart of the platform: people create, find and join **organizations**, and an organization's tools only work for its members. This is the rebuild's design, agreed with the user on 2026-11-22 ([decision #22](../decisions.md)). It replaces the prototype's single hard-coded organization ([08](08-organizations-and-membership.md)). Read 08's "Gaps" for what went wrong there.

**Status:** phase 1 built 2026-11-22, except the logo upload. Phase 2 (finding, joining, moderating members) and editing built 2026-11-23. See "Built" at the end. **Unclaimed organizations** (added by super users, with no owner until a group claims them) are in [18](18-unclaimed-organizations.md).

## What an organization has

| Field            | Rules                                                                                                                                                                                                                                                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name             | Required, 2–80 characters. Not unique.                                                                                                                                                                                                                                                                                      |
| Handle           | Unique public address: `communalists.com/org/{handle}`. Lowercase `a–z`, `0–9` and `-`, 3–30 characters, no leading, trailing or double hyphen. Suggested from the name, with a live availability check, re-checked on the server. Can't be a reserved word. See "Handles" below.                                           |
| Focus areas      | What the group works on: **1 to 3** from a fixed, translated list. See "Focus areas".                                                                                                                                                                                                                                       |
| Description      | Plain text, up to ~2,000 characters. Organization content isn't translated (product rule).                                                                                                                                                                                                                                  |
| Location         | A city from the same picker as account setup, stored the same way: label, coordinates rounded to ~1 km, geohash. The city is what finding organizations uses.                                                                                                                                                               |
| Street address   | Optional and **public**, up to 200 characters, one line ("749 Story Rd, San Jose, CA 95122"), with a **Get directions** link (a map search, opened only when clicked). Only a public place (office, church, community center), never a home; the form says so. Events will start from it ([decision #35](../decisions.md)). |
| Reach            | `local` with a radius of **5 / 10 / 25 / 50 / 100 mi** (stored in km; miles in the US), `national` (its country), or `international`.                                                                                                                                                                                       |
| Languages spoken | One or more of a list (at least the four UI languages, likely more), so people can find, say, a Vietnamese-speaking group.                                                                                                                                                                                                  |
| Website          | Optional URL (`https` only).                                                                                                                                                                                                                                                                                                |
| Socials          | Optional list of `{ platform, handle }`: Instagram, Facebook (page), Facebook group, X, Bluesky, TikTok, YouTube, Telegram. People type just the username; a pasted profile link is cut down to it. We build the link, so it's always that platform's profile page ([decision #32](../decisions.md)).                       |
| Contact email    | Optional, **public** on the organization's page.                                                                                                                                                                                                                                                                            |
| Logo             | Optional image upload (Firebase Storage). Type and size checked on the server.                                                                                                                                                                                                                                              |
| Join policy      | `request` (default): people ask, owners or moderators approve. `open`: join instantly. `invite`: invited people only.                                                                                                                                                                                                       |
| Visibility       | `listed` (default): shows up when browsing. `unlisted`: reachable by link only (for groups that don't want to be found, like a tenant union organizing against a landlord).                                                                                                                                                 |
| Member list      | Who sees every member's name on the group's page: `public` (anyone, signed out too), `members` (default: members see everyone), or `hidden` (just the count). Owners and moderators are always named, and everyone sees the count. Staff always see everyone on the members page.                                           |

### Focus areas

General · Food · Housing · Transportation · Technology · Health · Childcare · Education · Clothing · Hygiene · Lending · Disaster relief · Legal · Labor · Arts · Hobbies · Faith · Animals · Environment · Other

- **It's "what do you work on", not "what kind of group are you".** People search by need ("food", "cars"), and one group often does several things. A "kind of group" field (tenant union, club, student group) was dropped for now; it can be added later as an optional field ([decision #23](../decisions.md)).
- **Short labels** (one word where possible), so the checklist scans and cards stay short. Where one word would narrow the meaning, a broader word was picked: **Lending**, not Tools (libraries lend more than tools); **Environment**, not Gardening (cleanups and climate groups too). Labels can change; keys can't.
- **Hygiene** (showers, laundry, hygiene kits, haircuts) was added on 2026-11-24 ([decision #34](../decisions.md)): showers had nowhere to go, and they were a big part of the prototype's listings.
- **Up to 3**, so a group can say what it does without ticking everything to appear in every search. The form disables the other boxes at 3; the server enforces it too.
- **Stored as permanent keys** (`food`, `transportation`, `disasterRelief`). Labels live in `messages/*.json` and can be reworded any time. Never rename or reuse a key. To retire one, list it in `RETIRED_FOCUS_AREAS`: it's hidden from the form and still shown on groups that have it. A test locks the key list.

## People and roles

| Role      | Can                                                                                                                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Owner     | Everything a moderator can, plus make members and moderators **owners**, make moderators regular members again, remove and ban moderators, change the handle, and delete (archive) the organization |
| Moderator | Approve or deny join requests; make members **moderators**; remove and ban **members** (not other moderators or owners); edit the profile; run the tools                                            |
| Member    | Use the members-only side of the tools                                                                                                                                                              |

- **One membership record per person per organization:** `role` (`owner` / `moderator` / `member`) and `status` (`active` / `pending` / `invited` / `banned`). This is not an array on the organization; that was the prototype's mistake ([08 → Gaps](08-organizations-and-membership.md#gaps)). It makes deny, leave, promote, remove and audit possible, and keeps member lists off every client.
- The record also carries a small copy of the organization (name, handle, focus areas, logo), so the dashboard lists all of a person's organizations in **one query**, and a copy of the person's name, so a member list is one query too. Renaming an organization updates its copies; saving a profile updates the name copies.
- **An organization always has at least one owner.** The last owner can't leave or step down without handing ownership to someone.
- **A person can own at most 5 organizations** (abuse limit; open sign-up means open creation). Unclaimed organizations don't count: nobody owns them ([18](18-unclaimed-organizations.md)).
- Creating requires a finished account (name and city), which `requireAccount` guarantees.

## Handles

- **Uniqueness:** Firestore has no unique constraint, so each handle is claimed by a `handles/{handle}` document written in the **same transaction** as the organization.
- **Reserved:** `www`, `app`, `api`, `admin`, `auth`, `dashboard`, `account`, `org`, `orgs`, `new`, `settings`, `help`, `support`, `status`, `docs`, `blog`, `mail`, `storybook`, `static`, `assets`, `cdn`, `dev`, `staging`, `communalists`, and the locale codes. The list lives in code.
- **Renaming is allowed** (owners only, at most once every 30 days). **No redirects:** the old address stops working, and breaking their own links and flyers is the group's choice (the user's call, 2026-11-22). The old handle is **held for 30 days** so nobody else can claim it and pose as the group to people following old links. With the 30-day rename limit, an organization holds at most one old handle at a time, so nothing piles up.
- **Subdomains** (`sbma.communalists.com`) are optional and later. They'd point at the same `/org/{handle}` pages once `communalists.com` is on our Vercel account ([deployment](../technical/deployment.md)).

## Finding organizations

`/find` (public, in all four languages) and a preview on the dashboard. Only **listed, active** organizations appear ([decision #26](../decisions.md)).

- **From a city:** the visitor's chosen city; otherwise a signed-in visitor's profile city; otherwise **San Francisco** (`DEFAULT_PLACE`, the user's choice 2026-11-23), with a note that it's a starting point and to choose their own city. The default stays out of the URL until they pick a city, so the note stays while they filter. The homepage banner's main button, **Browse organizations**, leads here.
- **Distance** (5, 10, 25, 50 or 100 mi; 25 by default) applies to **local** groups: every local group **based** within that distance shows, closest first. The group's own service radius isn't checked (the user's call, 2026-11-23: more results, and people can judge for themselves). This replaces the earlier plan of checking each group's radius.
- **Nationwide** groups show when they're based in the visitor's country, and **international** groups always. Both are sorted biggest first.
- **Filters:** groups that are local, national or international (all by default; choosing none means all), focus areas, languages spoken. Focus areas and languages match if a group has **any** of the chosen ones.
- **Results are grouped** into "Near {city}", "Nationwide" and "International", each with a count and an empty message. Cards show focus areas and "4 mi away · Santa Clara, California" (or "In {city}" under a mile). Signed-in visitors also get a "Create organization" prompt.
- **Live, in the URL:** each change replaces the URL (`/find?country=US&placeId=5392171&radius=50&focusAreas=food&languages=vi&reach=local`), so a search can be shared or bookmarked; defaults are left out. Old results dim while new ones load. Unknown or malformed values in the URL are ignored, never an error. Without JavaScript the form submits as a plain GET (though the city picker needs JavaScript).
- **Dashboard:** "Find organizations near you" shows the 3 closest local groups within 25 mi that you're not already in, and links to `/find`.

**How it reads.** Three cached reads, all tagged `directory`, cleared when an organization is created (and by the dev toolbar's reset):

- local groups within 100 mi of the city: geohash range queries on `location.geohash` (geofire's bounds), then exact distance. Cached per city, so the distance and other filters cost no reads;
- nationwide groups in a country, and international groups: equality-only queries.

Filtering and sorting happen in memory (`src/lib/organizations/directory.ts`), so no composite indexes are needed. This reads every group in a 100 mi circle once per city per cache lifetime, which is fine at today's size. With thousands of groups per region, add paging and push the reach and status filters into the queries (with indexes).

## Joining

The join area on a group's page depends on the viewer (`joinState` in `src/lib/organizations/membership.ts`):

| Viewer                    | Sees                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| Signed out                | **Sign in to join** (sign-in doesn't return to the group yet; it lands on the dashboard) |
| Open group                | **Join**: they're a member at once                                                       |
| Group that takes requests | **Ask to join**, then "Request sent" with **Cancel request**                             |
| Invite-only group         | "This group is invite only." (inviting comes later)                                      |
| Banned                    | "You can't join this group." The policy doesn't matter                                   |
| Member                    | **Leave group** in the members' space, after a confirmation                              |

- Joining needs a finished account (the name is shown to the group); otherwise it goes to account setup and back.
- **The last owner can't leave.** They make someone else an owner first (on the members page), then leave.

## Moderating members

Owners and moderators get **Manage members** (with the number of open requests) in the members' space, leading to `/org/{handle}/members`: **Requests** (oldest first), **Members** (with role changes, remove and ban), **Banned** and **Recent actions**.

| Action              | On                    | Result                                                                                 | Reason   |
| ------------------- | --------------------- | -------------------------------------------------------------------------------------- | -------- |
| Approve             | a request             | Member                                                                                 | —        |
| Deny                | a request             | Request deleted; they can ask again                                                    | —        |
| Deny and block      | a request             | Banned                                                                                 | Required |
| Remove              | a member              | No longer a member; they can ask again                                                 | Required |
| Ban                 | a member              | Banned: not a member, and can't ask again                                              | Required |
| Unban               | a banned person       | Ban lifted; they can ask again                                                         | —        |
| Make moderator      | a member              | Moderator (owners and moderators can do this)                                          | —        |
| Make owner          | a member or moderator | Owner, after a confirmation (owners only). Refused if they already own 5 organizations | —        |
| Make regular member | a moderator           | Member (owners only)                                                                   | —        |

- **Block and ban are one thing** (status `banned`), whether it started as a request or a membership.
- **Who can act on whom:** owners on moderators and members, moderators on members only, nobody on owners (or on themselves). **Owners are permanent for now:** no one can demote or remove an owner; an owner steps down by leaving, as long as another owner remains. The buttons follow these rules, and the server checks them again on fresh data. Role changes are logged too.
- **Reasons** (up to 500 characters) go in the group's **moderation log** with who did it and when, and a ban's reason is also kept on the banned record. Owners and moderators see them; the person acted on doesn't. The log is meant to back up decisions later, such as closing an account. Every action is logged, with or without a reason.

## Editing

Owners and moderators get **Edit organization** in the members' space, leading to `/org/{handle}/edit`: the create form, filled in, with **Save changes**. Every field can be edited, including the member list setting. The logo isn't built yet.

- **The handle is owners only,** at most once every 30 days ("Renaming" above). Moderators see it read-only ("Only owners can change the handle."), and so do owners within 30 days of a change ("You can change the handle again on {date}"). Keeping the current handle reads "This is your current handle", not "taken".
- **Saving** checks the editor's role, the 30-day limit and the new handle's claim on fresh data in one transaction. The old handle becomes a **hold** (`heldUntil` 30 days out): it no longer resolves (not found, no redirect), and nobody else can take it until the hold ends. After that, anyone can claim it.
- **Copies:** a new name, handle or focus areas is written to every membership's copy (in batches of 400 after the save), and every member's dashboard cache is cleared.
- **Logged:** each save with changes adds "{actor} changed {fields}" to Recent actions, listing the fields (`editProfile` with `fields`).
- After saving, it returns to the organization's page at its (possibly new) address.

## Deleting

Owners can delete. It **archives**: data is kept, the page and listings disappear, and the handle stays reserved. Hard deletion is a later, deliberate admin action.

## Pages

| Route                    | Who               | What                                                                                                     |
| ------------------------ | ----------------- | -------------------------------------------------------------------------------------------------------- |
| `/dashboard`             | Signed in         | **Your organizations** (cards), **Create organization**, and the closest organizations you're not in     |
| `/find`                  | Anyone            | Find organizations from a city, with distance, reach, focus area and language filters                    |
| `/org/new`               | Signed in         | Create form; the creator becomes owner                                                                   |
| `/org/{handle}`          | Anyone            | Public profile (name, focus areas, description, location and reach, languages, links, logo, join button) |
| `/org/{handle}` (member) | Members           | Plus a members-only home, where tools will appear                                                        |
| `/org/{handle}/members`  | Owners/moderators | Requests, members, bans and the moderation log                                                           |
| `/org/{handle}/manage`   | Owners/moderators | Profile, handle, roles (phase 3)                                                                         |

Bare `communalists.com/org/{handle}` redirects to the visitor's language, like every page, so it works on flyers.

## Phases

1. **Create and list:** the data model, create form with handle check, dashboard "Your organizations" plus "Create organization", the `/org/{handle}` page (public profile plus a member view), and the logo upload last.
2. **Find and join:** "near you" browsing, joining by each policy, approving and denying requests, removing and banning (all built 2026-11-23).
3. **Manage:** invite, archive, logo. (Promoting, handing over ownership, editing the profile and changing the handle were built 2026-11-23.)
4. **Then:** subdomains (after the domain move) and the first tool, Requests.

## Data and security notes

- All reads and writes go through server actions and the Admin SDK (deny-all rules stay); every action checks the caller's membership and role on the server.
- Reads are cached with tags (`org:{id}`, the user's membership list) and cleared by the actions that write ([firebase.md → Caching reads](../technical/firebase.md#caching-reads-in-the-rebuild)).
- Logos need Storage rules, the Storage emulator locally, and type and size limits enforced on the server.
- Contact email is the only personal-ish field and it's opt-in and public by design. Member names are shown only as the group's member list setting allows (members only by default); requests, bans and reasons are staff-only and never leave the server for anyone else.

## Built (phase 1, 2026-11-22)

| Piece                                                                                                    | Where                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lists and pure rules (focus areas, reach, radius, languages, URL normalizing, `MAX_OWNED_ORGANIZATIONS`) | `src/lib/organizations/options.ts`                                                                                                                                                     |
| Social platforms, handle rules, building links, reading older `{ platform, url }` data                   | `src/lib/socials.ts`, `src/lib/validation/socials.ts`                                                                                                                                  |
| Handle rules, reserved words, suggestion from the name                                                   | `src/lib/organizations/handle.ts`                                                                                                                                                      |
| Form schema (`organizationSchema`, errors as translation keys)                                           | `src/lib/validation/organization.ts`                                                                                                                                                   |
| Firestore: create transaction, cached reads, fresh reads for access                                      | `src/lib/organizations/index.ts`                                                                                                                                                       |
| Live handle check (signed-in only)                                                                       | `GET /api/handles/{handle}`, `useHandleAvailability`                                                                                                                                   |
| Language names (browser data, with a fallback for `ase`)                                                 | `languageName` in `src/lib/organizations/client.ts`                                                                                                                                    |
| Pages                                                                                                    | `/dashboard` (your organizations + create), `/org/new`, `/org/{handle}`                                                                                                                |
| UI                                                                                                       | `HandleField`, `SocialLinksField`, `ChoiceGroup`, `OrganizationCard`, `CreateOrganizationForm`, `OrganizationProfile`, `OrganizationPage`, `CreateOrganizationPage` (all in Storybook) |

**How it behaves:**

- **Creating** runs one transaction: it checks the handle claim and the 5-owned limit, then writes the organization, `handles/{handle}` and the owner's membership together. A second create with the same handle gets "That handle is taken".
- **The create form** starts at the creator's city and the UI language. The handle follows the name until the person edits it. The radius only shows for local reach. Defaults are request-to-join and listed.
- **`/org/{handle}`:** an uppercase URL redirects to lowercase. Unlisted organizations get `noindex`. The members' space shows only for active members, checked with a fresh read. Signed-out visitors see "Joining opens soon."
- **Unknown handles** show the not-found page, but with HTTP status 200: the page shell has already been streamed when the lookup fails. Search engines still get `noindex`.
- **Reads:** the dashboard's membership list and organization lookups are cached and tagged (`memberships:{uid}`, `handle:{handle}`, `org:{id}`). Creating clears them. A cached "not found" is confirmed with a fresh read before showing 404, because it may have just been created on another server instance.

**Verified 2026-11-22:**

- **End-to-end against the emulators:**
  - Signed out: `/org/new` sends to sign-in, the handle API returns 401, and unknown organizations show not-found.
  - Before any organizations: the dashboard shows the empty state.
  - The handle API answers available, tooShort, reserved, format and taken correctly.
  - The create page has the city pre-filled, the address prefix, and request-to-join chosen.
  - Validation shows all six error types, plus too many focus areas (4) and an unknown focus area key.
  - After creating: it redirects to the page, the owner view and signed-out view are right, the dashboard lists it as Owner, a duplicate handle is rejected, the uppercase URL redirects, and the Spanish page is translated.
  - Unlisted + national: `noindex`, the note, "Nationwide".
  - The 6th organization is blocked with the limit note, and the dashboard drops Create.
  - Stored data has the right shape: reach in mi and km, a normalized website, `focusAreas` on the organization and its membership copy, and the owner membership.
  - Cards list focus areas in the UI language's list style ("General and Food"; Chinese "A、B和C"). Re-run 2026-11-23 after the switch to focus areas.
- **In a real browser:** the dashboard, the organization page, and the create form (the handle suggested and checked live, a social link added, submitted, landing on the new page).
- **Bug found and fixed:** American Sign Language (`ase`) showed as its raw code, because browsers don't name it. It now has a fallback name in all four languages, with a test that no offered language ever shows a bare code.

## Built (finding, 2026-11-23)

| Piece                                                                                  | Where                                                                                           |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Filters from the URL, filtering and sorting (pure, tested)                             | `src/lib/organizations/directory.ts`                                                            |
| Cached reads: `getDirectoryLocal`, `getDirectoryNational`, `getDirectoryInternational` | `src/lib/organizations/index.ts`                                                                |
| Page and live filters                                                                  | `src/app/[locale]/find/` (server container + `FindContainer`)                                   |
| UI                                                                                     | `OrganizationFilters`, `FindOrganizationsPage`, `OrganizationCard` (`detail`), all in Storybook |

**Verified 2026-11-23** against the seeded emulators:

- **By URL:** San Jose at 25 mi gives 4 local groups (the unlisted tenants union never shows), and 50 mi adds Oakland and Berkeley. Food narrows to 3. Vietnamese with local only gives the 2 that list it. Oakland at 10 mi gives Oakland and Berkeley. The Spanish page loads.
- **In a real browser, signed in as Thanh:** `/find` starts from her city. Choosing Housing updates the results and the URL. Switching the city to Berkeley keeps the filter. The dashboard shows the 2 closest groups she isn't in, and links to `/find`.
- A production build passes (`/find` is partly prerendered).

## Built (joining and moderating, 2026-11-23)

| Piece                                                                                                                                           | Where                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Rules: who can act on whom, reasons, join state, whose names show (pure, tested)                                                                | `src/lib/organizations/membership.ts`                                                                        |
| Firestore: `joinOrganization`, `cancelJoinRequest`, `leaveOrganization`, `moderateMember`, `getOrgPeople`, `getModerationLog`, `syncMemberName` | `src/lib/organizations/index.ts`                                                                             |
| Server actions                                                                                                                                  | `src/app/[locale]/org/[handle]/actions.ts` (`membershipAction`, `moderateAction`)                            |
| Pages                                                                                                                                           | `/org/{handle}` (join area, member list, Manage members), `/org/{handle}/members`                            |
| UI                                                                                                                                              | `JoinPanel`, `MemberList`, `ReasonDialog`, `OrganizationMembersPage`; member list setting in the create form |

**How it behaves:** every write is a transaction that re-reads what it decides on and keeps `memberCount` right. Each action clears the group's caches (`org:{id}`, `orgMembers:{id}`, `directory`) and the affected person's dashboard.

**Verified 2026-11-23** in a real browser against the seeded emulators:

- **As Maya (owner of South Bay Mutual Aid):** Manage members showed 2 requests. Approving Marcus made him a member (9). Banning Luis asked for a reason, then showed him under Banned with it, and in Recent actions. At an open group, Join was instant, and Leave (after the confirmation) worked. Cancelling a request worked. Leaving her own group as the only owner was refused with the message.
- **As Thanh (moderator):** no buttons on the owner or herself; Remove and Ban on members. At Oakland Auto Club, where she's banned, she saw "You can't join this group", and `/members` sent her back to the group page.
- **Signed out:** the "members only" group named only its owner and moderator, plus "and 6 other members"; a "public" group named everyone.

**Role changes (2026-11-23):** owners make members moderators or owners, make moderators owners, and make moderators regular members again; moderators make members moderators (`allowedRoleChanges`). Making an owner asks for confirmation and respects the 5-owned limit. Verified in a real browser: Maya made Aisha a moderator and Thanh an owner (both in Recent actions), then could leave her own group. As a moderator, Aisha saw only Make moderator, Remove and Ban on members, and nothing on the owner or herself. The 5-owned limit for a new owner is covered by the server check, not tested in the browser.

## Built (editing, 2026-11-23)

| Piece                                                                                                          | Where                                                                                                     |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Rules: handle cooldown and holds (`nextHandleChangeAt`, `claimBlocks`); which fields changed (`changedFields`) | `src/lib/organizations/handle.ts`, `src/lib/organizations/edit.ts` (tested)                               |
| Firestore: `updateOrganization` (transaction, then membership copies)                                          | `src/lib/organizations/index.ts`                                                                          |
| Page, container and action                                                                                     | `src/app/[locale]/org/[handle]/edit/`                                                                     |
| UI                                                                                                             | `CreateOrganizationForm` (`mode="edit"`), `HandleField` (`lockedReason`, current), `EditOrganizationPage` |

**Verified 2026-11-23** in a real browser against the seeded emulators. As Maya (owner), the form opened filled in. Renaming South Bay Mutual Aid and changing its handle to `sbma-network` redirected to the new address. `/org/sbma` then showed not found, the handle checker called `sbma` taken (held), the dashboard and `/find` showed the new name and link, and the handle became read-only with the date. Recent actions said "Maya Thompson changed the name and the handle". As Thanh (moderator), the handle was read-only ("Only owners…"), her dashboard showed the new name, and saving a description change worked and was logged.
