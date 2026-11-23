# 16 · Organizations (rebuild)

The heart of the platform: people create, find and join **organizations**, and an organization's tools only work for its members. This is the rebuild's design, agreed with the user on 2026-11-22 ([decision #22](../decisions.md)). It replaces the prototype's single hard-coded organization ([08](08-organizations-and-membership.md)). Read 08's "Gaps" for what went wrong there.

**Status:** phase 1 built 2026-11-22, except the logo upload (next). See "Built" at the end.

## What an organization has

| Field            | Rules                                                                                                                                                                                                                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name             | Required, 2–80 characters. Not unique.                                                                                                                                                                                                                                            |
| Handle           | Unique public address: `communalists.com/org/{handle}`. Lowercase `a–z`, `0–9` and `-`, 3–30 characters, no leading, trailing or double hyphen. Suggested from the name, with a live availability check, re-checked on the server. Can't be a reserved word. See "Handles" below. |
| Focus areas      | What the group works on: **1 to 3** from a fixed, translated list. See "Focus areas".                                                                                                                                                                                             |
| Description      | Plain text, up to ~2,000 characters. Organization content isn't translated (product rule).                                                                                                                                                                                        |
| Location         | A city from the same picker as account setup, stored the same way: label, coordinates rounded to ~1 km, geohash. Never a street address.                                                                                                                                          |
| Reach            | `local` with a radius of **5 / 10 / 25 / 50 / 100 mi** (stored in km; miles in the US), `national` (its country), or `international`.                                                                                                                                             |
| Languages spoken | One or more of a list (at least the four UI languages, likely more), so people can find, say, a Vietnamese-speaking group.                                                                                                                                                        |
| Website          | Optional URL (`https` only).                                                                                                                                                                                                                                                      |
| Socials          | Optional list of `{ platform, url }` from known platforms: Instagram, Facebook, X, Bluesky, TikTok, YouTube, Discord, WhatsApp, Signal, Telegram. Each URL must be on that platform's domain.                                                                                     |
| Contact email    | Optional, **public** on the organization's page.                                                                                                                                                                                                                                  |
| Logo             | Optional image upload (Firebase Storage). Type and size checked on the server.                                                                                                                                                                                                    |
| Join policy      | `request` (default): people ask, owners or moderators approve. `open`: join instantly. `invite`: invited people only.                                                                                                                                                             |
| Visibility       | `listed` (default): shows up when browsing. `unlisted`: reachable by link only (for groups that don't want to be found, like a tenant union organizing against a landlord).                                                                                                       |

### Focus areas

General · Food · Housing · Transportation · Technology · Health · Childcare · Education · Clothing · Lending · Disaster relief · Legal · Labor · Arts · Hobbies · Faith · Animals · Environment · Other

- **It's "what do you work on", not "what kind of group are you".** People search by need ("food", "cars"), and one group often does several things. A "kind of group" field (tenant union, club, student group) was dropped for now; it can be added later as an optional field ([decision #23](../decisions.md)).
- **Short labels** (one word where possible), so the checklist scans and cards stay short. Where one word would narrow the meaning, a broader word was picked: **Lending**, not Tools (libraries lend more than tools); **Environment**, not Gardening (cleanups and climate groups too). Labels can change; keys can't.
- **Up to 3**, so a group can say what it does without ticking everything to appear in every search. The form disables the other boxes at 3; the server enforces it too.
- **Stored as permanent keys** (`food`, `transportation`, `disasterRelief`). Labels live in `messages/*.json` and can be reworded any time. Never rename or reuse a key. To retire one, list it in `RETIRED_FOCUS_AREAS`: it's hidden from the form and still shown on groups that have it. A test locks the key list.

## People and roles

| Role      | Can                                                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------------------------------- |
| Owner     | Everything a moderator can, plus manage moderators and owners, change the handle, and delete (archive) the organization |
| Moderator | Approve or deny join requests, invite and remove members, edit the profile, run the tools                               |
| Member    | Use the members-only side of the tools                                                                                  |

- **One membership record per person per organization:** `role` (`owner` / `moderator` / `member`) and `status` (`active` / `pending` / `invited`). This is not an array on the organization; that was the prototype's mistake ([08 → Gaps](08-organizations-and-membership.md#gaps)). It makes deny, leave, promote, remove and audit possible, and keeps member lists off every client.
- The record also carries a small copy of the organization (name, handle, focus areas, logo), so the dashboard lists all of a person's organizations in **one query**. Renaming an organization updates those copies.
- **An organization always has at least one owner.** The last owner can't leave or step down without handing ownership to someone.
- **A person can own at most 5 organizations** (abuse limit; open sign-up means open creation).
- Creating requires a finished account (name and city), which `requireAccount` guarantees.

## Handles

- **Uniqueness:** Firestore has no unique constraint, so each handle is claimed by a `handles/{handle}` document written in the **same transaction** as the organization.
- **Reserved:** `www`, `app`, `api`, `admin`, `auth`, `dashboard`, `account`, `org`, `orgs`, `new`, `settings`, `help`, `support`, `status`, `docs`, `blog`, `mail`, `storybook`, `static`, `assets`, `cdn`, `dev`, `staging`, `communalists`, and the locale codes. The list lives in code.
- **Renaming is allowed** (owners only, at most once every 30 days). **No redirects:** the old address stops working, and breaking their own links and flyers is the group's choice (the user's call, 2026-11-22). The old handle is **held for 30 days** so nobody else can claim it and pose as the group to people following old links. With the 30-day rename limit, an organization holds at most one old handle at a time, so nothing piles up.
- **Subdomains** (`sbma.communalists.com`) are optional and later. They'd point at the same `/org/{handle}` pages once `communalists.com` is on our Vercel account ([deployment](../technical/deployment.md)).

## Finding organizations

Browsing shows **listed, active** organizations:

- **local:** within the organization's own radius of the visitor's city. It's a geohash range query around the visitor (up to the largest radius, 100 mi), then each organization's own radius is checked;
- **national:** same country as the visitor;
- **international:** everyone.

Filters: focus areas, languages spoken.

## Deleting

Owners can delete. It **archives**: data is kept, the page and listings disappear, and the handle stays reserved. Hard deletion is a later, deliberate admin action.

## Pages

| Route                    | Who               | What                                                                                                     |
| ------------------------ | ----------------- | -------------------------------------------------------------------------------------------------------- |
| `/dashboard`             | Signed in         | **Your organizations** (cards), **Create organization**, and a way to find organizations near you        |
| `/org/new`               | Signed in         | Create form; the creator becomes owner                                                                   |
| `/org/{handle}`          | Anyone            | Public profile (name, focus areas, description, location and reach, languages, links, logo, join button) |
| `/org/{handle}` (member) | Members           | Plus a members-only home, where tools will appear                                                        |
| `/org/{handle}/manage`   | Owners/moderators | Profile, people, join requests, handle (phase 3)                                                         |

Bare `communalists.com/org/{handle}` redirects to the visitor's language, like every page, so it works on flyers.

## Phases

1. **Create and list:** the data model, create form with handle check, dashboard "Your organizations" plus "Create organization", the `/org/{handle}` page (public profile plus a member view), and the logo upload last.
2. **Find and join:** "near you" browsing, joining by each policy, approving and denying requests.
3. **Manage:** edit profile, change handle (old one held 30 days, no redirect), promote, remove, leave, archive.
4. **Then:** subdomains (after the domain move) and the first tool, Requests.

## Data and security notes

- All reads and writes go through server actions and the Admin SDK (deny-all rules stay); every action checks the caller's membership and role on the server.
- Reads are cached with tags (`org:{id}`, the user's membership list) and cleared by the actions that write ([firebase.md → Caching reads](../technical/firebase.md#caching-reads-in-the-rebuild)).
- Logos need Storage rules, the Storage emulator locally, and type and size limits enforced on the server.
- Contact email is the only personal-ish field and it's opt-in and public by design. Member lists are members-only.

## Built (phase 1, 2026-11-22)

| Piece                                                                                                             | Where                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lists and pure rules (focus areas, reach, radius, languages, socials, URL normalizing, `MAX_OWNED_ORGANIZATIONS`) | `src/lib/organizations/options.ts`                                                                                                                                                     |
| Handle rules, reserved words, suggestion from the name                                                            | `src/lib/organizations/handle.ts`                                                                                                                                                      |
| Form schema (`organizationSchema`, errors as translation keys)                                                    | `src/lib/validation/organization.ts`                                                                                                                                                   |
| Firestore: create transaction, cached reads, fresh reads for access                                               | `src/lib/organizations/index.ts`                                                                                                                                                       |
| Live handle check (signed-in only)                                                                                | `GET /api/handles/{handle}`, `useHandleAvailability`                                                                                                                                   |
| Language names (browser data, with a fallback for `ase`)                                                          | `languageName` in `src/lib/organizations/client.ts`                                                                                                                                    |
| Pages                                                                                                             | `/dashboard` (your organizations + create), `/org/new`, `/org/{handle}`                                                                                                                |
| UI                                                                                                                | `HandleField`, `SocialLinksField`, `ChoiceGroup`, `OrganizationCard`, `CreateOrganizationForm`, `OrganizationProfile`, `OrganizationPage`, `CreateOrganizationPage` (all in Storybook) |

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
