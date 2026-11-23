import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import { Skeleton } from '@/components/atoms/skeleton';
import { Link } from '@/i18n/navigation';

export interface SignedOutLinksProps {
    /** Marks the link to the page the visitor is on. Both links always show, so the header doesn't shift. */
    current?: 'sign-in' | 'sign-up';
}

/** Header links for visitors: Sign in, and Create account (wider screens). */
export function SignedOutLinks({ current }: SignedOutLinksProps) {
    const t = useTranslations('HeaderLinks');
    return (
        <>
            <Button
                asChild
                variant="ghost"
                size="sm"
                className="aria-[current=page]:bg-muted"
            >
                <Link
                    href="/sign-in"
                    aria-current={current === 'sign-in' ? 'page' : undefined}
                >
                    {t('signIn')}
                </Link>
            </Button>
            <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link
                    href="/sign-up"
                    aria-current={current === 'sign-up' ? 'page' : undefined}
                >
                    {t('createAccount')}
                </Link>
            </Button>
        </>
    );
}

export interface SignedInLinksProps {
    /** Marks the Dashboard link as the current page. */
    current?: 'dashboard';
}

/**
 * Header links for signed-in users. Just Dashboard for now; organizations'
 * services will be listed here as they're built. Hidden on phones, where the
 * account menu carries them.
 */
export function SignedInLinks({ current }: SignedInLinksProps) {
    const t = useTranslations('HeaderLinks');
    return (
        <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden aria-[current=page]:bg-muted sm:inline-flex"
        >
            <Link
                href="/dashboard"
                aria-current={current === 'dashboard' ? 'page' : undefined}
            >
                {t('dashboard')}
            </Link>
        </Button>
    );
}

/**
 * Shown while the session is checked, in place of the links and account menu.
 * Shaped like either: the size of Sign in, plus Create account from `sm` up
 * (signed in, the avatar and Dashboard take about the same room), so the
 * header barely moves when they arrive.
 */
export function HeaderLinksPlaceholder() {
    return (
        <>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="hidden h-8 w-28 sm:block" />
        </>
    );
}
