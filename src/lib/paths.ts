// The site's public URL shapes, in one place, so a link is never spelled by
// hand (decision #63). Paths have no locale: the i18n `Link`, `redirect`
// and `useRouter` add it. Pure, so a future app can reuse it.
//
//   /find/{kind}/…                          a search (organizations today;
//                                           comrades and events later). What
//                                           follows the kind is up to the kind.
//   /organization/{handle}                  one organization
//   /organization/{handle}/{page}           its pages and, later, its tools
//                                           (/organization/{handle}/events/{slug})
//   /comrade/{username}                     one person
//
// Old addresses (/org/…, /find/us/…) redirect here (next.config.ts).

/** What /find can search. Each has its own route under /find/{kind}. */
export const FIND_KINDS = ['organizations'] as const;
export type FindKind = (typeof FIND_KINDS)[number];

/** The start of a search for one kind: /find/organizations. */
export const findPath = (kind: FindKind) => `/find/${kind}`;

/** Creating an organization. */
export const NEW_ORGANIZATION_PATH = '/organization/new';

/** An organization's pages that live under its address. */
export type OrganizationPage = 'edit' | 'members' | 'claim';

/** An organization's page: /organization/{handle}, or one of its own pages under it. */
export const organizationPath = (handle: string, page?: OrganizationPage) =>
    page ? `/organization/${handle}/${page}` : `/organization/${handle}`;
