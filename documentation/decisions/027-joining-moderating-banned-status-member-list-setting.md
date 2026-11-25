# 027 · Joining and moderating: requests, one "banned" status, reasons in a log, and a member list setting

**Date:** 2026-11-23
**Status:** Accepted
**Context:** The second half of phase 2. The user asked for requests that owners and moderators approve (open groups join at once), blocking, removing ("kick") and banning with a logged reason that may later justify closing an account, and a member list that each group chooses to show in full or as a count, with owners and moderators always shown.
**Decision:**

- **Statuses on the existing membership record:** `pending` (asked), `active`, `banned`. Denying deletes the request; removing deletes the membership; banning keeps the record as `banned` so they can't ask again until unbanned.
- **Block and ban are the same thing** (the user's choice): "Deny and block" on a request and "Ban" on a member both set `banned`.
- **Moderators act on members only; owners also on moderators; nobody on owners** here (the user's choice), so one moderator can't remove the others.
- **Reasons are required** to remove, ban or block, kept in `organizations/{id}/moderationLog` with who and when, and seen only by owners and moderators (the user's choice). Every moderation action is logged.
- **Member list setting** with three choices: everyone, members only (default), or just the count (the user's choice, over a public/count-only toggle). This replaces the earlier "member lists are members-only" rule with a per-group choice that's private by default.
- **The person's name is copied onto their membership,** so a member list is one query; saving a profile updates the copies.
- **The last owner can't leave.**

**Alternatives:** separate "blocked" and "banned" lists (the same result, twice the UI); moderators acting on other moderators (one bad moderator could remove the rest); showing the reason to the person removed (more transparent, but invites arguments and less honest notes); member names fetched from `users` per list (one read per member instead of one query, and the profile isn't otherwise needed); a public/count-only toggle (puts names on the open web with one click, risky for groups like tenant unions).
**Consequences:** The setting can only be chosen at creation until profile editing exists (phase 3). Without ownership transfer, the last owner of a group can't leave. Sign-in doesn't return to the group after "Sign in to join". There are no notifications yet, so moderators find requests through the Manage members count. Docs updated: features/16, technical/data-model, getting-started.
