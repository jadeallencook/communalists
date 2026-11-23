import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import { Skeleton } from '@/components/atoms/skeleton';
import { Link } from '@/i18n/navigation';

export interface HeroActionsProps {
    /** Signed in: one button to the dashboard. Signed out: create account and sign in. */
    signedIn: boolean;
}

const onPhoto = 'bg-white text-neutral-950 hover:bg-white/90';

/** The homepage banner's buttons, styled to sit on the photo. */
export function HeroActions({ signedIn }: HeroActionsProps) {
    const t = useTranslations('Home');

    if (signedIn) {
        return (
            <Button asChild size="lg" className={onPhoto}>
                <Link href="/dashboard">{t('dashboard')}</Link>
            </Button>
        );
    }
    return (
        <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className={onPhoto}>
                <Link href="/sign-up">{t('cta')}</Link>
            </Button>
            <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
            >
                <Link href="/sign-in">{t('signIn')}</Link>
            </Button>
        </div>
    );
}

/**
 * Shown while the session is checked: a button-sized skeleton on the photo, at
 * the buttons' height so the banner doesn't jump. One block, because signed in
 * and signed out both lead with one filled button.
 */
export function HeroActionsPlaceholder() {
    return <Skeleton className="h-10 w-40 bg-white/25" />;
}
