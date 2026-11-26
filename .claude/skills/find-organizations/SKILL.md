---
name: find-organizations
description: Find mutual aid and community-help organizations in an area (a city or region, optionally a radius) and write them into an import CSV for Communalists, skipping groups already on the platform, already researched, or already rejected. Use when asked to look for, discover or research organizations in a place for the super-user bulk import.
---

# Find organizations in an area

You get an **area** (like "San Jose, CA" or "Fresno, CA, 50 miles") and produce a CSV a super user reviews and uploads at `/admin/import`, where each row becomes a public, **Unclaimed** page that people in need use to find help. This skill covers **finding** groups and not wasting work on known ones. The **columns, research and privacy rules** are in `.claude/skills/prepare-organizations-csv/SKILL.md`. Read it before writing any row, and follow it exactly. Background: `documentation/features/18-unclaimed-organizations.md`.

What counts: anything a neighbor could turn to for help or to help out. That includes volunteer mutual aid groups, free fridges, Food Not Bombs chapters, tenant and labor unions, tool libraries, and also staffed nonprofits like food banks, pantries and free clinics (the user chose to include those, decision #40). Leave out businesses, government offices, and groups with no sign of activity in the last 12 months.

## Files

Everything goes under `research/organizations/`, which git ignores (the export includes unlisted organizations, and research is unverified). Use a lowercase, hyphenated area slug.

| File                                                      | What                                                                                                                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `research/organizations/communalists-organizations-*.csv` | The super-user export of every organization already on Communalists. Only the newest is read                                                                 |
| `research/organizations/{area}/candidates.csv`            | Scratch list: `name,website,socials,source`, one line per group found, before researching. Never read as "known"                                             |
| `research/organizations/{area}/organizations.csv`         | The import file, from `prepare-organizations-csv/template.csv`. Over 200 rows: `organizations-2.csv` and so on                                               |
| `research/organizations/{area}/rejected.csv`              | `name,website,socials,reason,checkedOn`: every group looked at and left out (closed, inactive, a business, out of area), so no later run researches it again |

## Tools (run these instead of doing the work by hand)

```sh
node .claude/skills/prepare-organizations-csv/find-place.mjs "San Jose" CA   # place ID of a city
pnpm orgs:area <placeId> [miles=25] [minPopulation=5000]                  # the cities in the area, biggest first
pnpm orgs:known research/organizations/{area}/candidates.csv              # NEW / KNOWN / MAYBE for each candidate
pnpm orgs:known --name "…" [--website …] [--socials instagram:user]       # one quick lookup
pnpm orgs:check research/organizations/{area}/organizations.csv           # the import's own row checks, offline
```

`orgs:known` reads every CSV under `research/organizations/` (the newest export, earlier import files from any area, and every `rejected.csv`). It matches on website, social account, name (ignoring case, accents, punctuation and a leading "The") and phone, and says **MAYBE** for a similar name, like a chapter of a known group. `orgs:check` runs `src/lib/organizations/import.ts` itself and prints the same messages and fixes as the review page.

## Steps

1. **Get a current export.** Look for `research/organizations/communalists-organizations-*.csv`. If there's none, or `orgs:known` says it's older than 7 days, **stop and ask the user**. A super user downloads it from production at `/admin/import` → **Download organizations already on Communalists** and saves it in `research/organizations/`. Each download is recorded in the admin log. Without one, only continue if the user says to; the import still refuses exact name and website repeats.
2. **Set the area.** Look up the place ID, then run `orgs:area` (25 miles unless the user said otherwise) to get the cities to cover. Small towns matter as much as the big city.
3. **Search, wide and cheap.** For each city, search for its mutual aid networks, free fridges and pantries, Food Not Bombs, tenant unions, tool and lending libraries, free clinics, and groups for immigrants, unhoused neighbors and disability. Also read the local directories: county 211, the regional food bank's pantry locator, and city or community wiki lists. Record **only** name, website or social account, and where you saw it in `candidates.csv`. Don't research anything yet.
4. **Drop the known ones.** Run `orgs:known` on `candidates.csv`.
   - **KNOWN, active:** skip it. If your search found something the existing page lacks or has wrong, mention it in your summary; don't add a row.
   - **KNOWN, ARCHIVED:** never add it again. It was deleted, or taken down **at the group's own request**. Mention it to the user.
   - **KNOWN in rejected.csv:** skip it, unless the reason has likely changed (for example "no activity" more than a year ago).
   - **MAYBE:** open both and decide. A separate chapter with its own site, contacts and area is a new row (say why in `notes`). The same group under another name is a skip.
   - **NEW:** research it.
5. **Research each new one**, following `prepare-organizations-csv` (its own site or official social first, a blank cell rather than a guess, the organization's details only, never a person's). Either add a row to `organizations.csv`, or add a line to `rejected.csv` with a short reason and today's date. Every candidate ends up in one of the two.
6. **Check the file.** Run `pnpm orgs:check` and fix every row it reports, then run it again until it exits cleanly. Run `orgs:known` on `organizations.csv` too, to catch repeats found during research.
7. **Hand it over.** Tell the user the file path, how many rows are ready, what you skipped as known (with any active pages that look out of date), any archived matches, the MAYBE calls you made, and the rows whose `notes` need a reviewer's attention. The super user uploads it with **Review file** at `/admin/import`.

## Saving tokens

- Search results are enough for `candidates.csv`. Open a page only in step 5, and only for NEW candidates.
- Run `orgs:known` once on the whole list, not once per group.
- Let `orgs:check` find rule problems. Don't re-read the column table to check rows by hand.
- For a big area, work city by city: candidates, known, research, then the next city. Earlier rows then count as known.
