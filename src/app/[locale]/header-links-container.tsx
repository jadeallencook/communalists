'use client';

import {
    NavLinks,
    SignedOutLinks,
    type NavLinkData,
} from '@/components/molecules/header-links';
import {
    MobileNav,
    type MobileNavAccount,
} from '@/components/organisms/mobile-nav';
import { usePathname } from '@/i18n/navigation';
import { ariaCurrent, navCurrent, navItemsFor } from '@/lib/navigation';

/** The site's sections, with the one being viewed marked. */
function useNavLinks(signedIn: boolean): NavLinkData[] {
    const pathname = usePathname();
    return navItemsFor(signedIn).map((item) => ({
        key: item.key,
        href: item.href,
        current: ariaCurrent(navCurrent(item, pathname)),
    }));
}

function useAuthPage() {
    const pathname = usePathname();
    return pathname === '/sign-in'
        ? 'sign-in'
        : pathname === '/sign-up'
          ? 'sign-up'
          : undefined;
}

/** The header's section links (wide screens). */
export function NavLinksContainer({ signedIn }: { signedIn: boolean }) {
    return <NavLinks links={useNavLinks(signedIn)} />;
}

/** Sign in and Create account (wide screens), marking the auth page the visitor is on. */
export function SignedOutLinksContainer() {
    return <SignedOutLinks current={useAuthPage()} />;
}

/** The Menu button and drawer (below `lg`). */
export function MobileNavContainer({
    account,
}: {
    account?: MobileNavAccount;
}) {
    const links = useNavLinks(Boolean(account));
    const current = useAuthPage();
    return <MobileNav links={links} account={account} current={current} />;
}
