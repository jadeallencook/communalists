import {
    BookOpenIcon,
    CalendarDaysIcon,
    ClipboardListIcon,
    UsersIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import foodServe from '@/assets/food-serve.jpg';
import { Button } from '@/components/atoms/button';
import { CallToAction } from '@/components/organisms/call-to-action';
import { FeatureGrid } from '@/components/organisms/feature-grid';
import { HeroBanner } from '@/components/organisms/hero-banner';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const features = [
    { id: 'organizations', icon: UsersIcon },
    { id: 'requests', icon: ClipboardListIcon },
    { id: 'library', icon: BookOpenIcon },
    { id: 'planning', icon: CalendarDaysIcon },
] as const;

export interface HomePageProps {
    /**
     * Signed-in visitors get a "Go to dashboard" button instead of the sign-up
     * and sign-in buttons. Leave undefined while the session is still being
     * checked: the buttons keep their space but stay hidden, so a signed-in
     * visitor never sees the sign-up buttons flash.
     */
    signedIn?: boolean;
}

/** The public landing page. */
export function HomePage({ signedIn }: HomePageProps) {
    const t = useTranslations('Home');
    const pending = signedIn === undefined;
    const primary = (variant: 'onPhoto' | 'default') => (
        <Button
            asChild
            size="lg"
            className={
                variant === 'onPhoto'
                    ? 'bg-white text-neutral-950 hover:bg-white/90'
                    : undefined
            }
        >
            {signedIn ? (
                <Link href="/welcome">{t('dashboard')}</Link>
            ) : (
                <Link href="/sign-up">{t('cta')}</Link>
            )}
        </Button>
    );
    const actions = (children: ReactNode) => (
        <div
            className={cn(
                'flex flex-wrap items-center gap-3',
                pending && 'invisible'
            )}
            aria-hidden={pending || undefined}
            inert={pending || undefined}
        >
            {children}
        </div>
    );

    return (
        <>
            <HeroBanner
                image={foodServe}
                imageAlt={t('banner.imageAlt')}
                title={t('banner.title')}
                subtitle={t('banner.subtitle')}
                action={actions(
                    <>
                        {primary('onPhoto')}
                        {!signedIn && (
                            <Button
                                asChild
                                size="lg"
                                variant="ghost"
                                className="text-white hover:bg-white/10 hover:text-white"
                            >
                                <Link href="/sign-in">{t('signIn')}</Link>
                            </Button>
                        )}
                    </>
                )}
            />
            <FeatureGrid
                title={t('about.title')}
                intro={t('about.body')}
                note={t('about.languages')}
                features={features.map(({ id, icon }) => ({
                    id,
                    icon,
                    title: t(`features.${id}.title`),
                    description: t(`features.${id}.body`),
                }))}
                footnote={t('earlyDays')}
            />
            <CallToAction
                title={t('join.title')}
                description={t('join.body')}
                action={actions(primary('default'))}
            />
        </>
    );
}
