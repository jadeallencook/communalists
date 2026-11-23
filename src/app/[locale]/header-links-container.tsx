'use client';

import {
    SignedInLinks,
    SignedOutLinks,
} from '@/components/molecules/header-links';
import { usePathname } from '@/i18n/navigation';

/** Marks the auth page the visitor is on. */
export function SignedOutLinksContainer() {
    const pathname = usePathname();
    const current =
        pathname === '/sign-in'
            ? 'sign-in'
            : pathname === '/sign-up'
              ? 'sign-up'
              : undefined;
    return <SignedOutLinks current={current} />;
}

/** Marks the current section. */
export function SignedInLinksContainer() {
    const pathname = usePathname();
    return (
        <SignedInLinks
            current={
                pathname.startsWith('/dashboard') ? 'dashboard' : undefined
            }
        />
    );
}
