# 031 · Profiles: member-controlled sharing, groups filtered by each group's setting, opt-in skill search

**Date:** 2026-11-23
**Status:** Accepted (design; not built yet)
**Context:** The user asked for profile pages (public or not, name always shown), previews from group member lists, bios, social links, the groups someone is in, and skills so people can find others nearby who can help ("I need a graphic designer for a flyer"). "User privacy is important and we want to make sure our members feel in control of what they share."
**Decision** (the user's choices, from options with trade-offs; details in [features/17](../features/17-profiles.md)):

- **Visibility:** Everyone / People in my groups (default) / Just my name. The name is always shown. Fields are empty until filled in, and "Preview as…" shows what others see.
- **Groups on a profile** appear only where the viewer could already see the person on that group's page, so a profile never undoes a group's member list setting. People can also hide the list or single groups.
- **Usernames**, chosen at account setup (suggested from the name), with the same rules as group handles. The page lives at `/comrade/{username}` (the user's choice over `/people`, 2026-11-23), because Next.js reserves `@` folders, and `/@{username}` forwards there.
- **Optional fields:** pronouns, bio, languages, general area (city, opt-in), social links and website, skills.
- **Skills** come from a fixed, translated list stored as permanent keys, so searches work across languages. Being findable by skill is a separate opt-in, off by default, and only signed-in members can search, seeing city and rough distance only.
- **Contact** goes through shared links for now; **messaging is a fast follow-up**, designed with blocking and reporting.
- Profiles are `noindex`. The hover preview also opens on keyboard focus, closes with Escape, and every member row is a plain link too.

**Alternatives:** public/private only (no "my groups" middle); listing all of someone's groups (would reveal membership of private groups, like a tenants union); a random profile ID (harder to share, the user preferred usernames); free-text skills (don't match across spellings or languages, can't be translated or moderated); skills searchable by default (people wouldn't realise strangers can find them); a hover-only preview (fails keyboard and touch users).
**Consequences:** Account setup gains a required username question, and existing accounts are asked once. The skill list needs drafting and review in four languages. Skill search needs a composite index. Messaging must be designed before it's built. Docs updated: features/17 (new), README index.
