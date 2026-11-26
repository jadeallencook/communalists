# 045 · find-organizations: smaller models for sub-agents, and a pending list

**Date:** 2026-11-25
**Status:** Accepted
**Context:** On 2026-11-25 the `find-organizations` skill (decision #43) ran for six areas at once: San Jose, San Francisco, Santa Cruz, Saginaw, Bay City and Tawas. Each area got its own orchestrator agent, and each orchestrator sent out research agents, all on the main model. The run cost a lot of tokens: roughly 130k–280k for each orchestrator, before counting its research agents. It hit the 5-hour usage limit, and several agents died partway through. The web-search budget, about 200 calls, turned out to be shared by the whole session, and it ran out within minutes. Research then fell back to reading pages directly, and about 130 groups couldn't be checked. Those groups went into `rejected.csv`, which makes every later run skip them. The user asked whether smaller or more efficient models would make sense, and to update the skill if so.
**Decision:**

- **The main session orchestrates.** There's no separate orchestrator agent per area, and areas run one after another, not in parallel.
- **Candidate search runs on Haiku.** One agent per area follows `searcher.md` and writes `candidates.csv` itself. This step only collects names and links, and every candidate is checked later.
- **Research runs on Sonnet**, with about 8 candidates per agent and at most 3 agents at a time, following `researcher.md`. Research doesn't run on Haiku, because its rows become public pages that people rely on, and research is where a wrong address or a missed closure would get through.
- **Research agents write batch files** to the scratchpad, not their rows into a report. The orchestrator merges them with a shell loop and runs `orgs:check`, so the rows never pass through its context.
- **Each agent gets a share of the search budget,** and agents prefer WebFetch on known URLs and directories, which costs no search.
- **A third outcome, `pending.txt`,** for groups that couldn't be checked because search ran out, a site blocked automated reads, or the only source was a PDF. `orgs:known` doesn't read it, so later runs retry these groups. `rejected.csv` is now only for real decisions. The leftovers from the 2026-11-25 run were moved there.

**Alternatives:**

- **Haiku for research too.** It's cheapest, but it's the most likely to fill a cell with a guess, and a wrong public address harms the people the page is for.
- **Keeping orchestrator agents on a cheaper model.** It still costs a whole context per area for coordination the main session can do. It's worth it only for many areas at once, and the shared search budget argues against running areas in parallel anyway.
- **A merge script (`pnpm orgs:merge`).** The shell loop plus `orgs:check`, which already catches repeated handles, was enough without new code.
- **Keeping unverified groups in `rejected.csv` with a "recheck" reason.** It relies on every later run reading every reason. A separate file is safer.

**Consequences:** A run costs far fewer main-model tokens. Search is still the bottleneck: one session covers only a few areas before search runs out, and the rest end up in `pending.txt`. The skill now lists sites known to block automated reads and warns that the place data has wrong coordinates for New Haven, MI. Docs updated: `.claude/skills/find-organizations/SKILL.md` (with the new `searcher.md` and `researcher.md`), features/18.
