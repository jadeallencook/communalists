import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import { Skeleton } from '@/components/atoms/skeleton';
import { Link } from '@/i18n/navigation';
import { track } from '@/lib/analytics';
import type { NavKey } from '@/lib/navigation';

/** One top-level section link, as the containers prepare it from src/lib/navigation.ts. */
export interface NavLinkData {
    key: NavKey;
    href: string;
    /** `page` on the page itself, `true` anywhere inside its section. */
    current?: 'page' | 'true';
}

// The current link gets a fill and an underline, so it isn't marked by
// colour alone.
const currentClass =
    'aria-[current]:bg-muted aria-[current]:underline aria-[current]:decoration-2 aria-[current]:underline-offset-4';

export interface NavLinksProps {
    links: NavLinkData[];
}

/** The site's sections in the header (wide screens; phones get the menu). */
export function NavLinks({ links }: NavLinksProps) {
    const t = useTranslations('Nav');
    return (
        <ul className="flex items-center gap-1">
            {links.map((link) => (
                <li key={link.key}>
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className={currentClass}
                    >
                        <Link
                            href={link.href}
                            aria-current={link.current}
                            {...track('nav-link', {
                                to: link.key,
                                from: 'header',
                            })}
                        >
                            {t(link.key)}
                        </Link>
                    </Button>
                </li>
            ))}
        </ul>
    );
}

export interface SignedOutLinksProps {
    /** Marks the link to the page the visitor is on. Both links always show, so the header doesn't shift. */
    current?: 'sign-in' | 'sign-up';
}

/** Header links for visitors on wide screens: Sign in and Create account. */
export function SignedOutLinks({ current }: SignedOutLinksProps) {
    const t = useTranslations('HeaderLinks');
    return (
        <>
            {/* Outlined, like the banner's secondary button: it reads as a
                button without relying on colour. */}
            <Button
                asChild
                variant="outline"
                size="sm"
                className="aria-[current=page]:bg-muted"
            >
                <Link
                    href="/sign-in"
                    aria-current={current === 'sign-in' ? 'page' : undefined}
                    {...track('sign-in', { from: 'header' })}
                >
                    {t('signIn')}
                </Link>
            </Button>
            <Button asChild size="sm">
                <Link
                    href="/sign-up"
                    aria-current={current === 'sign-up' ? 'page' : undefined}
                    {...track('sign-up', { from: 'header' })}
                >
                    {t('createAccount')}
                </Link>
            </Button>
        </>
    );
}

/**
 * Shown while the session is checked, in place of the account area. Wide
 * screens: the size of Sign in and Create account (signed in, the avatar takes
 * less room). Phones: the menu button.
 */
export function HeaderLinksPlaceholder() {
    return (
        <>
            <Skeleton className="hidden h-8 w-16 lg:block" />
            <Skeleton className="hidden h-8 w-28 lg:block" />
            <Skeleton className="size-8 lg:hidden" />
        </>
    );
}
