# 022 · Organizations: design, addresses, roles and limits

**Date:** 2026-11-22
**Status:** Accepted. Addresses moved to `/organization/{handle}` in [#63](063-url-scheme-find-kinds-and-organization-addresses.md). Changes [#10](010-domains-communalists-com-and-storybook.md)/#11's subdomain plan to path-based addresses first. The "type" field was replaced by focus areas in [#23](023-organization-focus-areas-as-permanent-keys.md).
**Context:** Organizations are the next feature and the core of the product. The prototype stored members as arrays on one organization ([features/08](../features/08-organizations-and-membership.md)).
**Decision:** Full design in [features/16](../features/16-organizations.md):

- **Address:** `communalists.com/org/{handle}`, with subdomains optional later.
- **Fields:** name, unique handle, type (a fixed translated list plus Other), description, city-level location, reach (local 5–100 mi, national, international), languages, website, socials, public contact email, logo, join policy (default request-to-join), listed/unlisted.
- **Membership:** one record per person per organization, with roles owner, moderator and member.
- **Limits:** at least one owner per organization, and at most 5 organizations owned per person.
- **Handles:** renames allowed (once per 30 days). No redirects; the old handle is held for 30 days so nobody else can claim it, so each organization holds at most one old handle.
- **Deleting** archives the organization.
  **Alternatives:** Subdomains first (blocked on the domain move); `/network/`, `/net/`, `/o/` paths; redirecting old handles (they pile up with every rename, and the user is fine with groups breaking their own links); member arrays on the organization (the prototype's approach, which couldn't reject, leave or promote, and sent member lists to everyone); free-text types (can't translate or filter); locking handles forever.
  **Consequences:** No DNS work needed to launch organizations. Handle uniqueness needs a `handles/` collection written in the same transaction. Renaming an organization updates the copies on membership records. Logos bring in Firebase Storage. Built in four phases, starting with create and list.
