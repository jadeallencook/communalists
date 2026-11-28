// The site's top-level sections: the one list the header's links and the
// phone menu are drawn from. Pure (no React or Next), so it's tested directly
// and a future app can reuse it. Adding a platform-wide section is one entry
// here plus a `Nav.<key>` label in every messages file. Tools that belong to
// one organization (requests, lending library…) don't go here: they get the
// organization's own navigation. See documentation/features/13-navigation-and-layout.md.

import { GRAPHICS_PATH, NEW_ORGANIZATION_PATH, findPath } from './paths';

export type NavKey = 'organizations' | 'dictionary' | 'graphics' | 'dashboard';

export interface NavItem {
    key: NavKey;
    href: string;
    /** Who sees it. Being signed in grants nothing inside organizations; this is only about what's useful. */
    audience: 'everyone' | 'signed-in';
    /** Path prefixes (locale removed) that belong to this section. */
    sections: readonly string[];
}

export const NAV_ITEMS: readonly NavItem[] = [
    {
        key: 'organizations',
        href: findPath('organizations'),
        audience: 'everyone',
        sections: [findPath('organizations'), '/organization'],
    },
    {
        key: 'dictionary',
        href: '/dictionary',
        audience: 'everyone',
        sections: ['/dictionary'],
    },
    {
        key: 'graphics',
        href: GRAPHICS_PATH,
        audience: 'everyone',
        sections: [GRAPHICS_PATH],
    },
    // Last, so it only adds to the end of the row when the session arrives.
    {
        key: 'dashboard',
        href: '/dashboard',
        audience: 'signed-in',
        sections: ['/dashboard'],
    },
];

/** The items to show, in order. */
export function navItemsFor(signedIn: boolean): NavItem[] {
    return NAV_ITEMS.filter((item) => item.audience === 'everyone' || signedIn);
}

/** How a link relates to the page: it is the page, it's the page's section, or neither. */
export type NavCurrent = 'page' | 'section' | undefined;

const within = (pathname: string, prefix: string) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`);

/**
 * Whether `item` is the page being viewed (`aria-current="page"`) or the
 * section it's in (`aria-current="true"`). `pathname` has no locale.
 * Creating an organization (/organization/new) isn't browsing them, so it marks nothing.
 */
export function navCurrent(item: NavItem, pathname: string): NavCurrent {
    const path = pathname.replace(/\/+$/, '') || '/';
    if (path === item.href) return 'page';
    if (path === NEW_ORGANIZATION_PATH) return undefined;
    return item.sections.some((prefix) => within(path, prefix))
        ? 'section'
        : undefined;
}

/** The value for the link's `aria-current` attribute. */
export function ariaCurrent(current: NavCurrent): 'page' | 'true' | undefined {
    return current === 'page' ? 'page' : current ? 'true' : undefined;
}

/** How many of the person's organizations the menu lists before "See all". */
export const MENU_ORGANIZATION_LIMIT = 5;
