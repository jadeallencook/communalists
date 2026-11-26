# 048 · /find results: underlined names, no "how to join" and no Unclaimed label

**Date:** 2026-11-26
**Status:** Accepted
**Context:** Each `/find` result's top is a link to the group's page, with a **Show details** bar under it that opens a drawer ([16](../features/16-organizations.md)). The user pointed out three problems. It isn't obvious the top of the card can be clicked. Users found the drawer's "Request to join" confusing. And results labelled unclaimed groups **Unclaimed**, which the user asked to remove.
**Decision:**

- The group's **name is always underlined** (it was underlined only on hover), so the top of the card reads as a link. On hover the underline gets thicker and the border brightens.
- The drawer **doesn't show how to join**. "Request to join" read as a button or an action, not a fact. In its place: a local group's area ("Within 10 mi of San Jose, California") and the founding year ("Since 2019") when there is one. Nationwide and international results get no area line, since they sit under their own heading and the card already says where they're based. The directory listing carries `radiusMiles` and `foundedYear` instead of `joinPolicy`. Both are already public on the group's page.
- Results no longer show the **Unclaimed** label. The group's own page still has the label and the unclaimed notice, and the result still leaves out the member count for unclaimed groups. Other places keep the label: "Other organizations near {city}" on a group's page, the dashboard and `/admin`.

**Tried and dropped the same day:** an **Open page →** bar styled like **Show details**, first on every result and then only at the end of the open drawer. The user found it clunky. The underlined name does the job instead.
**Alternatives:** an arrow or "Open" text inside the card's top (on phones it competed with the name for space, the problem the earlier **Details** button had); rewording the join fact, for example "Joining: by request" (still about an action visitors can't take from the list); keeping the Unclaimed label (the user's earlier choice in [033](033-super-users-and-unclaimed-organizations-claims.md) and [18](../features/18-unclaimed-organizations.md), now reversed).
**Consequences:** Directory entries cached before this have no `radiusMiles` or `foundedYear`, so those lines are missing until the cache refreshes, and nothing breaks. Visitors can't tell an unclaimed group from an active one, or how to join, until they open the group's page.
