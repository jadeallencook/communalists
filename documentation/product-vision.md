# Product Vision

Communalists is becoming a **platform for mutual aid networks**: anyone can sign up, create or join an **organization**, and run it with **tools built for mutual aid**. Think Facebook Groups, but with purpose-built tools instead of a feed. Direction set by the user on 2026-11-21 ([decision #11](decisions.md)).

**Built so far:** account sign-up with a general location ([accounts-and-sessions.md](technical/accounts-and-sessions.md)). Organizations and tools are next.

The prototype was one organization ("Communalists") with one tool (aid requests). The rebuild generalizes both.

## Core concepts

| Concept          | What it is                                                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User**         | Anyone. Open sign-up, no approval needed to have an account.                                                                                        |
| **Organization** | A group a user creates, e.g. "South Bay Mutual Aid" or "Oakland Auto Club". Has members, moderators, a public page, and a set of tools.             |
| **Membership**   | A user's role in an organization. Users can belong to many organizations and moderate their own.                                                    |
| **Tool**         | A feature an organization turns on. Each tool can have a **public-facing** side (anyone can see or use it) and an **internal** side (members only). |
| **Public page**  | Each organization's own site at `{slug}.communalists.com`, e.g. `southbaymutualaid.communalists.com`.                                               |

## What users can do

- **Sign up** and make an account.
- **Browse organizations in their area**, and **join** them.
- **Create organizations** and **moderate** the ones they run.
- Give each organization a **public page** on its own subdomain.
- Use the **tools** their organizations have turned on.

## Tools

Organizations pick the tools that fit how they work. Two examples:

- **South Bay Mutual Aid:** a public **request form** that feeds an internal **kanban board** for triaging mutual aid requests.
- **Oakland Auto Club:** only the **Library**, where members add tools to a shared library and track which member has each one.

| Tool                         | Public side                          | Internal side                             | Prior art                                                                                                                                                                                                                                 |
| ---------------------------- | ------------------------------------ | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requests**                 | Request form                         | Kanban board, assignment, comments        | Prototype [01](features/01-request-aid-form.md), [02](features/02-request-form-kill-switch.md), [09](features/09-request-triage-dashboard.md), [10](features/10-request-detail-and-coordination.md), [11](features/11-comment-threads.md) |
| **Library**                  | (Maybe) a catalog of what's lendable | Items, who has what, check-out and return | New. Related: [15 Little Free Library](features/15-little-free-library.md)                                                                                                                                                                |
| **Calendar**                 | Public events                        | Internal events and shifts                | New. Related: [03 Events directory](features/03-events-directory.md)                                                                                                                                                                      |
| **Documents**                | (Maybe) published docs               | Shared internal documents                 | New                                                                                                                                                                                                                                       |
| More (e.g. donations/offers) |                                      |                                           | Prototype [04](features/04-donations.md)                                                                                                                                                                                                  |

The prototype's feature docs now describe **one possible configuration** of the Requests tool, not the whole product.

## Decided (2026-11-21)

| Question                | Decision                                                                                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Organization addresses  | **`communalists.com/org/{handle}`** (decided 2026-11-22, #22). Subdomains (`{handle}.communalists.com`) are optional and later; they'd need the wildcard and DNS move below.                      |
| Organization subdomains | (Later, optional.) Wildcard `*.communalists.com` on Vercel. **DNS moves from Squarespace to Vercel nameservers** (wildcards need Vercel DNS); email, DKIM and Google records are recreated there. |
| "In their area"         | **Distance from a point.** Organizations set a location; users browse within a radius of themselves or a place they search. Needs geo queries (e.g. geohash) in Firestore.                        |
| Joining                 | **Each organization chooses:** open, request-to-join (moderators approve), or invite-only.                                                                                                        |
| First tool              | **Requests:** public form + internal kanban with assignment and comments, generalized from the prototype.                                                                                         |

## Open questions

Roles, handle rules, reserved words and organization fields were settled on 2026-11-22: see [features/16](features/16-organizations.md).

- Whether tools are a fixed set the platform provides.
- Platform-level moderation, now that anyone can create an organization (reporting, abuse, slug squatting).
