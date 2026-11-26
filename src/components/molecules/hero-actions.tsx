import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import { Skeleton } from '@/components/atoms/skeleton';
import { Link } from '@/i18n/navigation';
import { track } from '@/lib/analytics';
import { DEFAULT_PLACE } from '@/lib/organizations/directory';

export interface HeroActionsProps {
    /** Both lead with Browse organizations; the second button is Create account (signed out) or the dashboard (signed in). */
    signedIn: boolean;
}

// Styled to sit on the photo. The secondary button has a visible white
// border, so it reads as a button without relying on colour.
const primary = 'bg-white text-neutral-950 hover:bg-white/90';
const secondary =
    'border-white/80 bg-transparent text-white hover:bg-white/10 hover:text-white dark:border-white/80 dark:bg-transparent';

/** The homepage banner's buttons: browse organizations first, then create an account (or go to the dashboard). */
export function HeroActions({ signedIn }: HeroActionsProps) {
    const t = useTranslations('Home');
    return (
        <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className={primary}>
                {/* Signed in, /find starts from their profile's city. */}
                <Link
                    href={signedIn ? '/find' : `/find/${DEFAULT_PLACE.slug}`}
                    {...track('browse-organizations', { from: 'hero' })}
                >
                    {t('browse')}
                </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className={secondary}>
                {signedIn ? (
                    <Link href="/dashboard">{t('dashboard')}</Link>
                ) : (
                    <Link
                        href="/sign-up"
                        {...track('sign-up', { from: 'hero' })}
                    >
                        {t('cta')}
                    </Link>
                )}
            </Button>
        </div>
    );
}

/**
 * Shown while the session is checked: two button-sized skeletons on the
 * photo, the same size as the buttons, so the banner doesn't jump.
 */
export function HeroActionsPlaceholder() {
    return (
        <div className="flex flex-wrap items-center gap-3" aria-hidden>
            <Skeleton className="h-10 w-52 bg-white/25" />
            <Skeleton className="h-10 w-36 bg-white/15" />
        </div>
    );
}
