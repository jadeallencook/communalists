# Communalists: Discovery Documentation

**New here? Start with [Getting Started](getting-started.md)** to run the project locally.

Communalists is a platform for mutual aid networks. It began as a tool for South Bay (Santa Clara County, CA) organizers, first built between Oct 2022 and Jan 2024 (386 commits) as a React + Firebase prototype, and is now being rebuilt with Next.js, Firebase, shadcn/ui and next-intl. These docs record every feature and lesson from the earlier attempts, and how the rebuild works.

**These are living documents.** They started as a record of the prototype and are updated as the rebuild makes new choices; see the methodology in [`AGENTS.md`](../AGENTS.md). Choices made since the prototype are logged in [decisions/](decisions/README.md), one file per decision.

The original source: branch `interview-demo` at commit `7ebc168`, read file by file on 2026-11-20. File paths in the feature and technical docs point at that commit, so you can look them up in the git history (`github.com/techletariats/communalists`; it was `jadeallencook/communalists` before moving to the Techletariats org) after the files are gone. A second attempt (Next.js + Prismic, 2025) is recorded at commit `81eed51`. The rebuild's foundation (layout shell, i18n, Firebase wiring, tooling) was scaffolded on 2026-11-20.

## What the product is

**Now:** a platform for mutual aid networks. Anyone can create or join organizations and run them with purpose-built tools. See [product-vision.md](product-vision.md).

**The prototype** (what the feature docs below describe) was one organization with two halves:

- **Public site.** Anyone could request aid, browse free local services (meals, showers, essentials), offer a donation, and read the FAQ, in English, Spanish, Vietnamese and Chinese.
- **Volunteer dashboard.** Volunteers signed up, joined an organization, then triaged aid requests through a 4-stage pipeline. They claimed the coordinator and driver roles and commented on each request. Moderators approved new members and could pause the public request form.

## Features

The feature docs describe the prototype unless they have a "Rebuild" section. Rebuild progress so far: the locale routing behind [05](features/05-localization.md), the header/footer shell from [13](features/13-navigation-and-layout.md), accounts from [07](features/07-authentication.md) (sign-up, sign-in, password reset, account setup; see [accounts and sessions](technical/accounts-and-sessions.md)), organizations ([16](features/16-organizations.md): creating, finding near you, joining, and moderating members and roles), profiles ([17](features/17-profiles.md)), unclaimed organizations that super users add and groups claim ([18](features/18-unclaimed-organizations.md)), and photos for organizations and profiles ([19](features/19-photos.md)). Organization management (editing, invites), then the first tool, come next.

| #   | Feature                                                                           | Audience                | Status in prototype                             |
| --- | --------------------------------------------------------------------------------- | ----------------------- | ----------------------------------------------- |
| 01  | [Request aid form](features/01-request-aid-form.md)                               | Public                  | Live                                            |
| 02  | [Request form kill switch](features/02-request-form-kill-switch.md)               | Moderators + public     | Live                                            |
| 03  | [Events / services directory](features/03-events-directory.md)                    | Public                  | Live, data hard-coded                           |
| 04  | [Donations](features/04-donations.md)                                             | Public + volunteers     | Form live, dashboard tab hidden                 |
| 05  | [Localization (4 languages)](features/05-localization.md)                         | Everyone                | Live                                            |
| 06  | [Home page and FAQ](features/06-home-and-faq.md)                                  | Public                  | Live                                            |
| 07  | [Authentication](features/07-authentication.md)                                   | Volunteers              | Live                                            |
| 08  | [Organizations and membership](features/08-organizations-and-membership.md)       | Volunteers + moderators | Live                                            |
| 09  | [Request triage dashboard](features/09-request-triage-dashboard.md)               | Org members             | Live                                            |
| 10  | [Request detail and coordination](features/10-request-detail-and-coordination.md) | Org members             | Live                                            |
| 11  | [Comment threads](features/11-comment-threads.md)                                 | Org members             | Live                                            |
| 12  | [Account settings](features/12-account-settings.md)                               | Volunteers              | Live (display name only)                        |
| 13  | [Navigation, layout and feedback](features/13-navigation-and-layout.md)           | Everyone                | Live                                            |
| 14  | [Removed experiments](features/14-removed-experiments.md)                         | —                       | Cut from the product                            |
| 15  | [Little Free Library](features/15-little-free-library.md)                         | Public                  | Built in the 2025 Next.js attempt, then removed |
| 16  | [Organizations (rebuild)](features/16-organizations.md)                           | Everyone                | Rebuild: phase 1 built 2026-11-22 (logo next)   |
| 17  | [Profiles and skills (rebuild)](features/17-profiles.md)                          | Everyone                | Rebuild: phase 1 (profiles) built 2026-11-23    |
| 18  | [Super users and unclaimed organizations](features/18-unclaimed-organizations.md) | Super users + everyone  | Rebuild: built 2026-11-24 (events next)         |
| 19  | [Photos for organizations and profiles](features/19-photos.md)                    | Everyone                | Rebuild: built 2026-11-25                       |

## Technical docs

| Doc                                                                   | What it covers                                                    |
| --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [Getting started](getting-started.md)                                 | Prerequisites, one-command setup, first change, troubleshooting   |
| [Accessibility](technical/accessibility.md)                           | The top priority: WCAG 2.2 AA rules, how to check, known gaps     |
| [Architecture](technical/architecture.md)                             | Current stack, folder layout, request flow, Next.js 16 specifics  |
| [Accounts and sessions](technical/accounts-and-sessions.md)           | Sign-up, sign-in, reset, account setup, sessions, local Firebase  |
| [Tooling and CI](technical/tooling-and-ci.md)                         | Setup, scripts, hooks, CI, pnpm 12 settings, setup gotchas        |
| [Design system](technical/design-system.md)                           | shadcn/ui setup, tokens, fonts per language, Storybook            |
| [Deployment](technical/deployment.md)                                 | Vercel projects, domains, Squarespace DNS records, deploy paths   |
| [Data model](technical/data-model.md)                                 | Prototype collections, fields and enums; relational sketch        |
| [Firebase: cost, security and gotchas](technical/firebase.md)         | Read-cost optimizations, query limits, config, and security rules |
| [Prototype: architecture](technical/prototype/architecture.md)        | How the 2022–2024 React SPA was built                             |
| [Prototype: tooling and CI](technical/prototype/tooling-and-ci.md)    | The prototype's hooks, CI jobs and lessons                        |
| [Prototype: design system](technical/prototype/design-system.md)      | The prototype's red Bootstrap theme and assets                    |
| [Bugs and tech debt](technical/tech-debt.md)                          | Known bugs, dead code, and what not to carry forward              |
| [Rebuild plan](technical/rebuild-plan.md)                             | Astro vs Next.js, target architecture, migration checklist        |
| [2025 Next.js + Prismic attempt](technical/nextjs-prismic-attempt.md) | The second rebuild attempt: stack, CMS model, tokens, lessons     |

## Data worth keeping

These files were generated from the source, so the rebuild can import them directly.

| File                                             | Contents                                                                                           |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| [data/events.json](data/events.json)             | All 26 hard-coded free-service listings (organization, venue, address, days, hours, tags, website) |
| [data/translations.json](data/translations.json) | Every UI string in all 4 languages, grouped by page (55 keys)                                      |
| [data/enums.json](data/enums.json)               | Locations, languages, contact methods, stages, driver states, volunteer roles, days, event tags    |
