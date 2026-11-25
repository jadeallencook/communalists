# 033 · Super users, and unclaimed organizations that groups can claim

**Date:** 2026-11-24
**Status:** Accepted
**Context:** The platform has few users yet, and the user wants to show useful local data now (like the prototype's events, [features/03](../features/03-events-directory.md)). They come across organizations worth listing, such as a church's weekly free shower, and want to add them without their own account showing as the owner. The real organization should be able to claim the page. Decision [#28](028-owners-and-moderators-promote-owners-permanent.md) had already said a platform admin would be needed one day.
**Decision** (the user's choices, from options with trade-offs; details in [features/18](../features/18-unclaimed-organizations.md)):

- **Super users** are listed by UID in the `PLATFORM_ADMIN_UIDS` environment variable, per environment; locally, seeded accounts marked `platformAdmin` are added. Their powers are deliberately narrow: add unclaimed organizations, act as owner of every unclaimed one, decide claims. Every action goes in `adminLog`.
- **Unclaimed organizations** have no owner or members (`claimStatus: 'unclaimed'`). Every super user acts as their owner (the user: "pretty much all super users are owners of unclaimed organizations"). Their edits show as "the Communalists team".
- **Listed in /find with an Unclaimed label**; the page explains who added it and that it may be out of date; joining is off.
- **Claims are reviewed by a super user**, who checks outside the app. The request has the person's role and how to confirm it, and the reviewer also sees their account email. The same form can ask for the page to be **taken down**, which archives it.

**Alternatives:** Firebase custom claims for the role (cleaner, but removing someone means revoking their sessions, and emulator and production UIDs differ); a Firestore `platformAdmins` collection (changeable without a deploy, but needs its own admin UI; overkill for a handful of people); the super user as the visible owner (what the user wanted to avoid); proof through an email at the organization's domain (needs email sending, and many small groups use Gmail); instant claims (anyone could take over a real group's page); link-only unclaimed pages (less useful while there are few users); broad super-user powers such as reading any group's data (one stolen account would expose everyone).
**Consequences:** No notifications yet: the team follows up by email by hand. Events for unclaimed organizations wait for the calendar tool. `PLATFORM_ADMIN_UIDS` was set on Vercel Production the same day, with the owner's UID. Docs updated: features/18 (new), features/16, features/03, technical/data-model, technical/deployment, getting-started, README, AGENTS, `.env.example`.
