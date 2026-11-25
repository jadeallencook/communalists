# 011 · Generalize into a multi-organization platform

**Date:** 2026-11-21
**Status:** Accepted. Follow-ups decided the same day: wildcard subdomains via Vercel DNS, location as distance from a point, per-organization join policy, Requests as the first tool (see `product-vision.md`).
**Context:** The prototype served one group (South Bay organizers) with one tool (aid requests), behind admin-approved volunteer accounts.
**Decision:** Anyone can sign up. Users create, browse (by area), join and moderate **organizations**. Organizations turn on **tools** (Requests with a form + kanban, Library, Calendar, Documents, more later), each with public and internal sides, and get a public page at `{slug}.communalists.com`.
**Alternatives:** Keep the single-organization app (the prototype's model).
**Consequences:** The data model, security rules and routing are multi-tenant from the start. The prototype's feature docs become prior art for the Requests tool. `AGENTS.md`'s product rules were rewritten for the platform.
