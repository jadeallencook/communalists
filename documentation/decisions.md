# Decision Log

Every meaningful product or technical choice made during the rebuild, newest first. Each entry records what we chose, what else we considered, and why, so a later change of direction starts from the full picture.

Add an entry when you choose a framework or library, change the data model, add or cut a feature, change a product rule, or go against something in these docs. If a decision replaces an earlier one, mark the old entry **Superseded by #N** rather than deleting it.

## Template

```md
### N. Short title — YYYY-MM-DD

**Status:** Accepted | Superseded by #N | Reverted
**Context:** What prompted this.
**Decision:** What we chose.
**Alternatives:** What else we considered, and why not.
**Consequences:** What this changes. Docs updated: …
```

## Decisions

### 32. Social links are handles, not URLs — 2026-11-24

**Status:** Accepted
**Context:** Organizations and profiles asked for a full web address per platform. That's awkward to type, and we stored whatever URL passed a domain check, so a link could point at any page on the platform (a post or a redirect) rather than a profile.
**Decision:** People type only the username (`sbma` or `@sbma`); a pasted profile link is accepted and cut down to the username. We store `{ platform, handle }` and build the link at render time (`src/lib/socials.ts`), so it is always `https://` on the platform's own profile path. Each handle is checked against that platform's username rules. Platforms: Instagram, Facebook (page), Facebook group (`facebook.com/groups/…`, since many mutual aid groups are Facebook Groups), X, Bluesky (a bare name becomes `name.bsky.social`), TikTok, YouTube, Telegram. **Dropped:** Discord, WhatsApp and Signal. Their links are invite codes or phone numbers (`wa.me`), not handles, and a Signal username can't be turned into a link.
**Alternatives:** Keeping the invite-link platforms with a stricter link check (left for later, if groups ask for it). Accepting handles only and refusing pasted links (rejected: more errors for people used to pasting).
**Consequences:** Older documents with `{ platform, url }` are converted when read (`socialLinksOf`). Links that no longer fit, such as Discord, are left out and disappear the next time the form is saved. No migration is needed. Validation is shared between both forms (`src/lib/validation/socials.ts`), with a new `socialInvalid` error. Docs updated: features/16-organizations.md, features/17-profiles.md, technical/data-model.md.

### 31. Profiles: member-controlled sharing, groups filtered by each group's setting, opt-in skill search — 2026-11-23

**Status:** Accepted (design; not built yet)
**Context:** The user asked for profile pages (public or not, name always shown), previews from group member lists, bios, social links, the groups someone is in, and skills so people can find others nearby who can help ("I need a graphic designer for a flyer"). "User privacy is important and we want to make sure our members feel in control of what they share."
**Decision** (the user's choices, from options with trade-offs; details in [features/17](features/17-profiles.md)):

- **Visibility:** Everyone / People in my groups (default) / Just my name. The name is always shown. Fields are empty until filled in, and "Preview as…" shows what others see.
- **Groups on a profile** appear only where the viewer could already see the person on that group's page, so a profile never undoes a group's member list setting. People can also hide the list or single groups.
- **Usernames**, chosen at account setup (suggested from the name), with the same rules as group handles. The page lives at `/comrade/{username}` (the user's choice over `/people`, 2026-11-23), because Next.js reserves `@` folders, and `/@{username}` forwards there.
- **Optional fields:** pronouns, bio, languages, general area (city, opt-in), social links and website, skills.
- **Skills** come from a fixed, translated list stored as permanent keys, so searches work across languages. Being findable by skill is a separate opt-in, off by default, and only signed-in members can search, seeing city and rough distance only.
- **Contact** goes through shared links for now; **messaging is a fast follow-up**, designed with blocking and reporting.
- Profiles are `noindex`. The hover preview also opens on keyboard focus, closes with Escape, and every member row is a plain link too.

**Alternatives:** public/private only (no "my groups" middle); listing all of someone's groups (would reveal membership of private groups, like a tenants union); a random profile ID (harder to share, the user preferred usernames); free-text skills (don't match across spellings or languages, can't be translated or moderated); skills searchable by default (people wouldn't realise strangers can find them); a hover-only preview (fails keyboard and touch users).
**Consequences:** Account setup gains a required username question, and existing accounts are asked once. The skill list needs drafting and review in four languages. Skill search needs a composite index. Messaging must be designed before it's built. Docs updated: features/17 (new), README index.

### 30. Editing organizations: the create form reused; handle owners-only with holds — 2026-11-23

**Status:** Accepted
**Context:** Owners could manage members but not edit anything else. The user asked to edit all the other fields. The docs already set who edits (owners and moderators) and the handle rules (owners only, once per 30 days, old handle held 30 days, no redirects; decision #22).
**Decision:**

- `/org/{handle}/edit` reuses the create form in an edit mode, so the two can't drift. Owners and moderators can edit every field; only owners change the handle.
- A handle change moves the claim and turns the old `handles/{old}` document into a hold (`heldUntil`), which blocks others until it ends and never resolves. Expired holds can be claimed by anyone, including by a new organization.
- Membership copies are updated after the transaction, in batches, so large groups don't hit Firestore's 500-writes-per-transaction limit. A failure there leaves a stale copy on some dashboards, not a broken organization.
- Every save with changes is logged with the list of fields, next to moderation actions.

**Alternatives:** a separate edit form (two forms to keep in step); letting moderators change the handle (it breaks every link and flyer, so it stays with owners); redirects from old handles (the user chose no redirects); updating copies inside the transaction (fails for groups over ~490 members).
**Consequences:** Rule of thumb for the future: any change to a field that's copied elsewhere must update the copies, and adding a copied field needs a plan for existing records. Docs updated: features/16, technical/data-model.

### 29. Accessibility is the top priority — 2026-11-23

**Status:** Accepted
**Context:** The user set this for everything we build: many people using the platform may have a disability, and it has to be accessible to everyone.
**Decision:** WCAG 2.2 AA is the floor for every page and component, checked before a change is done (Storybook a11y panel in both themes, a keyboard pass, a screen reader pass on new flows, 200% zoom). The rules, how to check, and the current gaps live in [technical/accessibility.md](technical/accessibility.md); `AGENTS.md` lists it first among the product rules.
**Alternatives:** an accessibility pass before launch (cheaper now, but problems pile up and get designed in); AA only where convenient (shuts out the people mutual aid serves).
**Consequences:** Work takes a little longer and every summary says what was checked. Gaps found in what's already built are listed in the accessibility doc and fixed next. Docs updated: technical/accessibility (new), AGENTS, README index.

### 28. Owners and moderators can promote; owners are permanent for now — 2026-11-23

**Status:** Accepted
**Context:** With only one owner allowed to stay, a sole owner could never leave (decision #27). The user asked that owners make new owners and moderators, moderators make new moderators, and both approve, remove and ban members.
**Decision:**

- **Owners:** member → moderator or owner, moderator → owner, moderator → regular member.
- **Moderators:** member → moderator only.
- **Nobody changes an owner's role**, and nobody removes or bans an owner. An owner steps down by leaving, which needs another owner. Making an owner asks for confirmation, says it can't be undone for now, and is refused if the person already owns 5 organizations.
- Role changes need no reason but go in the moderation log (`makeModerator`, `makeOwner`, `makeMember`).

**Alternatives:** owners demoting other owners (two owners could fight over a group; better handled later with a vote or an "original owner" rule); moderators demoting moderators (one moderator could undo the others, the same reason they can't remove them); a single "transfer ownership" action (several owners is more resilient for volunteer groups, and transfer is just make-owner then leave).
**Consequences:** A group can't lose its last owner from inside the app. A bad owner can only be dealt with by a platform admin, which isn't built yet. Docs updated: features/16.

### 27. Joining and moderating: requests, one "banned" status, reasons in a log, and a member list setting — 2026-11-23

**Status:** Accepted
**Context:** The second half of phase 2. The user asked for requests that owners and moderators approve (open groups join at once), blocking, removing ("kick") and banning with a logged reason that may later justify closing an account, and a member list that each group chooses to show in full or as a count, with owners and moderators always shown.
**Decision:**

- **Statuses on the existing membership record:** `pending` (asked), `active`, `banned`. Denying deletes the request; removing deletes the membership; banning keeps the record as `banned` so they can't ask again until unbanned.
- **Block and ban are the same thing** (the user's choice): "Deny and block" on a request and "Ban" on a member both set `banned`.
- **Moderators act on members only; owners also on moderators; nobody on owners** here (the user's choice), so one moderator can't remove the others.
- **Reasons are required** to remove, ban or block, kept in `organizations/{id}/moderationLog` with who and when, and seen only by owners and moderators (the user's choice). Every moderation action is logged.
- **Member list setting** with three choices: everyone, members only (default), or just the count (the user's choice, over a public/count-only toggle). This replaces the earlier "member lists are members-only" rule with a per-group choice that's private by default.
- **The person's name is copied onto their membership,** so a member list is one query; saving a profile updates the copies.
- **The last owner can't leave.**

**Alternatives:** separate "blocked" and "banned" lists (the same result, twice the UI); moderators acting on other moderators (one bad moderator could remove the rest); showing the reason to the person removed (more transparent, but invites arguments and less honest notes); member names fetched from `users` per list (one read per member instead of one query, and the profile isn't otherwise needed); a public/count-only toggle (puts names on the open web with one click, risky for groups like tenant unions).
**Consequences:** The setting can only be chosen at creation until profile editing exists (phase 3). Without ownership transfer, the last owner of a group can't leave. Sign-in doesn't return to the group after "Sign in to join". There are no notifications yet, so moderators find requests through the Manage members count. Docs updated: features/16, technical/data-model, getting-started.

### 26. Finding organizations: a public /find page, distance only, filters in the URL — 2026-11-23

**Status:** Accepted
**Context:** Phase 2 starts with finding organizations ([features/16](features/16-organizations.md)). The user asked for filters (radius, type, and so on), and whether the dashboard should show results too.
**Decision:**

- **A public `/find` page**, so people can find a group before making an account. Signed-in visitors start from their profile's city. The **dashboard** shows the 3 closest local groups you're not in, and links to `/find`.
- **Distance only:** a local group shows when it's **based** within the chosen distance (5–100 mi, 25 by default). Its own service radius isn't checked (the user's choice).
- **Filters:** distance, reach (local, national, international; all by default), focus areas and languages, each matching any chosen value. Results are grouped by reach.
- **Live and in the URL:** results follow each change, and the URL holds the search so it can be shared.
- **Reads:** cached per city (local, within 100 mi, by geohash range) and per country (national), plus one list of international groups, all tagged `directory`. Filtering is in memory.

**Alternatives:** signed-in only (hides groups from people deciding whether to sign up); checking each group's own radius as the docs first planned (fewer results; the user preferred showing everything nearby); an Apply button (one more step; live updates with a no-JavaScript fallback do both); querying per filter combination (a composite index per combination, the prototype's problem in `technical/firebase.md`); a search service like Algolia (cost and another system, not needed at this size).
**Consequences:** One cached read set per city searched from. Creating an organization clears `directory`, and so must anything later that changes how a group is listed (editing, archiving, visibility). Paging and moving filters into queries will be needed at thousands of groups per region. Docs updated: features/16, technical/data-model, AGENTS.

### 25. Realistic test data — 2026-11-23

**Status:** Accepted
**Context:** The seeded accounts were "Comrade One" and "Comrade Two" (`comrade1@communalists.com`…), and groups had one or two members, so pages didn't look like real use. The user asked for more realistic placeholders.
**Decision:**

- Realistic names and matching emails on `example.com` (reserved, can never reach anyone): Maya Thompson (owner, English), Luis Hernández (owner, Spanish), Sam Rivera (no profile, for account setup). They're marked `"featured": true` and listed first in the toolbar.
- Eight more accounts across all four UI languages fill member lists (3–8 members per group). They're one click away too, under a collapsed **More accounts** in the toolbar. Each line lists owned groups first, because the toolbar cuts lines short.
- Four more organizations (8 in all) covering more focus areas, cities, radii and languages.
- The seed now removes seeded accounts and organizations (ids starting `seed-`) that are no longer in the file, so renaming test data doesn't leave the old copies behind.

**Alternatives:** Keeping the `comrade1@communalists.com` emails (easy to type, but the toolbar makes typing rare, and `communalists.com` is a real domain); listing every account at the same level (too long to scan); leaving the extra accounts out of the toolbar (first version; the user wanted them one click away too); generated fake data with a library like Faker (a dependency, and random names change between runs, which makes bugs harder to describe).
**Consequences:** The old `seed-comrade*` accounts are removed on the next start of `pnpm dev`, which signs out anyone signed in as them. Docs updated: getting-started, README, technical/accounts-and-sessions, technical/tooling-and-ci.

### 24. Local dev toolbar with one-click test sign-in, and test data that's always there — 2026-11-23

**Status:** Accepted
**Context:** Testing roles meant signing out and typing a test account's email and password each time. The user asked for one-click sign-in in a toolbar like Next's dev indicator, holding our own local-only tools. Earlier the same day, a half-finished seed left a test account without its profile, and `pnpm dev` only seeded on a brand-new setup.
**Decision:**

- A **Dev** button in a corner of every page, in local development only. It holds: sign in as a seeded account, then open the dashboard; reset test data (`pnpm seed` plus clearing the cached reads it changed); a link to the emulator UI; and a corner picker. The default corner is bottom right (Next's button is bottom left), and the choice is remembered per browser.
- **Guard in depth:** the toolbar renders only when `isLocalDev` is true (`next dev`, emulators, a `demo-` project, not Vercel, no service-account key), and each action checks it again. Sign-in accepts only the seeded emails.
- Test data lives in `scripts/seed-data.json`, shared by the seed script and the toolbar. `pnpm dev` checks at every start and seeds only if something is missing. Resetting doesn't sign anyone out.
- The toolbar is English only and isn't in the message files: only developers see it.

**Alternatives:** Adding items to Next's own dev menu (Next has no API for that); a separate dev route like `/dev/sign-in` (another public URL to guard, and less handy than a menu on every page); only hiding the button in production (server actions can be called directly by ID, so the action itself must refuse); translating it (no visitor ever sees it); seeding only on a brand-new setup (missed existing setups and half-finished seeds).
**Consequences:** Every new dev tool must call `assertLocalDev()` in its action. `pnpm dev` also starts Next with `METADATA_SERVER_DETECTION=none`, which removes the `MetadataLookupWarning` and a few seconds of delay. Docs updated: getting-started, technical/tooling-and-ci, technical/accounts-and-sessions, README, AGENTS.

### 23. Organizations: focus areas instead of a type, stored as permanent keys — 2026-11-23

**Status:** Accepted. Changes the "type" field in #22.
**Context:** #22's single "type" list mixed two questions: what kind of group it is (tenant union, club, student group) and what it works on (food, a community fridge, disaster relief). Groups fit several choices, and a general mutual aid network had to pick one. The user also asked whether stored values should be readable keys or opaque IDs, so labels can change later.
**Decision:**

- Replace `type` with **`focusAreas`**: what the group works on, **1 to 3** from a fixed translated list of short labels (General, Food, Housing, Transportation, Technology, …, Other). Shortened the same day: one word where possible, choosing the broader word where one word narrows the meaning (Lending over Tools, Environment over Gardening), with keys renamed to match before anything shipped. The full list is in [features/16](features/16-organizations.md#focus-areas).
- Drop "kind of group" for now; add it later as an optional field if browsing needs it.
- Store **readable keys** (`food`, `disasterRelief`) and treat them as **permanent**: never rename or reuse one. Labels come from the message files, so wording can change freely. Retire a key by hiding it from forms (`RETIRED_FOCUS_AREAS`), not by deleting it. A test locks the key lists for focus areas, reach, join policy and visibility.

**Alternatives:** Keep the mixed type list (confusing, and single-select forced general networks into one box); two fields, kind and focus (more for creators to fill in, and nobody browses by kind yet); single-select focus (doesn't fit groups that do several things); no cap (groups tick everything to show up in every search); opaque IDs (labels are already separate from keys, so IDs add nothing, and they make the database and logs unreadable; changing a key's meaning needs a migration either way).
**Consequences:** Done before any real organizations existed, so no migration. The form uses controlled checkboxes that disable at the cap (`ChoiceGroup` gained `selected`/`max`); cards and profiles list the areas. Phase 2 filters by focus area. Docs updated: features/16, technical/data-model.

### 22. Organizations: design, addresses, roles and limits — 2026-11-22

**Status:** Accepted. Changes #10/#11's subdomain plan to path-based addresses first. The "type" field was replaced by focus areas in #23.
**Context:** Organizations are the next feature and the core of the product. The prototype stored members as arrays on one organization ([features/08](features/08-organizations-and-membership.md)).
**Decision:** Full design in [features/16](features/16-organizations.md):

- **Address:** `communalists.com/org/{handle}`, with subdomains optional later.
- **Fields:** name, unique handle, type (a fixed translated list plus Other), description, city-level location, reach (local 5–100 mi, national, international), languages, website, socials, public contact email, logo, join policy (default request-to-join), listed/unlisted.
- **Membership:** one record per person per organization, with roles owner, moderator and member.
- **Limits:** at least one owner per organization, and at most 5 organizations owned per person.
- **Handles:** renames allowed (once per 30 days). No redirects; the old handle is held for 30 days so nobody else can claim it, so each organization holds at most one old handle.
- **Deleting** archives the organization.
  **Alternatives:** Subdomains first (blocked on the domain move); `/network/`, `/net/`, `/o/` paths; redirecting old handles (they pile up with every rename, and the user is fine with groups breaking their own links); member arrays on the organization (the prototype's approach, which couldn't reject, leave or promote, and sent member lists to everyone); free-text types (can't translate or filter); locking handles forever.
  **Consequences:** No DNS work needed to launch organizations. Handle uniqueness needs a `handles/` collection written in the same transaction. Renaming an organization updates the copies on membership records. Logos bring in Firebase Storage. Built in four phases, starting with create and list.

### 21. Cache profile reads on the server, tagged per user — 2026-11-22

**Status:** Accepted
**Context:** A usage spike (from the one-off CSV backup) prompted the question of caching. Each signed-in page view read the profile from Firestore. The prototype had cached reads in a browser-side React context (PR #60).
**Decision:** Keep the prototype's ideas, but cache on the server:

- **The cache:** `getUserProfile` is a `'use cache'` function tagged `user:{uid}` with `cacheLife('hours')`. Any action that saves a profile clears the tag with `updateTag`.
- **Fresh reads for decisions:** decisions such as "send to setup?" confirm with a fresh read when the cached copy says no, because the default cache is per server instance.
- **A dev-only read log** (`logRead`) replaces the prototype's `log()`.
- **Skeleton loading states** for the dashboard and settings replace "Loading…" text.
  **Alternatives:** The prototype's browser context (doesn't fit server rendering; one copy per browser; went stale across people); `'use cache: remote'` (shared across instances, but costs money and adds latency, not needed at today's traffic); experimental `staleTimes` to keep pages in the browser (personal pages lingering in the browser conflicts with the shared-device rule); no caching (fine on cost today, but sets the wrong pattern for organizations and tools).
  **Consequences:** Signed-in browsing costs ~0 Firestore reads after the first page. A changed name or city can show stale on a different server instance for up to an hour. That's display only, never access. New data follows the convention in `technical/firebase.md` → "Caching reads in the rebuild".

### 20. Session-aware header, /dashboard, and account settings — 2026-11-22

**Status:** Accepted
**Context:** The header had no way to sign in or see your account. There are no services (organization tools) yet. Signed-in users landed on a one-time `/welcome` page.
**Decision:** The header's account area is rendered on the server and streamed in `<Suspense>`, so it shows the right links without a flash.

- **Signed out:** "Sign in" and a "Create account" button, always shown so the header doesn't shift; the one for the current page is marked active. Create account is hidden on phones. (Hiding each on its own page was tried first; the user found the disappearing button confusing.)
- **Homepage:** signed in, the banner shows one "Go to your dashboard" button and the closing "Ready to organize?" sign-up band is left out. Both stream in like the header, so signed-in users never see sign-up buttons flash.
- **Signed in:** a "Dashboard" link (the place services will join later), plus an account menu under the user's initials with name and email, Account settings and Sign out. On phones, Dashboard moves into the menu.
- **`/welcome` became `/dashboard`,** the signed-in home; the old URL redirects (308), and every flow lands on the dashboard.
- **`/account/settings`** edits name, language and city with the setup form.
  **Alternatives:** Everything inside one menu (cleaner header, but Dashboard is a click further); keeping `/welcome` beside a new dashboard; leaving settings out until email and password changes exist; a client-side session check (flash of wrong links, more JavaScript).
  **Consequences:** Every page view by a signed-in user verifies the session and reads the profile once, shared with the page through React `cache()`. Settings actions call `refresh()` so the header updates immediately. Sign-out lives in the menu, so it now needs JavaScript (the menu does). Signed-in visitors can still open `/sign-in` and `/sign-up` directly. The homepage is no longer fully static: its buttons depend on the session.

### 19. Show version and commit in the footer — 2026-11-21

**Status:** Accepted
**Context:** The user wanted to see which version is live on the server, and suggested the `package.json` version, bumped on every change.
**Decision:** The footer shows `v{version} ({commit})`, e.g. `v4.0.0 (be4248f)`, with the commit linked on GitHub. The commit comes from `VERCEL_GIT_COMMIT_SHA` at build time; local builds show `(dev)`. The version is bumped **by hand at milestones** (something user-visible ships), not on every change. It continues from the existing `4.0.0`.
**Alternatives:** Version only, bumped every change (drifts the first time someone forgets, which defeats the purpose); commit only; automatic bumps from Conventional Commits with release-please (worth it once we work through PRs).
**Consequences:** "Is the server current?" is answered by comparing the footer's commit with `git log`. Version numbers mean milestones, not builds.

### 18. Sign-up asks only credentials; every account finishes on one setup page — 2026-11-21

**Status:** Accepted. Supersedes the profile-at-sign-up part of #12 and moves #14's city picker to setup.
**Context:** Prototype accounts can still sign in (about 103 Firebase Auth users) but have no profile, and we'll want more answers from users later. The user asked for a popover or a separate page.
**Decision:** A **dedicated page**, `/{locale}/account/setup`. Sign-up collects only email and password, then sends people there. Required questions (name, preferred language, city) are listed in code (`src/lib/account-setup.ts`). `requireAccount()` in each signed-in page's container redirects any account missing an answer, then returns it to `?next=` (sanitized). Prototype data from the backup is **not imported**; those users answer again.
**Alternatives:** A popover or dialog (can be dismissed or bypassed, needs JavaScript, harder on phones); a banner that blocks only some features; keeping name and city on sign-up (two places asking the same questions); pre-filling names or locations from the backup (moves old personal data into the new system, and old locations were a fixed list that doesn't map to cities).
**Consequences:** One code path for new, old and future-incomplete accounts. Adding a required question needs no migration. Every signed-in page must call `requireAccount()`. Setup needs JavaScript (city picker). `profile.locale` now means preferred language for emails, not the UI language. Optional questions and profile editing are still to build.

### 17. Our own reset-password page at /auth/action — 2026-11-21

**Status:** Accepted. Supersedes the hosted-page part of #16.
**Context:** Firebase's hosted reset page lives on `firebaseapp.com`, looks like Firebase, allows 6-character passwords, and leaves other sessions signed in. I pushed back on it, and the user agreed to build our own.
**Decision:** The console's Action URL points at `https://communalists.com/auth/action`. The proxy picks the locale from the link's `lang`. The page verifies the code, then asks for the new password twice, with sign-up's rules. Saving sets the password, **revokes every session**, and **signs the person in** on this device. Expired and used links show one "This link has expired" message with a way to request a new one. The page handles only `mode=resetPassword` for now.
**Alternatives:** Keep Firebase's page (no setup, but the problems above); a locale-prefixed Action URL (impossible, there's only one); making people sign in again after a reset (friction with no security gain).
**Consequences:** Someone must set the Action URL in the Firebase console, which changes the link in every Firebase auth email, so future email verification has to be handled on the same page. Preview deployments' emails link to production. Sign-up, sign-in, forgot-password and reset now share an `AuthCard` organism.

### 16. Forgot password through Firebase's reset email and hosted page — 2026-11-21

**Status:** Accepted. Hosted reset page superseded by #17
**Context:** Many returning users won't remember their passwords. The user asked for a forgot-password page.
**Decision:** `/{locale}/forgot-password` asks for an email, and a server action has Firebase send its password-reset email in the visitor's language. The link opens **Firebase's hosted reset page**, which then links back to our sign-in. Every request shows the same "Check your email" message, whether or not the account exists.
**Alternatives:** Our own `/reset-password` page that sets the password with the code (matching design, our 8-character rule, our domain; needs the console's Action URL changed for every auth email). Sending our own emails through a mail provider (full control over branding and deliverability, but another service to run).
**Consequences:** It works as soon as the production Firebase setup is done (authorized domain, templates). The reset step looks like Firebase, not Communalists, and allows 6-character passwords. Building the in-app page is the natural next step.

### 15. Sign-in page and confirm-password on sign-up — 2026-11-21

**Status:** Accepted
**Context:** The user asked for the password to be entered twice at sign-up, and for a sign-in page.
**Decision:** Sign-up adds a `confirmPassword` field, compared by the shared schema (never stored). Sign-in lives at `/{locale}/sign-in` (labelled "Sign in", to pair with "Sign out"): a server action that signs in over Firebase's REST API and sets the same session cookie as sign-up. Wrong email and wrong password show one shared message. Signed-out visits to `/welcome` now go to sign-in.
**Alternatives:** A show-password toggle instead of typing twice (less friction, but the user asked for two fields); client-side Firebase sign-in (more JavaScript, and it would split session handling); separate "no account with that email" message (reveals who has an account).
**Consequences:** Both auth forms work without JavaScript. Password reset, a session-aware header and redirecting signed-in visitors away from the auth pages are still to do (`technical/accounts-and-sessions.md`).

### 14. Location from a city picker, not a geocoder — 2026-11-21

**Status:** Accepted. Supersedes the geocoding part of #12.
**Context:** Free-text "City or ZIP" plus OpenStreetMap geocoding was ambiguous (`95112` matched Lithuania), depended on a rate-limited outside service, and people only saw the matched place after signing up. The user suggested dropdowns.
**Decision:** A country select (pre-set, US only for now) plus a **type-ahead city picker** with options like "San Jose, California". The data is GeoNames (CC BY 4.0, credited on the form): 20,748 US places with population 500+, generated by `scripts/build-places.mjs` into `src/lib/places/data/us.json`. Browsers search through `/api/places`. The form submits a GeoNames **place ID**, and the server takes the label and coordinates from its own copy of the data.
**Alternatives:** Three dropdowns (country → state → city; a city list of hundreds or thousands is unusable without search); keeping free text with a confirmation step; worldwide data from day one.
**Consequences:** No geocoding service at sign-up. Adding a country means generating its data file and adding it to `SUPPORTED_COUNTRIES`. City names come in English/local spelling, not translated. The picker needs JavaScript. Small places under 500 people, and neighborhoods, aren't listed.

### 13. Presentational components, atomic folders, and a story for everything — 2026-11-21

**Status:** Accepted
**Context:** The user may build a React Native app later and wants every page and component viewable in Storybook.
**Decision:** Business logic stays out of presentational components (it lives in `src/lib`, `src/hooks` and thin route containers). Components are grouped as atoms, molecules, organisms and pages. Every page, component and hook gets a story under Documentation, Components/Atoms, Molecules, Organisms, Pages, or Hooks. shadcn installs into `atoms/`.
**Alternatives:** Feature folders (`components/sign-up/…`); stories only for shared components.
**Consequences:** Pages are presentational views (`src/components/pages/`) that routes fill with data; server actions are passed in as props. Header and footer became synchronous so Storybook can render them. Rules are in `AGENTS.md` → "Components and Storybook".

### 12. Accounts: server-side sign-up, Firebase session cookies, general-area location — 2026-11-21

**Status:** Accepted. Location part superseded by #14; profile-at-sign-up superseded by #18
**Context:** Open sign-up (decision #11). The user chose email + password; name, email and location on the form; a welcome page afterwards.
**Decision:** One server action validates (Zod), geocodes, creates the Firebase Auth user and a `users/{uid}` profile with the Admin SDK, then sets an httpOnly **Firebase session cookie**. Location is stored as a **general area**: a label plus coordinates rounded to ~1 km and a geohash. Geocoding uses **OpenStreetMap Nominatim**, biased to the visitor's country via `x-vercel-ip-country`.
**Alternatives:** Client-side Firebase sign-up with ID tokens in the browser (more JavaScript, harder to use the session in Server Components); a paid geocoder (Google, Mapbox) needing an API key; storing exact coordinates.
**Consequences:** Works without client JavaScript. Production needs `FIREBASE_SERVICE_ACCOUNT_KEY` and the `NEXT_PUBLIC_FIREBASE_*` variables, and the Email/Password provider enabled. Nominatim's usage policy rules out autocomplete. Details: `technical/accounts-and-sessions.md`.

### 11. Generalize into a multi-organization platform — 2026-11-21

**Status:** Accepted. Follow-ups decided the same day: wildcard subdomains via Vercel DNS, location as distance from a point, per-organization join policy, Requests as the first tool (see `product-vision.md`).
**Context:** The prototype served one group (South Bay organizers) with one tool (aid requests), behind admin-approved volunteer accounts.
**Decision:** Anyone can sign up. Users create, browse (by area), join and moderate **organizations**. Organizations turn on **tools** (Requests with a form + kanban, Library, Calendar, Documents, more later), each with public and internal sides, and get a public page at `{slug}.communalists.com`.
**Alternatives:** Keep the single-organization app (the prototype's model).
**Consequences:** The data model, security rules and routing are multi-tenant from the start. The prototype's feature docs become prior art for the Requests tool. `AGENTS.md`'s product rules were rewritten for the platform.

### 10. Domains: communalists.com and storybook.communalists.com — 2026-11-21

**Status:** Accepted. Live 2026-11-21: `.com` serves the rebuild, `.org` and `www` redirect, Storybook is public.
**Context:** Before this, `communalists.com` (registered at Squarespace Domains, ex-Google Domains) 301-forwarded to `communalists.org`, which served the 2025 Next.js + Prismic site from Vercel at `www.communalists.org`. Email for `support@communalists.com` is forwarded through Squarespace's Mailgun preset.
**Decision:**

- **`communalists.com` (apex) is canonical.** `www.communalists.com` redirects to it.
- **`storybook.communalists.com`** is a second Vercel project from the same repo that builds Storybook. It's **public**.
- **`communalists.org` and `www.communalists.org` redirect to `communalists.com`**, keeping the path, once the new app is live. The 2025 site goes offline (code at `81eed51`).
- **Squarespace DNS:** remove only the "Domain Forwarding" preset (A `@` ×2, CNAME `www`). **Keep** the Email Forwarding preset (Mailgun MX + SPF), the `pic._domainkey` DKIM record, the Google verification CNAME and `_domainconnect`.
- Vercel is managed with the Vercel CLI (pinned 66.5.0, installed globally under Node 24.22.3).

**Alternatives:** `www` as canonical (Vercel's CNAME-friendly default); keeping the 2025 site on `.org`.
**Consequences:** `src/lib/site.ts` holds the canonical URLs, and `metadataBase` uses them. Support email is `support@communalists.com`, which settles the prototype's `.com`/`.org` mix.

### 9. Foundation scaffold choices — 2026-11-20

**Status:** Accepted
**Context:** Initializing the rebuild after decisions #3–#8. The user chose the 2025 monochrome look, pnpm, and ESLint/Prettier/commitlint, Vitest and Storybook from the first commit, with a foundation-only first pass.
**Decision:**

- **pnpm 12 via Corepack. Node pinned to 24.22.3 LTS in `.nvmrc`, minimum 24.15 in `engines`** (the oldest version jsdom 31 supports).
- **Next.js 16.4** with the template defaults `cacheComponents` and `partialPrefetching`. The locale is read through `next/root-params` (next-intl 4.15 deprecated `setRequestLocale` in its favor).
- **shadcn `radix-nova` preset** (Radix primitives, Lucide, Geist), neutral base. `--destructive` is the 2025 crimson `#a71d31`.
- **Geist** font: it covers Vietnamese, which the prototype's Albert Sans did not. CJK uses system fonts.
- **"Communalists" is never translated.** The prototype's Chinese rendering (公社主义者) reads close to "communists".
- **Storybook 10 (Vite builder) with the docs and a11y addons**, pinned to 10.6.7 so pnpm's minimum release age stays on.
- **Firestore rules deny everything**, and local development uses the `demo-communalists` emulator project.
- **Shell copy for es, vi and zh was written during scaffolding** and needs native-speaker review.

**Alternatives:** npm (what earlier attempts used), Storybook's Vitest/Playwright test integration (skipped because Playwright wasn't chosen), translating the brand name.
**Consequences:** See `technical/architecture.md`, `technical/tooling-and-ci.md` and `technical/design-system.md`. The prototype versions of those docs moved to `technical/prototype/`.

### 8. Locale routing from the first commit — 2026-11-20

**Status:** Accepted
**Context:** The public site serves English, Spanish, Vietnamese and Chinese speakers. The prototype kept the language in React state (reset on reload, invisible to search engines).
**Decision:** Scaffold `app/[locale]/…` with `next-intl` from day one, with locales `en`, `es`, `vi`, `zh`, seeded from `data/translations.json`.
**Alternatives:** English first and i18n later (faster start, but every route moves later).
**Consequences:** Every page and link is locale-aware from the start. Docs to follow: `features/05-localization.md`.

### 7. Services and events in Firestore, edited in the dashboard — 2026-11-20

**Status:** Accepted
**Context:** The prototype hard-coded events (every change needed a deploy). The 2025 attempt used Prismic for page content.
**Decision:** Services/events live in Firestore and are edited by moderators through an admin UI in the dashboard. Page copy and the FAQ live in the repo as translations. **No CMS.**
**Alternatives:** Prismic (a second data source to pay for and sync), repo-only content (needs a PR for every schedule change).
**Consequences:** The admin UI must exist before organizers can edit services. Until then, seed from `data/events.json`. Supersedes the Prismic approach in `technical/nextjs-prismic-attempt.md`.

### 6. Tailwind + shadcn/ui for the design system — 2026-11-20

**Status:** Accepted
**Context:** The prototype used Bootstrap + styled-components. The 2025 attempt tried Tailwind + shadcn, then switched to CSS modules (the reason wasn't recorded).
**Decision:** Tailwind v4 + shadcn/ui, with brand tokens as CSS variables in the theme.
**Alternatives:** Tailwind only inside shadcn components with CSS modules elsewhere (two systems), or Radix + CSS modules (continuing the 2025 direction).
**Consequences:** This reverses the 2025 move away from Tailwind. If the original reason resurfaces, record it here.

### 5. Host on Vercel — 2026-11-20

**Status:** Accepted
**Decision:** Deploy on Vercel, which the 2025 attempt also used. It has the best support for Next.js features (ISR, middleware, image optimization).

### 4. Firebase as the backend, same project, emptied — 2026-11-20

**Status:** Accepted
**Context:** The prototype used Firebase Auth, Firestore and Realtime Database without rules or indexes in the repo.
**Decision:** Keep the existing Firebase project, but empty its databases and start a new schema. Security rules and indexes live in the repo with emulator tests. Authorization runs on the server (Admin SDK in server actions and route handlers), never only in the UI.
**Alternatives:** Postgres (Supabase/Neon) is a better fit for relational data like memberships and audit logs. New Firebase projects. Migrating the old data.
**Consequences:** No legacy data to support. Export the old rules (and data, if wanted) before emptying. _Done 2026-11-20:_ production was backed up outside the repo (see `technical/data-model.md`), both databases were emptied, and deny-all rules were deployed for Firestore and Realtime Database. The relational sketch in `technical/data-model.md` needs a Firestore version.

### 3. Next.js (App Router) as the framework — 2026-11-20

**Status:** Accepted
**Context:** The goal is the full platform: public site plus volunteer dashboard.
**Decision:** Next.js App Router for both halves in one codebase.
**Alternatives:** Astro, which is better for a content-only public site, but the dashboard would become one big React island or a separate app.
**Consequences:** Resolves the open Astro vs Next.js question. See `technical/rebuild-plan.md`.

### 2. Reset `main` to docs only, removing the Next.js + Prismic attempt — 2026-11-20

**Status:** Accepted
**Context:** `main` held a second rebuild attempt (Next.js 15 + Prismic, 50 commits, Apr–Nov 2025) that covered only the public marketing shell. The docs had been written from the older prototype on another branch.
**Decision:** `main` holds only `AGENTS.md`, `CLAUDE.md` and `documentation/`. Both earlier codebases are removed from the working tree; their code stays in git history (prototype `7ebc168`, Next.js attempt `81eed51`).
**Alternatives:** Keep the Next.js app and add the docs next to it (keeps working pages, but carries over choices made before these docs existed).
**Consequences:** The rebuild starts from a blank slate. What the Next.js attempt taught is recorded in `technical/nextjs-prismic-attempt.md` and `features/15-little-free-library.md`. The framework choice is still open, though that attempt is evidence for Next.js + Prismic on the public side.

### 1. Preserve prototype discovery as living docs — 2026-11-20

**Status:** Accepted
**Context:** The React + Firebase prototype has a lot of tech debt and is being deleted before a rebuild in Astro or Next.js.
**Decision:** Record every feature, technical insight and known bug in `documentation/`, export the hard-coded data to JSON, and keep these docs up to date as the rebuild changes direction (see the methodology in `AGENTS.md`).
**Alternatives:** Keep the old repo as the reference (slow to search, and it describes the old design only). Start fresh with no record (loses the lessons, such as Firestore read costs and the security gaps).
**Consequences:** Every change must update the matching doc. `CLAUDE.md` symlinks to `AGENTS.md` so every agent reads the same instructions.
