# Decision Log

Every meaningful product or technical choice made during the rebuild, one file each. Each records what we chose, what else we considered, and why, so a later change of direction starts from the full picture.

Add one when you choose a framework or library, change the data model, add or cut a feature, change a product rule, or go against something in these docs. If a decision replaces an earlier one, mark the old one **Superseded by #N** (linking the new file) rather than deleting it.

## Finding decisions

File names are `NNN-what-it-is-about.md`: a three-digit number (so `ls` lists them in order) and words describing the subject, so you can find related decisions without opening them, for example `ls documentation/decisions | grep organization`, or `grep -l "handle" documentation/decisions/*.md`. In Storybook they're under **Documentation → Decisions**.

## Adding one

1. Take the next number (one past the top row of the index), and name the file after its subject, like `NNN-short-description-of-the-subject.md`. Use the words someone would search for (feature names, field names, libraries).
2. Copy the template below.
3. Add a row at the top of the index.
4. Link it from the docs it changes, like `[decision #N](../decisions/NNN-….md)`.

```md
# NNN · Short title

**Date:** YYYY-MM-DD
**Status:** Accepted | Superseded by #N | Reverted
**Context:** What prompted this.
**Decision:** What we chose.
**Alternatives:** What else we considered, and why not.
**Consequences:** What this changes. Docs updated: …
```

## Index (newest first)

| #                                                                               | Decision                                                                                           | Date       |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------- |
| [067](067-word-discussions-public-flat-comments-with-up-votes.md)               | Discussions on words: public, flat comments with up votes                                          | 2026-11-27 |
| [066](066-remove-words-upload-on-edit-page-letter-links.md)                     | Remove dictionary words; upload a word's file on its edit page; previous and next letter links     | 2026-11-27 |
| [065](065-brainstorm-definitions-and-upload-one-word.md)                        | Brainstorm definitions with a skill; upload one word's text from a file                            | 2026-11-27 |
| [064](064-seo-titles-share-image-sitemap-and-structured-data.md)                | SEO: Title Case titles, one share image, sitemap and structured data                               | 2026-11-27 |
| [063](063-url-scheme-find-kinds-and-organization-addresses.md)                  | URL scheme: `/find/{kind}`, `/organization/{handle}`, tools under the organization                 | 2026-11-27 |
| [062](062-pr-screenshots-branch-before-and-after.md)                            | PR screenshots: before and after, hosted on a `pr-screenshots` branch                              | 2026-11-27 |
| [061](061-site-navigation-sections-and-phone-menu-drawer.md)                    | Site navigation: sections from one list, and a phone menu drawer                                   | 2026-11-27 |
| [060](060-admin-sections-fail-alone-and-backfill-from-the-app.md)               | Admin dashboard sections fail on their own; backfill runs from the app                             | 2026-11-27 |
| [059](059-umami-reports-on-the-admin-dashboard.md)                              | Umami reports on the admin dashboard                                                               | 2026-11-27 |
| [058](058-super-user-dashboard-counts-search-and-missing-details.md)            | Super-user dashboard: counts, search, and missing details                                          | 2026-11-27 |
| [057](057-dictionary-at-slash-dictionary-with-a-to-z-letters.md)                | The dictionary at /dictionary, with A–Z letter pages                                               | 2026-11-26 |
| [056](056-dictionary-words-title-case-in-english.md)                            | Dictionary words in title case in English                                                          | 2026-11-26 |
| [055](055-marked-words-hover-tooltip-click-opens-page.md)                       | Marked words: hover shows the definition, a click opens its page                                   | 2026-11-26 |
| [054](054-security-rules-tests-against-the-emulator.md)                         | Security rules tests against the Firestore emulator, in CI                                         | 2026-11-26 |
| [053](053-dictionary-shareable-definitions-super-users-manage.md)               | A dictionary: shareable definitions that super users manage                                        | 2026-11-26 |
| [052](052-find-always-has-a-city-profile-or-default.md)                         | /find always has a city: plain /find redirects to the profile's city or San Francisco              | 2026-11-26 |
| [051](051-find-defaults-to-oakland-homepage-links-there.md)                     | /find starts from Oakland; the homepage's Browse button links there when signed out                | 2026-11-26 |
| [050](050-umami-analytics-page-views-and-named-click-events.md)                 | Umami analytics: page views and named click events                                                 | 2026-11-26 |
| [049](049-readable-find-urls-city-in-the-path.md)                               | Readable /find URLs: the city in the path (`/find/us/ca/oakland`)                                  | 2026-11-26 |
| [048](048-find-results-underlined-names-no-join-policy-or-unclaimed-label.md)   | /find results: underlined names, no "how to join" or Unclaimed label                               | 2026-11-26 |
| [047](047-find-filters-common-focus-areas-first-reach-folded.md)                | /find filters: common focus areas first, reach folded away                                         | 2026-11-25 |
| [046](046-footer-shows-commit-only-no-version-number.md)                        | Footer shows the commit only, no version number                                                    | 2026-11-25 |
| [045](045-find-organizations-sub-agent-models-and-pending-list.md)              | find-organizations: Haiku searches, Sonnet researches, and a pending list for unchecked groups     | 2026-11-25 |
| [044](044-prepare-pull-request-skill.md)                                        | prepare-pull-request skill: agents open pull requests when asked                                   | 2026-11-25 |
| [043](043-find-organizations-skill-and-existing-organizations-export.md)        | find-organizations skill, and an export of existing organizations                                  | 2026-11-25 |
| [042](042-branch-protection-on-main.md)                                         | Branch protection on `main`: pull requests, code owner review, squash merges                       | 2026-11-24 |
| [041](041-import-review-edit-remove-explain.md)                                 | Import review: explained problems, profile previews, edit and remove                               | 2026-11-24 |
| [040](040-bulk-import-unclaimed-organizations-from-csv.md)                      | Bulk import of unclaimed organizations from a CSV                                                  | 2026-11-24 |
| [039](039-decision-log-one-file-per-decision.md)                                | The decision log is one file per decision, named by subject                                        | 2026-11-24 |
| [038](038-nearby-organizations-on-organization-page.md)                         | Nearby organizations on each organization's page                                                   | 2026-11-24 |
| [037](037-deleting-organizations-restore-and-make-unclaimed.md)                 | Deleting organizations: owners archive, handle held 30 days, super users restore; "Make unclaimed" | 2026-11-24 |
| [036](036-organization-phone-number-and-year-founded.md)                        | Organizations can have a public phone number and a year founded                                    | 2026-11-24 |
| [035](035-organization-street-address.md)                                       | Organizations can have an optional public street address                                           | 2026-11-24 |
| [034](034-hygiene-focus-area.md)                                                | A "Hygiene" focus area                                                                             | 2026-11-24 |
| [033](033-super-users-and-unclaimed-organizations-claims.md)                    | Super users, and unclaimed organizations that groups can claim                                     | 2026-11-24 |
| [032](032-social-links-as-handles-not-urls.md)                                  | Social links are handles, not URLs                                                                 | 2026-11-24 |
| [031](031-profiles-visibility-groups-skill-search.md)                           | Profiles: member-controlled sharing, groups filtered by each group's setting, opt-in skill search  | 2026-11-23 |
| [030](030-editing-organizations-handle-changes-and-holds.md)                    | Editing organizations: the create form reused; handle owners-only with holds                       | 2026-11-23 |
| [029](029-accessibility-top-priority.md)                                        | Accessibility is the top priority                                                                  | 2026-11-23 |
| [028](028-owners-and-moderators-promote-owners-permanent.md)                    | Owners and moderators can promote; owners are permanent for now                                    | 2026-11-23 |
| [027](027-joining-moderating-banned-status-member-list-setting.md)              | Joining and moderating: requests, one "banned" status, reasons in a log, and a member list setting | 2026-11-23 |
| [026](026-find-organizations-page-distance-filters-in-url.md)                   | Finding organizations: a public /find page, distance only, filters in the URL                      | 2026-11-23 |
| [025](025-realistic-test-data.md)                                               | Realistic test data                                                                                | 2026-11-23 |
| [024](024-dev-toolbar-one-click-sign-in-and-test-data.md)                       | Local dev toolbar with one-click test sign-in, and test data that's always there                   | 2026-11-23 |
| [023](023-organization-focus-areas-as-permanent-keys.md)                        | Organizations: focus areas instead of a type, stored as permanent keys                             | 2026-11-23 |
| [022](022-organizations-design-handles-roles-limits.md)                         | Organizations: design, addresses, roles and limits                                                 | 2026-11-22 |
| [021](021-cache-profile-reads-tagged-per-user.md)                               | Cache profile reads on the server, tagged per user                                                 | 2026-11-22 |
| [020](020-session-aware-header-dashboard-account-settings.md)                   | Session-aware header, /dashboard, and account settings                                             | 2026-11-22 |
| [019](019-footer-shows-version-and-commit.md)                                   | Show version and commit in the footer                                                              | 2026-11-21 |
| [018](018-sign-up-credentials-only-then-account-setup.md)                       | Sign-up asks only credentials; every account finishes on one setup page                            | 2026-11-21 |
| [017](017-reset-password-page-auth-action.md)                                   | Our own reset-password page at /auth/action                                                        | 2026-11-21 |
| [016](016-forgot-password-firebase-reset-email.md)                              | Forgot password through Firebase's reset email and hosted page                                     | 2026-11-21 |
| [015](015-sign-in-page-and-confirm-password.md)                                 | Sign-in page and confirm-password on sign-up                                                       | 2026-11-21 |
| [014](014-location-city-picker-not-geocoder.md)                                 | Location from a city picker, not a geocoder                                                        | 2026-11-21 |
| [013](013-presentational-components-atomic-folders-storybook-stories.md)        | Presentational components, atomic folders, and a story for everything                              | 2026-11-21 |
| [012](012-accounts-server-side-signup-session-cookies-general-area-location.md) | Accounts: server-side sign-up, Firebase session cookies, general-area location                     | 2026-11-21 |
| [011](011-multi-organization-platform.md)                                       | Generalize into a multi-organization platform                                                      | 2026-11-21 |
| [010](010-domains-communalists-com-and-storybook.md)                            | Domains: communalists.com and storybook.communalists.com                                           | 2026-11-21 |
| [009](009-foundation-scaffold-choices.md)                                       | Foundation scaffold choices                                                                        | 2026-11-20 |
| [008](008-locale-routing-from-first-commit.md)                                  | Locale routing from the first commit                                                               | 2026-11-20 |
| [007](007-services-and-events-in-firestore-edited-in-dashboard.md)              | Services and events in Firestore, edited in the dashboard                                          | 2026-11-20 |
| [006](006-tailwind-shadcn-design-system.md)                                     | Tailwind + shadcn/ui for the design system                                                         | 2026-11-20 |
| [005](005-vercel-hosting.md)                                                    | Host on Vercel                                                                                     | 2026-11-20 |
| [004](004-firebase-backend-same-project-emptied.md)                             | Firebase as the backend, same project, emptied                                                     | 2026-11-20 |
| [003](003-nextjs-app-router-framework.md)                                       | Next.js (App Router) as the framework                                                              | 2026-11-20 |
| [002](002-reset-main-to-docs-only-remove-nextjs-prismic-attempt.md)             | Reset `main` to docs only, removing the Next.js + Prismic attempt                                  | 2026-11-20 |
| [001](001-preserve-prototype-discovery-as-living-docs.md)                       | Preserve prototype discovery as living docs                                                        | 2026-11-20 |
