import {
    BookOpenIcon,
    CalendarDaysIcon,
    ClipboardListIcon,
    UsersIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import foodServe from '@/assets/food-serve.jpg';
import { Button } from '@/components/atoms/button';
import { CallToAction } from '@/components/organisms/call-to-action';
import { FeatureGrid } from '@/components/organisms/feature-grid';
import { HeroBanner } from '@/components/organisms/hero-banner';
import { Link } from '@/i18n/navigation';

const features = [
    { id: 'organizations', icon: UsersIcon },
    { id: 'requests', icon: ClipboardListIcon },
    { id: 'library', icon: BookOpenIcon },
    { id: 'planning', icon: CalendarDaysIcon },
] as const;

/** The public landing page. Static content only. */
export function HomePage() {
    const t = useTranslations('Home');
    const createAccount = (variant: 'onPhoto' | 'default') => (
        <Button
            asChild
            size="lg"
            className={
                variant === 'onPhoto'
                    ? 'bg-white text-neutral-950 hover:bg-white/90'
                    : undefined
            }
        >
            <Link href="/sign-up">{t('cta')}</Link>
        </Button>
    );

    return (
        <>
            <HeroBanner
                image={foodServe}
                imageAlt={t('banner.imageAlt')}
                title={t('banner.title')}
                subtitle={t('banner.subtitle')}
                action={createAccount('onPhoto')}
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
                action={createAccount('default')}
            />
        </>
    );
}
