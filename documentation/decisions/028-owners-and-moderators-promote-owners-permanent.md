# 028 · Owners and moderators can promote; owners are permanent for now

**Date:** 2026-11-23
**Status:** Accepted
**Context:** With only one owner allowed to stay, a sole owner could never leave (decision [#27](027-joining-moderating-banned-status-member-list-setting.md)). The user asked that owners make new owners and moderators, moderators make new moderators, and both approve, remove and ban members.
**Decision:**

- **Owners:** member → moderator or owner, moderator → owner, moderator → regular member.
- **Moderators:** member → moderator only.
- **Nobody changes an owner's role**, and nobody removes or bans an owner. An owner steps down by leaving, which needs another owner. Making an owner asks for confirmation, says it can't be undone for now, and is refused if the person already owns 5 organizations.
- Role changes need no reason but go in the moderation log (`makeModerator`, `makeOwner`, `makeMember`).

**Alternatives:** owners demoting other owners (two owners could fight over a group; better handled later with a vote or an "original owner" rule); moderators demoting moderators (one moderator could undo the others, the same reason they can't remove them); a single "transfer ownership" action (several owners is more resilient for volunteer groups, and transfer is just make-owner then leave).
**Consequences:** A group can't lose its last owner from inside the app. A bad owner can only be dealt with by a platform admin, which isn't built yet. Docs updated: features/16.
