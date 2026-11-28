# 16 · Organizations (rebuild)

The heart of the platform: people create, find and join **organizations**, and an organization's tools only work for its members. This is the rebuild's design, agreed with the user on 2026-11-22 ([decision #22](../decisions/022-organizations-design-handles-roles-limits.md)). It replaces the prototype's single hard-coded organization ([08](08-organizations-and-membership.md)). Read 08's "Gaps" for what went wrong there.

**Status:** phase 1 built 2026-11-22, except the logo upload. Phase 2 (finding, joining, moderating members) and editing built 2026-11-23. See "Built" at the end. **Unclaimed organizations** (added by super users, with no owner until a group claims them) are in [18](18-unclaimed-organizations.md).

## What an organization has

| Field            | Rules                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name             | Required, 2–80 characters. Not unique.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Handle           | Unique public address: `communalists.com/organization/{handle}`. Lowercase `a–z`, `0–9` and `-`, 3–30 characters, no leading, trailing or double hyphen. Suggested from the name, with a live availability check, re-checked on the server. Can't be a reserved word. See "Handles" below.                                                                                                                                                                                                                                   |
| Focus areas      | What the group works on: **1 to 3** from a fixed, translated list. See "Focus areas".                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Description      | Plain text, up to ~2,000 characters. Organization content isn't translated (product rule).                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Year founded     | Optional four-digit year, 1800 to this year. Shown as "Since 1983" ([decision #36](../decisions/036-organization-phone-number-and-year-founded.md)).                                                                                                                                                                                                                                                                                                                                                                         |
| Location         | A city from the same picker as account setup, stored the same way: label, coordinates rounded to ~1 km, geohash. The city is what finding organizations uses.                                                                                                                                                                                                                                                                                                                                                                |
| Street address   | Optional and **public**, up to 200 characters, one line ("749 Story Rd, San Jose, CA 95122"), with a **Get directions** menu offering Apple Maps, Google Maps or OpenStreetMap (`src/lib/maps.ts`; nothing is sent to a map service until one is opened; the user asked for a choice, 2026-11-25, since not everyone uses Google Maps). Only a public place (office, church, community center), never a home; the form says so. Events will start from it ([decision #35](../decisions/035-organization-street-address.md)). |
| Reach            | `local` with a radius of **5 / 10 / 25 / 50 / 100 mi** (stored in km; miles in the US), `national` (its country), or `international`.                                                                                                                                                                                                                                                                                                                                                                                        |
| Languages spoken | One or more of a list (at least the four UI languages, likely more), so people can find, say, a Vietnamese-speaking group.                                                                                                                                                                                                                                                                                                                                                                                                   |
| Website          | Optional URL (`https` only).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Socials          | Optional list of `{ platform, handle }`: Instagram, Facebook (page), Facebook group, X, Bluesky, TikTok, YouTube, Telegram. People type just the username; a pasted profile link is cut down to it. We build the link, so it's always that platform's profile page ([decision #32](../decisions/032-social-links-as-handles-not-urls.md)).                                                                                                                                                                                   |
| Contact email    | Optional, **public** on the organization's page.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Phone            | Optional, **public**, with a tap-to-call link. Typed any way ("408.293.6111", "(408) 293-6111 ext 2"), read in the group's country, and stored as one value: E.164 plus `;ext=N` (`src/lib/phone.ts`, using `libphonenumber-js`). Shown in local format to visitors in the same country, international otherwise. The hint asks for the organization's line, not a personal cell ([decision #36](../decisions/036-organization-phone-number-and-year-founded.md)).                                                           |
| Logo             | Optional image upload (Firebase Storage). Type and size checked on the server.                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Join policy      | `request` (default): people ask, owners or moderators approve. `open`: join instantly. `invite`: invited people only.                                                                                                                                                                                                                                                                                                                                                                                                        |
| Visibility       | `listed` (default): shows up when browsing. `unlisted`: reachable by link only (for groups that don't want to be found, like a tenant union organizing against a landlord).                                                                                                                                                                                                                                                                                                                                                  |
| Member list      | Who sees every member's name on the group's page: `public` (anyone, signed out too), `members` (default: members see everyone), or `hidden` (just the count). Owners and moderators are always named, and everyone sees the count. Staff always see everyone on the members page.                                                                                                                                                                                                                                            |

### Focus areas

General · Food · Housing · Transportation · Technology · Health · Childcare · Education · Clothing · Hygiene · Lending · Disaster relief · Legal · Labor · Arts · Hobbies · Faith · Animals · Environment · Other

- **It's "what do you work on", not "what kind of group are you".** People search by need ("food", "cars"), and one group often does several things. A "kind of group" field (tenant union, club, student group) was dropped for now; it can be added later as an optional field ([decision #23](../decisions/023-organization-focus-areas-as-permanent-keys.md)).
- **Short labels** (one word where possible), so the checklist scans and cards stay short. Where one word would narrow the meaning, a broader word was picked: **Lending**, not Tools (libraries lend more than tools); **Environment**, not Gardening (cleanups and climate groups too). Labels can change; keys can't.
- **Hygiene** (showers, laundry, hygiene kits, haircuts) was added on 2026-11-24 ([decision #34](../decisions/034-hygiene-focus-area.md)): showers had nowhere to go, and they were a big part of the prototype's listings.
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
- **Reserved:** `www`, `app`, `api`, `admin`, `auth`, `dashboard`, `account`, `org`, `orgs`, `organization`, `organizations`, `event`, `events`, `new`, `settings`, `help`, `support`, `status`, `docs`, `blog`, `mail`, `storybook`, `static`, `assets`, `cdn`, `dev`, `staging`, `communalists`, and the locale codes. The list lives in code.
- **Renaming is allowed** (owners only, at most once every 30 days). **No redirects:** the old address stops working, and breaking their own links and flyers is the group's choice (the user's call, 2026-11-22). The old handle is **held for 30 days** so nobody else can claim it and pose as the group to people following old links. With the 30-day rename limit, an organization holds at most one old handle at a time, so nothing piles up.
- **Subdomains** (`sbma.communalists.com`) are optional and later. They'd point at the same `/organization/{handle}` pages once `communalists.com` is on our Vercel account ([deployment](../technical/deployment.md)).

## Addresses

Decided 2026-11-27 ([decision #63](../decisions/063-url-scheme-find-kinds-and-organization-addresses.md)). Every link is built with `src/lib/paths.ts`, never spelled by hand.

- **One organization:** `/organization/{handle}`, with its own pages under it (`/edit`, `/members`, `/claim`). **Tools go under it too**, when they're built: `/organization/{handle}/events/{slug}`, `/organization/{handle}/requests`. Tool data belongs to one organization, so the address matches how access is checked.
- **Searching:** `/find/{kind}/…`, today only `/find/organizations/{country}/{region}/{city}`. Comrades and events will get `/find/comrades/…` and `/find/events/…`, each its own route with whatever follows the kind. Plain `/find` goes to `/find/organizations` for now.
- **Old addresses** (`/org/…` until 2026-11-27, and `/find/{country}/…`) redirect permanently, query string kept (`next.config.ts`). Keep these redirects: printed flyers and QR codes still use them.

## Finding organizations

`/find/organizations` (public, in all four languages) and a preview on the dashboard. Only **listed, active** organizations appear ([decision #26](../decisions/026-find-organizations-page-distance-filters-in-url.md)).

- **From a city, always in the URL** ([decision #52](../decisions/052-find-always-has-a-city-profile-or-default.md)): plain `/find/organizations` redirects to the visitor's starting city, keeping any filters. That's a signed-in visitor's profile city, otherwise **San Francisco** (`DEFAULT_PLACE` in `src/lib/organizations/directory.ts`, the one place to change it; a test checks its slug). `startingCitySlug` (`src/lib/organizations/starting-city.ts`) picks it. The homepage banner's main button, **Browse organizations**, links straight there. There's no "starting point" note any more: every search has a city in the URL, as if chosen.
- **Typing in the city box doesn't search.** The filter form reports every change, typing included, so the page only navigates when the city or a filter actually changes. A newly chosen city's path comes from the place search (`slug`). The first `/find/organizations` URL release (2026-11-26) took the path from the city already on the page, so a typing event right after choosing a city sent visitors back to the old one.
- **Distance** (5, 10, 25, 50 or 100 mi; 25 by default) applies to **local** groups: every local group **based** within that distance shows, closest first. The group's own service radius isn't checked (the user's call, 2026-11-23: more results, and people can judge for themselves). This replaces the earlier plan of checking each group's radius.
- **Nationwide** groups show when they're based in the visitor's country, and **international** groups always. Both are sorted biggest first.
- **Filters:** groups that are local, national or international (all by default; choosing none means all), focus areas, languages spoken. Focus areas and languages match if a group has **any** of the chosen ones. In order: city, distance, focus areas, languages, reach. Focus areas are always open, with eight common ones first and a **+ 12 more** chip in the same row for the rest; languages and reach fold away until narrowed. On phones only the city shows, with the rest behind a **Filters** button that counts the filters in use ([decision #47](../decisions/047-find-filters-common-focus-areas-first-reach-folded.md)). There's no country picker while the US is the only country with place data: `LocationField` shows the country select only when there's more than one to choose.
- **Results are grouped** into "Near {city}", "Nationwide" and "International", each with a count and an empty message (a dashed box with advice for local, one quiet line for nationwide and international, which are often empty). Each result shows focus areas and "4 mi away · Santa Clara, California" (or "In {city}" under a mile), and does two things (`OrganizationListing`): the top of the card is a **link to the group's page** (one click; the name is always underlined so it reads as a link, and on hover the underline thickens and the border brightens), and a full-width **Show details** bar under it opens a drawer below it with the description (cut at four lines; when it's cut, tapping the text or the **Read more** button under it shows the rest, and **Show less** cuts it again. Before 2026-11-26 there was no way to read past the cut on the find page), a local group's area ("Within 10 mi of San Jose, California"; nationwide and international results already sit under their own heading and say where they're based), the founding year ("Since 2019", when given), languages, the member count (not for unclaimed groups), and the group's **website and social links** (opening in a new tab). How to join isn't shown: visitors read "Request to join" as something to do, not a fact, so it stays on the group's page beside the join button. The listing carries `radiusMiles`, `foundedYear`, `website` and `socials` for this, all already public on the group's page, so it costs no extra reads. Earlier versions (2026-11-25): the whole row expanded with **Open page** inside (two clicks to reach a page), then a small **Details** button beside the link (unclear on phones, where it shrank to an arrow, and the hover tint didn't fill the card). The bar works the same at every width, and stays where it was tapped while the drawer opens under it. Results don't label unclaimed groups; their page does ([decision #48](../decisions/048-find-results-underlined-names-no-join-policy-or-unclaimed-label.md)). Phone and email stay on the page. Signed-in visitors also get a "Create organization" prompt.
- **Live, in the URL:** each change replaces the URL, the city in the path and filters in the query (`/find/organizations/us/ca/san-jose?radius=50&focusAreas=food&languages=vi&reach=local`, decision [#49](../decisions/049-readable-find-urls-city-in-the-path.md)), so a search can be shared or bookmarked; defaults are left out. Older `?country=&placeId=` links, other casing and partial paths redirect there; an unknown city is a 404. Old results dim while new ones load. Unknown or malformed values in the URL are ignored, never an error. A link with a city gets a page title and link preview naming it ("Mutual Aid Organizations Near Oakland, California"), with the city's path as its canonical (filters left out). Plain `/find/organizations` redirects before any metadata is made, so a signed-in visitor's profile city never ends up in metadata. Cities where a listed local group is based are in the sitemap ([technical/seo.md](../technical/seo.md)). Without JavaScript the form submits as a plain GET (though the city picker needs JavaScript).
- **Dashboard:** "Find organizations near you" shows the 3 closest local groups within 25 mi that you're not already in, and links to `/find/organizations`.
- **On an organization's page:** "Other organizations near {city}" lists up to **4** other local groups based within **50 mi** of its city, closest first ("5 mi from here · Berkeley, California", or "Also in {city}"), with the Unclaimed label where it applies, and links to `/find/organizations` from that city at 50 mi. Each card opens that group's page. The section is hidden when nothing is near. It uses the same cached read as `/find/organizations` (one per city), so it adds no reads for a city someone has already searched from ([decision #38](../decisions/038-nearby-organizations-on-organization-page.md), `nearbyOrganizations` in `src/lib/organizations/directory.ts`).

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

Owners and moderators get **Manage members** (with the number of open requests) in the members' space, leading to `/organization/{handle}/members`: **Requests** (oldest first), **Members** (with role changes, remove and ban), **Banned** and **Recent actions**.

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

Owners and moderators get **Edit organization** in the members' space, leading to `/organization/{handle}/edit`: the create form, filled in, with **Save changes**. Every field can be edited, including the member list setting. The logo isn't built yet.

- **The handle is owners only,** at most once every 30 days ("Renaming" above). Moderators see it read-only ("Only owners can change the handle."), and so do owners within 30 days of a change ("You can change the handle again on {date}"). Keeping the current handle reads "This is your current handle", not "taken".
- **Saving** checks the editor's role, the 30-day limit and the new handle's claim on fresh data in one transaction. The old handle becomes a **hold** (`heldUntil` 30 days out): it no longer resolves (not found, no redirect; the organization not-found page explains that addresses can change, [decision #69](../decisions/069-not-found-pages-general-and-per-kind.md)), and nobody else can take it until the hold ends. After that, anyone can claim it.
- **Copies:** a new name, handle or focus areas is written to every membership's copy (in batches of 400 after the save), and every member's dashboard cache is cleared.
- **Logged:** each save with changes adds "{actor} changed {fields}" to Recent actions, listing the fields (`editProfile` with `fields`).
- After saving, it returns to the organization's page at its (possibly new) address.

## Deleting

Owners can delete, from **Delete organization** at the end of the edit page ([decision #37](../decisions/037-deleting-organizations-restore-and-make-unclaimed.md)). Moderators can't, and super users can only on unclaimed organizations, where they act as owners.

- **Confirm by typing the name.** A dialog says what happens, and **Delete** stays disabled until the name matches. Case, extra spaces and how accents were typed don't matter (`deleteConfirmed`). The server checks again on fresh data.
- **It archives:** the organization's `status` becomes `archived`, with `archivedAt` and `archivedBy`. The page returns not found and the listings drop it. Every membership becomes `archived`, with its old status kept in `previousStatus`, so dashboards, the 5-owned limit and member lists drop it without other queries changing. Members lose access at once.
- **The handle is held for 30 days**, like after a rename, so nobody can pose as the group to people following old flyers. After that anyone can take it.
- **Restorable for 30 days** by a super user, from **Recently deleted** on `/admin`. Restoring brings back the page, the handle and every membership's exact status, pending requests included. After 30 days it drops off the list. The data stays until hard deletion (a later, deliberate admin job, needed once tools hold personal data).
- **Logged** in the organization's log ("{actor} deleted / restored this organization"). Deleting an unclaimed one, and every restore, also goes in the admin log.

Verified 2026-11-24 against the emulators: Maya deleted South Bay Mutual Aid (8 members, 2 requests). It left her dashboard, the page returned not found, and `sbma` read as taken. Jordan restored it from `/admin`: the page came back with 8 members, and Firestore had all 10 memberships back as they were, with no `previousStatus` left over.

## Pages

| Route                                                     | Who               | What                                                                                                     |
| --------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------- |
| `/dashboard`                                              | Signed in         | **Your organizations** (cards), **Create organization**, and the closest organizations you're not in     |
| `/find/organizations`, `/find/organizations/us/ca/{city}` | Anyone            | Find organizations from a city, with distance, reach, focus area and language filters                    |
| `/organization/new`                                       | Signed in         | Create form; the creator becomes owner                                                                   |
| `/organization/{handle}`                                  | Anyone            | Public profile (name, focus areas, description, location and reach, languages, links, logo, join button) |
| `/organization/{handle}` (member)                         | Members           | Plus a members-only home, where tools will appear                                                        |
| `/organization/{handle}/members`                          | Owners/moderators | Requests, members, bans and the moderation log                                                           |
| `/organization/{handle}/manage`                           | Owners/moderators | Profile, handle, roles (phase 3)                                                                         |

Bare `communalists.com/organization/{handle}` redirects to the visitor's language, like every page, so it works on flyers.

**Layout of `/organization/{handle}`** (2026-11-25, the user picked two columns over a tidied single column): a header with the initials, name, then the **handle** (`@sbma`, the way member profiles show usernames), the city and the Unclaimed label, then focus areas. Below, the main column has **About** (the description), then the members' space, the unclaimed notice, the member list and nearby groups. A right-hand column starts with a **join card** for visitors (Join, Ask to join, Sign in to join or the pending request, with a full-width button and the hint under it), then a **Details** card (area and reach, street address with the directions menu, members, founding year, languages) and a **Contact** card (website, phone, email, social links). Contact links are rows, always **underlined** so they read as links without relying on colour, and long addresses wrap. On wide screens the right-hand column starts level with the name. On one column everything follows the markup order: header, About, the join card, Details, Contact, then the rest, so the join button isn't crammed under the name and the reading and focus order always match the screen. The switch is a container query on the profile, not the window, so the narrow profile preview in the bulk import (`ImportRowCard`) stays one column. Earlier versions: the join button beside the name (floated awkwardly on wide screens), then the join card lifted above About on phones with CSS `order` (too close to the name) and the side column starting below the header on wide screens (too low).

## Phases

1. **Create and list:** the data model, create form with handle check, dashboard "Your organizations" plus "Create organization", the `/organization/{handle}` page (public profile plus a member view), and the logo upload last.
2. **Find and join:** "near you" browsing, joining by each policy, approving and denying requests, removing and banning (all built 2026-11-23).
3. **Manage:** invite, archive, logo. (Promoting, handing over ownership, editing the profile and changing the handle were built 2026-11-23.)
4. **Then:** subdomains (after the domain move) and the first tool, Requests.

**Discussion on an organization's page** (built 2026-11-27, [decision #70](../decisions/070-organization-discussions-platform-moderated-with-official-replies.md)), after the member list and before nearby groups. Public comments with up votes on listed organizations, claimed or unclaimed (never unlisted), no ratings, moderated by super users through reports, and one official reply per comment from owners or moderators, logged in Recent actions. See [features/20 → On organizations](20-comments.md#on-organizations).

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
| Pages                                                                                                    | `/dashboard` (your organizations + create), `/organization/new`, `/organization/{handle}`                                                                                              |
| UI                                                                                                       | `HandleField`, `SocialLinksField`, `ChoiceGroup`, `OrganizationCard`, `CreateOrganizationForm`, `OrganizationProfile`, `OrganizationPage`, `CreateOrganizationPage` (all in Storybook) |

**How it behaves:**

- **Creating** runs one transaction: it checks the handle claim and the 5-owned limit, then writes the organization, `handles/{handle}` and the owner's membership together. A second create with the same handle gets "That handle is taken".
- **The create form** starts at the creator's city and the UI language. The handle follows the name until the person edits it. The radius only shows for local reach. Defaults are request-to-join and listed.
- **`/organization/{handle}`:** an uppercase URL redirects to lowercase. Unlisted and archived organizations get `noindex`; listed ones get a title naming their city ("{name} in {place}"), a description (theirs, or a generic line), and `Organization` structured data ([technical/seo.md](../technical/seo.md)). The members' space shows only for active members, checked with a fresh read. Signed-out visitors see **Sign in to join** (see Joining).
- **Unknown handles** show the not-found page, but with HTTP status 200: the page shell has already been streamed when the lookup fails. Search engines still get `noindex`.
- **Reads:** the dashboard's membership list and organization lookups are cached and tagged (`memberships:{uid}`, `handle:{handle}`, `org:{id}`). Creating clears them. A cached "not found" is confirmed with a fresh read before showing 404, because it may have just been created on another server instance.

**Verified 2026-11-22:**

- **End-to-end against the emulators:**
  - Signed out: `/organization/new` sends to sign-in, the handle API returns 401, and unknown organizations show not-found.
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

| Piece                                                                                  | Where                                                                                                            |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Filters from the URL, filtering and sorting (pure, tested)                             | `src/lib/organizations/directory.ts`                                                                             |
| Cached reads: `getDirectoryLocal`, `getDirectoryNational`, `getDirectoryInternational` | `src/lib/organizations/index.ts`                                                                                 |
| Page and live filters                                                                  | `src/app/[locale]/find/organizations/[[...place]]/` (server container) + `find/organizations/find-container.tsx` |
| UI                                                                                     | `OrganizationFilters`, `FindOrganizationsPage`, `OrganizationCard` (`detail`), all in Storybook                  |

**Verified 2026-11-23** against the seeded emulators:

- **By URL:** San Jose at 25 mi gives 4 local groups (the unlisted tenants union never shows), and 50 mi adds Oakland and Berkeley. Food narrows to 3. Vietnamese with local only gives the 2 that list it. Oakland at 10 mi gives Oakland and Berkeley. The Spanish page loads.
- **In a real browser, signed in as Thanh:** `/find/organizations` starts from her city. Choosing Housing updates the results and the URL. Switching the city to Berkeley keeps the filter. The dashboard shows the 2 closest groups she isn't in, and links to `/find/organizations`.
- A production build passes (`/find/organizations` is partly prerendered).

## Built (joining and moderating, 2026-11-23)

| Piece                                                                                                                                           | Where                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Rules: who can act on whom, reasons, join state, whose names show (pure, tested)                                                                | `src/lib/organizations/membership.ts`                                                                        |
| Firestore: `joinOrganization`, `cancelJoinRequest`, `leaveOrganization`, `moderateMember`, `getOrgPeople`, `getModerationLog`, `syncMemberName` | `src/lib/organizations/index.ts`                                                                             |
| Server actions                                                                                                                                  | `src/app/[locale]/organization/[handle]/actions.ts` (`membershipAction`, `moderateAction`)                   |
| Pages                                                                                                                                           | `/organization/{handle}` (join area, member list, Manage members), `/organization/{handle}/members`          |
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
| Page, container and action                                                                                     | `src/app/[locale]/organization/[handle]/edit/`                                                            |
| UI                                                                                                             | `CreateOrganizationForm` (`mode="edit"`), `HandleField` (`lockedReason`, current), `EditOrganizationPage` |

**Verified 2026-11-23** in a real browser against the seeded emulators. As Maya (owner), the form opened filled in. Renaming South Bay Mutual Aid and changing its handle to `sbma-network` redirected to the new address. `/organization/sbma` then showed not found, the handle checker called `sbma` taken (held), the dashboard and `/find/organizations` showed the new name and link, and the handle became read-only with the date. Recent actions said "Maya Thompson changed the name and the handle". As Thanh (moderator), the handle was read-only ("Only owners…"), her dashboard showed the new name, and saving a description change worked and was logged.
