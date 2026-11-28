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
//   /comrade/{username}/comrades            their comrades
//   /notifications                          the signed-in person's inbox
//   /graphics                               making a flyer or social post
//
// Old addresses (/org/…, /find/us/…) redirect here (next.config.ts).

/** Making graphics ("Make some propaganda", decision #75). */
export const GRAPHICS_PATH = '/graphics';

/** What /find can search. Each has its own route under /find/{kind}. */
export const FIND_KINDS = ['organizations'] as const;
export type FindKind = (typeof FIND_KINDS)[number];

/** The start of a search for one kind: /find/organizations. */
export const findPath = (kind: FindKind) => `/find/${kind}`;

/** Creating an organization. */
export const NEW_ORGANIZATION_PATH = '/organization/new';

/** A person's profile. */
export const profilePath = (username: string) => `/comrade/${username}`;

/** A person's comrades, in full (decision #74). */
export const comradesPath = (username: string) =>
    `/comrade/${username}/comrades`;

/** The signed-in person's notifications. */
export const NOTIFICATIONS_PATH = '/notifications';

/** An organization's pages that live under its address. */
export type OrganizationPage = 'edit' | 'members' | 'claim';

/** An organization's page: /organization/{handle}, or one of its own pages under it. */
export const organizationPath = (handle: string, page?: OrganizationPage) =>
    page ? `/organization/${handle}/${page}` : `/organization/${handle}`;

/**
 * The part of an address that names what wasn't found, for 404 pages:
 * `/dictionary/mutal-aid`, index 1 → `mutal-aid`. Counts segments after the
 * locale (index 0 is `dictionary`). A bad escape is shown as typed.
 */
export function addressSegment(pathname: string, index: number): string {
    const raw = pathname.split('/').filter(Boolean)[index] ?? '';
    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
}
