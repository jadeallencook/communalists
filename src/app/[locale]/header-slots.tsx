import { getLocale } from 'next-intl/server';

import { AccountMenu } from '@/components/molecules/account-menu';
import { signOut } from '@/app/actions/sign-out';
import { isPlatformAdmin } from '@/lib/auth/platform-admin';
import { getSessionUser } from '@/lib/auth/session';
import { MENU_ORGANIZATION_LIMIT } from '@/lib/navigation';
import { getMemberships } from '@/lib/organizations';
import { getUserProfile } from '@/lib/users';

import {
    MobileNavContainer,
    NavLinksContainer,
    SignedOutLinksContainer,
} from './header-links-container';

// The header's session-dependent parts. They read the session cookie, so the
// layout renders them inside <Suspense>: the rest of the header stays static
// and these stream in (no flash of the wrong links). Session, profile and
// membership reads are cached (per request, and memberships per user until
// they join or leave), so a page that also reads them pays once.

export async function HeaderNav() {
    const user = await getSessionUser();
    return <NavLinksContainer signedIn={Boolean(user)} />;
}

export async function HeaderAccount() {
    const [user, locale] = await Promise.all([getSessionUser(), getLocale()]);
    if (!user) {
        return (
            <>
                <div className="hidden items-center gap-1 lg:flex">
                    <SignedOutLinksContainer />
                </div>
                {/* Keyed by session so the drawer starts closed after sign-in or sign-out. */}
                <MobileNavContainer key="signed-out" />
            </>
        );
    }

    const [profile, memberships] = await Promise.all([
        getUserProfile(user.uid),
        // A shortcut, not the page: if it can't load, the menu goes without.
        getMemberships(user.uid).catch(() => []),
    ]);
    // Accounts that haven't finished setup have no profile name yet.
    const name = profile?.displayName ?? user.name ?? user.email ?? '';
    const account = {
        name,
        email: user.email,
        locale,
        username: profile?.username,
        // Only what the menu shows leaves the server: names and handles.
        organizations: memberships
            .slice(0, MENU_ORGANIZATION_LIMIT)
            .map(({ org }) => ({ name: org.name, handle: org.handle })),
        moreOrganizations: memberships.length > MENU_ORGANIZATION_LIMIT,
        isAdmin: isPlatformAdmin(user.uid),
        signOutAction: signOut,
    };
    return (
        <>
            <div className="hidden lg:block">
                <AccountMenu {...account} />
            </div>
            <MobileNavContainer key="signed-in" account={account} />
        </>
    );
}
