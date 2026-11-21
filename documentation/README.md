# Communalists: Discovery Documentation

Communalists is a mutual-aid platform for South Bay (Santa Clara County, CA) organizers. It was built between Oct 2022 and Jan 2024 (386 commits) as a React + Firebase prototype. These docs record every feature and lesson from that prototype so the code can be deleted and rebuilt in Astro or Next.js.

**These are living documents.** They started as a record of the prototype and are updated as the rebuild makes new choices; see the methodology in [`AGENTS.md`](../AGENTS.md). Choices made since the prototype are logged in [decisions.md](decisions.md).

The original source: branch `interview-demo` at commit `7ebc168`, read file by file on 2026-11-20. File paths in the feature and technical docs point at that commit, so you can look them up in the git history (`github.com/jadeallencook/communalists`) after the files are gone. A second attempt (Next.js + Prismic, 2025) is recorded at commit `81eed51`. As of 2026-11-20, `main` holds only these docs.

## What the product is

It has two halves:

- **Public site.** Anyone can request aid, browse free local services (meals, showers, essentials), offer a donation, and read the FAQ. All of it is in English, Spanish, Vietnamese and Chinese.
- **Volunteer dashboard.** Volunteers sign up, join an organization, then triage aid requests through a 4-stage pipeline. They claim the coordinator and driver roles and comment on each request. Moderators approve new members and can pause the public request form.

## Features

| # | Feature | Audience | Status in prototype |
|---|---|---|---|
| 01 | [Request aid form](features/01-request-aid-form.md) | Public | Live |
| 02 | [Request form kill switch](features/02-request-form-kill-switch.md) | Moderators + public | Live |
| 03 | [Events / services directory](features/03-events-directory.md) | Public | Live, data hard-coded |
| 04 | [Donations](features/04-donations.md) | Public + volunteers | Form live, dashboard tab hidden |
| 05 | [Localization (4 languages)](features/05-localization.md) | Everyone | Live |
| 06 | [Home page and FAQ](features/06-home-and-faq.md) | Public | Live |
| 07 | [Authentication](features/07-authentication.md) | Volunteers | Live |
| 08 | [Organizations and membership](features/08-organizations-and-membership.md) | Volunteers + moderators | Live |
| 09 | [Request triage dashboard](features/09-request-triage-dashboard.md) | Org members | Live |
| 10 | [Request detail and coordination](features/10-request-detail-and-coordination.md) | Org members | Live |
| 11 | [Comment threads](features/11-comment-threads.md) | Org members | Live |
| 12 | [Account settings](features/12-account-settings.md) | Volunteers | Live (display name only) |
| 13 | [Navigation, layout and feedback](features/13-navigation-and-layout.md) | Everyone | Live |
| 14 | [Removed experiments](features/14-removed-experiments.md) | — | Cut from the product |
| 15 | [Little Free Library](features/15-little-free-library.md) | Public | Built in the 2025 Next.js attempt, then removed |

## Technical docs

| Doc | What it covers |
|---|---|
| [Architecture](technical/architecture.md) | Stack, routing, providers, state, and how data flows |
| [Data model](technical/data-model.md) | Every Firestore collection, Realtime Database path, field, and enum |
| [Firebase: cost, security and gotchas](technical/firebase.md) | Read-cost optimizations, query limits, config, and security rules |
| [Tooling and CI](technical/tooling-and-ci.md) | Git hooks, commit rules, CI jobs, path aliases, Node pin |
| [Design system](technical/design-system.md) | Theme tokens, component conventions, UI primitives |
| [Bugs and tech debt](technical/tech-debt.md) | Known bugs, dead code, and what not to carry forward |
| [Rebuild plan](technical/rebuild-plan.md) | Astro vs Next.js, target architecture, migration checklist |
| [2025 Next.js + Prismic attempt](technical/nextjs-prismic-attempt.md) | The second rebuild attempt: stack, CMS model, tokens, lessons |

## Data worth keeping

These files were generated from the source, so the rebuild can import them directly.

| File | Contents |
|---|---|
| [data/events.json](data/events.json) | All 26 hard-coded free-service listings (organization, venue, address, days, hours, tags, website) |
| [data/translations.json](data/translations.json) | Every UI string in all 4 languages, grouped by page (55 keys) |
| [data/enums.json](data/enums.json) | Locations, languages, contact methods, stages, driver states, volunteer roles, days, event tags |
