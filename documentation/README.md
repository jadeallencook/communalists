# Communalists: Discovery Documentation

Communalists is a mutual-aid platform for South Bay (Santa Clara County, CA) organizers. It was first built between Oct 2022 and Jan 2024 (386 commits) as a React + Firebase prototype, and is now being rebuilt with Next.js, Firebase, shadcn/ui and next-intl. These docs record every feature and lesson from the earlier attempts, and how the rebuild works.

**These are living documents.** They started as a record of the prototype and are updated as the rebuild makes new choices; see the methodology in [`AGENTS.md`](../AGENTS.md). Choices made since the prototype are logged in [decisions.md](decisions.md).

The original source: branch `interview-demo` at commit `7ebc168`, read file by file on 2026-11-20. File paths in the feature and technical docs point at that commit, so you can look them up in the git history (`github.com/jadeallencook/communalists`) after the files are gone. A second attempt (Next.js + Prismic, 2025) is recorded at commit `81eed51`. The rebuild's foundation (layout shell, i18n, Firebase wiring, tooling) was scaffolded on 2026-11-20.

## What the product is

It has two halves:

- **Public site.** Anyone can request aid, browse free local services (meals, showers, essentials), offer a donation, and read the FAQ. All of it is in English, Spanish, Vietnamese and Chinese.
- **Volunteer dashboard.** Volunteers sign up, join an organization, then triage aid requests through a 4-stage pipeline. They claim the coordinator and driver roles and comment on each request. Moderators approve new members and can pause the public request form.

## Features

The feature docs describe the prototype unless they have a "Rebuild" section. Rebuild progress so far: the locale routing behind [05](features/05-localization.md) and the header/footer shell from [13](features/13-navigation-and-layout.md). No other features have been started.

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

## Technical docs

| Doc                                                                   | What it covers                                                    |
| --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [Architecture](technical/architecture.md)                             | Current stack, folder layout, request flow, Next.js 16 specifics  |
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
