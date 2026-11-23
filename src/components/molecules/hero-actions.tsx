import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
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

/** Holds the buttons' height while the session is checked, so the banner doesn't jump. */
export function HeroActionsPlaceholder() {
    return <div aria-hidden className="h-10" />;
}
