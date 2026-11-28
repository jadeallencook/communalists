---
name: prepare-organizations-csv
description: Prepare or fix a CSV of mutual aid organizations (unverified research) for the super-user bulk import at /admin/import, which adds them as unclaimed organizations. Use when turning research notes or another spreadsheet into the import CSV, fixing rows the import's check rejected, or writing rows for the find-organizations skill (which finds the groups in an area; this skill holds the column and research rules).
---

# Prepare an organizations CSV for /admin/import

The CSV becomes **public pages** on Communalists, labeled Unclaimed, that people in need use to find help and decide where to go. A wrong address or a closed group sends someone across town for nothing. **Leave a cell blank rather than guess.** Background: `documentation/features/18-unclaimed-organizations.md` → Importing from a CSV.

To **find** organizations in an area (and skip ones already on Communalists), use `.claude/skills/find-organizations/`. It follows the rules here for every row.

The import checks every row with the same rules as the create form (`src/lib/organizations/import.ts`, which uses `src/lib/validation/organization.ts`). If this file and the code disagree, the code wins: fix this file.

## Steps

1. **Research** each organization from its own website or official social account where possible. A news article or directory is a weaker source. Say which kind in `verification`.
2. **Fill one row per organization** using the columns below. Start from `template.csv` in this folder. Keep the header row exactly as it is.
3. **Look up every `placeId`** with the helper. Never invent one:
   `node .claude/skills/prepare-organizations-csv/find-place.mjs "San Jose" CA`
   Use the city where the organization is based or serves from. For a group with no fixed place, use the main city it serves.
4. **Write `notes`** for anything a reviewer should check: conflicting hours or addresses, a guessed language, details left out because they couldn't be confirmed.
5. **Check** the file with the import's own rules, offline: `pnpm orgs:check path/to/file.csv` (from find-organizations). It prints every problem with its fix, the same as the review page. Only the database checks (handle taken, already on Communalists) are left for Review file; `pnpm orgs:known path/to/file.csv` catches most of those early.
6. **Hand it over** for review at `/admin/import`. A super user uploads it with **Review file**, which adds nothing: it shows every row as its page will look, explains each problem and how to fix it, and lets them edit or remove rows before adding the rest. **Download CSV** there gives back the reviewed file. To try it locally: `pnpm dev`, sign in as Jordan Lee (a seeded super user) from the dev toolbar, and open `/en/admin/import`.

## Columns

Comma-separated, UTF-8, with a header row. Quote any cell that contains a comma, a quote (written `""`) or a line break. Lists inside a cell are separated by **semicolons** (`food;housing`).

| Column                 | Required         | Rules                                                                                                                                                                                                                                                                                            |
| ---------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`                 | yes              | 2–80 characters. The organization's own name, as it writes it                                                                                                                                                                                                                                    |
| `handle`               | no               | Its address (`/organization/{handle}`): 3–30 lowercase letters, numbers and single hyphens. Left blank, it's made from the name. Shorten long names                                                                                                                                              |
| `focusAreas`           | yes              | 1–3 of: `general, food, housing, transportation, technology, health, childcare, education, clothing, hygiene, lending, disasterRelief, legal, labor, arts, hobbies, faith, animals, environment, other` (`src/lib/organizations/options.ts`)                                                     |
| `description`          | no               | Up to 2,000 characters. Written **as the organization** ("We are…", "We give out…"), never about it from outside. What it does and when, in plain words, for someone looking for help. No marketing copy. See "Writing the description"                                                          |
| `foundedYear`          | no               | Four digits, 1800 to this year. Only if a source states it                                                                                                                                                                                                                                       |
| `country`              | no               | `US` (the only country supported). Blank means `US`                                                                                                                                                                                                                                              |
| `placeId`              | yes              | GeoNames ID from `find-place.mjs`                                                                                                                                                                                                                                                                |
| `placeLabel`           | no               | The city, like `San Jose, CA`. The import refuses the row if it isn't the city of `placeId`, which catches a wrong ID                                                                                                                                                                            |
| `streetAddress`        | no               | Only a **public place people go to** (a pantry, a dining room, an office). Never a home or a warehouse with no public service. Up to 200 characters                                                                                                                                              |
| `reach`                | yes              | `local`, `national` or `international`                                                                                                                                                                                                                                                           |
| `radiusMiles`          | if local         | `5`, `10`, `25`, `50` or `100`: roughly the area it serves                                                                                                                                                                                                                                       |
| `languages`            | yes              | At least one of: `en, es, vi, zh, tl, ko, ja, ar, fa, hi, pa, pt, ru, fr, am, so, ase` (`ase` is American Sign Language). Only languages it actually works in; a site's translation widget doesn't count                                                                                         |
| `website`              | no               | Its own site. Not a temporary or builder address                                                                                                                                                                                                                                                 |
| `contactEmail`         | no               | The organization's public address only                                                                                                                                                                                                                                                           |
| `phone`                | no               | The organization's public number, like `+14155550123` or `(415) 555-0123`                                                                                                                                                                                                                        |
| `socials`              | no               | `platform:username`, separated by semicolons. Platforms: `instagram, facebook, facebookGroup, x, bluesky, tiktok, youtube, telegram`. Usernames only, not links. YouTube needs an `@` handle; legacy `/user/` links can't be stored. Leave out platforms not on this list (note them in `notes`) |
| `joinPolicy`           | no               | `request` (default), `open` or `invite`                                                                                                                                                                                                                                                          |
| `visibility`           | no               | `listed` (default) or `unlisted`                                                                                                                                                                                                                                                                 |
| `memberListVisibility` | no               | `members` (default)                                                                                                                                                                                                                                                                              |
| `verification`         | no, but fill it  | Where the details came from: `official site`, `official social`, `community wiki`, `news`, or `needs verification`                                                                                                                                                                               |
| `notes`                | no               | For the reviewer. Never imported                                                                                                                                                                                                                                                                 |
| `sources`              | yes, in practice | The pages the details came from, separated by semicolons. Never imported, but the reviewer reads them                                                                                                                                                                                            |

## Writing the description

The description appears on the organization's own page, so it should read as if the group wrote it. When a group claims its page, it inherits this text.

- **Use its own voice:** "We are a nonprofit serving Deep East Oakland…", not "A nonprofit serving…" or "The group runs…". Speak to the reader as "you" ("Call us to see whether you qualify").
- **Start from its own bio** on its site or official social account. Keep its wording when the wording is short and plain. Rewrite it in plain language when it's long or reads like marketing ("empowering", "transformative"). Don't paste long passages.
- **Then add the practical details** the bio usually leaves out: what someone can get, which days and times, and where. Those matter more than the mission statement.
- Facts come only from the sources, the same as every other column. Writing as "we" doesn't permit claims the group didn't make.

Unknown columns are reported and ignored. `verification`, `notes` and `sources` are shown to the reviewer and never stored.

## Privacy

Only the **organization's** public details. Never a volunteer's or organizer's personal name, phone number, email or home address, even if it's on a flyer. No details about the people a group serves. A group run from someone's home gets a city, not a street address.

## What the import refuses

Each refused row is skipped, and the others can still be added:

- any rule above broken (the report names the column);
- the same name or handle as an earlier row in the file;
- a handle that's already taken, or an organization already on Communalists with the **same name or website**. To fix this, check whether it's really the same group before renaming anything.

Up to 200 rows and 500 KB per file. Split bigger research into several files.
