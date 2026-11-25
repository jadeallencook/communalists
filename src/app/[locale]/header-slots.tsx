import { getLocale } from 'next-intl/server';

import { AccountMenu } from '@/components/molecules/account-menu';
import { signOut } from '@/app/actions/sign-out';
import { getSessionUser } from '@/lib/auth/session';
import { photoUrl } from '@/lib/photos';
import { getUserProfile } from '@/lib/users';

import {
    SignedInLinksContainer,
    SignedOutLinksContainer,
} from './header-links-container';

// The header's signed-in parts. They read the session cookie, so the layout
// renders them inside <Suspense>: the rest of the header stays static and
// these stream in (no flash of the wrong links). Session and profile reads are
// cached per request, so a page that also reads them pays once.

export async function HeaderNav() {
    const user = await getSessionUser();
    return user ? <SignedInLinksContainer /> : null;
}

export async function HeaderAccount() {
    const [user, locale] = await Promise.all([getSessionUser(), getLocale()]);
    if (!user) return <SignedOutLinksContainer />;

    const profile = await getUserProfile(user.uid);
    // Accounts that haven't finished setup have no profile name yet.
    const name = profile?.displayName ?? user.name ?? user.email ?? '';
    return (
        <AccountMenu
            name={name}
            email={user.email}
            locale={locale}
            signOutAction={signOut}
            username={profile?.username}
            photoUrl={photoUrl('user', user.uid, profile?.photoVersion)}
        />
    );
}
