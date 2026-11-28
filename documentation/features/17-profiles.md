# 17 · Profiles and skills (rebuild)

People get a page of their own: a name always, and whatever else they choose to share, with whom. Profiles also let people find others nearby with a skill they need ("someone who knows graphic design for our flyer"). Designed with the user on 2026-11-23 ([decision #31](../decisions/031-profiles-visibility-groups-skill-search.md)). **Phase 1 (profiles) built 2026-11-23**; previews and skills are next.

**Principle: members are in control of what they share.** Nothing is shown until the person adds it, every part follows their visibility choice, and they can preview exactly what others see. A profile never reveals more than a group already does about its members.

## What a profile has

| Field        | Rules                                                                                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name         | The account's display name. **Always shown** to anyone who reaches the page, whatever the visibility.                                                                                                                           |
| Username     | The address: `communalists.com/comrade/{username}` (`/@{username}` forwards there). Required; see "Usernames".                                                                                                                  |
| Pronouns     | Optional, short free text ("she/her", "elle"). Shown next to the name, in previews too.                                                                                                                                         |
| Bio          | Optional plain text, about 300 characters. Not translated (user content).                                                                                                                                                       |
| Languages    | Optional, from the same list as groups.                                                                                                                                                                                         |
| General area | Their city, **only if they turn it on**. Never more precise than the city. (Their saved city is otherwise used only for finding.)                                                                                               |
| Social links | Optional, the same platforms and username rules as groups (just the username, [decision #32](../decisions/032-social-links-as-handles-not-urls.md)), plus one personal website. The way to get in touch until messaging exists. |
| Skills       | Optional, from a fixed, translated list; see "Skills".                                                                                                                                                                          |
| Groups       | The groups they're in, filtered; see "Groups on a profile".                                                                                                                                                                     |

**Never shown:** email, the exact saved city (unless "General area" is on, and then only its name), pending requests, bans, moderation reasons, or anything from a group's members-only space.

## Who sees what

One setting, **Profile visibility**:

| Level                         | Name | Everything else (that they've filled in)             |
| ----------------------------- | ---- | ---------------------------------------------------- |
| Everyone                      | ✓    | Anyone, signed out too                               |
| People in my groups (default) | ✓    | Signed-in people who share at least one active group |
| Just my name                  | ✓    | Nobody else                                          |

- The default is "People in my groups": it matches how mutual aid works, and it shares nothing until they add something.
- **Preview as…** in settings shows the profile as the public, as a member of one of their groups, and as a signed-in stranger.
- Profiles are `noindex` (kept out of search engines), even public ones, for now. Being searchable would be its own opt-in later.
- All checks run on the server; the page and the preview only ever receive what the viewer may see.

## Groups on a profile

Listing someone's groups could undo the groups' own privacy (an unlisted tenants union, a faith or health group). So:

- **A group is listed only if the viewer could already see this person on that group's page:** the viewer is a member of it; or, for a **listed** group, the person is an owner or moderator there (always named) or the group's member list is public. **Unlisted groups only show to their own members**, so a profile never makes an unlisted group findable.
- People can also turn the list off, or hide individual groups.
- Roles show next to each group (Owner, Moderator).

## Usernames

- **Chosen at account setup**, suggested from the name (`maya-thompson`) with a live availability check. Existing accounts are asked once, through the same `requireAccount` → setup step as other required answers.
- **Same rules as group handles:** lowercase letters, numbers and single hyphens, 3–30 characters, reserved words blocked, unique (`usernames/{username}` claimed in a transaction), changeable once every 30 days, old username held for 30 days, no redirect.

## Previews on group pages

- Each member row on a group's page becomes a **link to the profile**. That works on every device and with every assistive technology.
- On devices with a pointer, a **preview card** also opens on hover **and on keyboard focus**: name, pronouns, roles, a line of bio, a few skills. It closes with Escape, stays open while the pointer moves onto it, and isn't needed to reach anything (WCAG 1.4.13). On touch, a tap opens the page.
- The card loads on demand and goes through the same server checks as the page.

## Skills

- **Picked from a fixed list**, typed with suggestions like the city picker, in all four UI languages, so "diseño gráfico" finds someone who added "graphic design" in English. Stored as **permanent keys** like focus areas (`graphicDesign`, `sewing`, `carRepair`); labels live in the message files. A "Suggest a skill" link grows the list. A cap (around 15) keeps profiles meaningful.
- **Finding people by skill is a separate opt-in, off by default:** "Let others find me by my skills". Having skills on a profile doesn't make someone findable by strangers.
- **Only signed-in members can search people.** Results show name, matching skills, their groups (filtered as above), and **city and rough distance**, never closer. Someone without "General area" on still appears, as "within about N mi", with no city named.
- **Getting in touch:** through the links they chose to share for now. **Messaging is a planned fast follow-up**, with its own setting for who can message you, plus blocking and reporting designed in from the start.

## Phases

1. **Profiles:** usernames (setup question for new and existing accounts), the profile page, profile settings with visibility and "Preview as…", member rows linking to profiles.
2. **Previews:** the accessible hover and focus card on group pages.
3. **Skills:** the list (drafted, then reviewed by the user), skills on profiles, the opt-in, and skill search near you.
4. **Messaging:** its own design (who can message you, blocking, reporting, notifications).

## Data (planned)

- `users/{uid}` (server-only) gains `username`, `usernameChangedAt`, and `profile { visibility, pronouns, bio, languages[], showArea, socials[], website?, groups { show, hidden[] }, skills[], findableBySkills }`.
- `usernames/{username}` → `{ uid, heldUntil? }`, claimed like `handles/{handle}`.
- A small `skillListings/{uid}` document only for people who opted in (skills, coarse location, geohash), so skill search never reads private profiles. Its query (skill + area) needs a composite index, kept in `firestore.indexes.json`.
- Visibility is decided per request on the server: the viewer's and the person's active memberships (cached) decide "shares a group" and which groups to list.

## Built (phase 1, 2026-11-23)

| Piece                                                                                           | Where                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rules: who sees what, which groups show, private defaults (pure, tested)                        | `src/lib/profiles.ts`                                                                                                                                                                 |
| Usernames: same rules as handles, claimed in `saveUserProfile`, live check `/api/usernames/{u}` | `src/lib/users.ts`, `src/lib/organizations/handle.ts`, `src/lib/validation/account-setup.ts`                                                                                          |
| Profile settings form and validation                                                            | `src/lib/validation/profile.ts`, `/account/profile`                                                                                                                                   |
| Profile page                                                                                    | `/comrade/{username}` (`noindex`); `/@{username}` forwards there (`src/proxy.ts`)                                                                                                     |
| UI                                                                                              | `ProfileCard`, `ProfileSettingsForm`, `ProfilePreview`, `ProfilePage`, `ProfileSettingsPage`, `HandleField kind="username"`, member rows as links, "Your profile" in the account menu |

- **Account setup** asks for a username, suggested from the name. Existing accounts get it as their one missing setup step. **Settings** change it once every 30 days, holding the old one for 30 days with no redirect.
- **"Preview as…"** is built with the same `profileView` rules as the page, from the form's current values, so it updates as you type.
- Member lists link each row to `/comrade/{username}`. Memberships carry a copy of the username; lists repair any membership missing its name or username copy from `users`, and write it back. This also fixed the "?" for groups created before name copies existed.

**Verified 2026-11-23** against the seeded emulators.

- **Signed out:**
  - Maya (public) shows her bio, pronouns, city and two groups. South Bay is listed because she's the owner. Oakland Auto Club is listed because its member list is public. The unlisted tenants union and the members-only childcare co-op are left out.
  - Luis ("my groups") and Wei ("just my name") show only their names.
  - Unknown usernames show not found, and `/@…` forwards. (Since 2026-11-27, a not-found page of its own explains usernames can change, without hinting whether one was used: [decision #69](../decisions/069-not-found-pages-general-and-per-kind.md).)
- **As Maya:**
  - Her own page shows everything, including the tenants union.
  - Luis's page shows his bio and pronouns, since they share groups. It lists the four groups that would name him to her, but not the pantry, whose member list is members-only and which she isn't in.
  - All 8 South Bay member rows link to profiles.
  - Switching to "Just my name" updated the preview immediately; after saving, a signed-out visitor saw only her name.
- **As Sam:** setup suggested `sam-rivera` and showed it as available.
