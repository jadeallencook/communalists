# Research brief (sub-agent)

You research a batch of candidate organizations for the Communalists bulk import. Each row you write becomes a **public page that people in need use to decide where to go**. A wrong address or a closed group sends someone across town for nothing, so **leave a cell blank rather than guess**.

Your orchestrator gives you:

- the area;
- the batch (name, website, socials and source of each candidate);
- the area's cities and their place IDs;
- a **batch folder** to write to;
- how many web searches you may use.

## Read first

`.claude/skills/prepare-organizations-csv/SKILL.md`. Follow its columns, its description voice ("We…"), and its privacy and research rules exactly. The header row is in `.claude/skills/prepare-organizations-csv/template.csv`.

## For each candidate

1. **Find its own website or official social account.** Read it with WebFetch, which costs no search. Use WebSearch only when you have no URL, and stay within your share. Prefer the group's own site or social account over directories and news.
2. **Decide which of three outcomes it gets:**
   - **row:** an active group based in the area that fits.
   - **rejected:** a real decision. That covers a business, a government office, no sign of activity in the last 12 months, closed, based outside the area's cities (name the city), or the same group as another row (say which). If you fold a program into another group's row, **leave the parent's website off the rejected line**. Otherwise the duplicate check marks the parent itself as rejected.
   - **pending:** you couldn't tell, because search ran out, a site refused automated reads, or a source is only a PDF. Never reject a group just because you couldn't check it.
3. **Fill the row.**
   - `placeId` comes from the given list, or from `node .claude/skills/prepare-organizations-csv/find-place.mjs "City" ST`. Never invent one.
   - `streetAddress` only for a public place people go to. Never a home, and never a domestic-violence shelter.
   - Fill `verification`, `sources`, and `notes` for anything a reviewer should check.
   - No individual's name, phone, email or address, ever.

## Write (in your batch folder only)

- `rows.csv`: the template's header, then your rows.
- `rejected.csv`: header `name,website,socials,reason,checkedOn`, using today's date.
- `pending.csv`: the same header as `rejected.csv`. The reason says what to retry, for example "site 403s; check by hand".

Then run `pnpm orgs:check <batch folder>/rows.csv` and fix everything it reports.

## Return

A few lines, not the rows:

- counts of rows, rejected and pending;
- anything the orchestrator should know, such as a likely duplicate of another candidate, a related group you found but didn't research, or a site that refused automated reads.

Every candidate in your batch must end up in exactly one of the three files.
