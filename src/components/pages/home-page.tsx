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
import { Definition } from '@/components/molecules/definition';
import { HeroActions } from '@/components/molecules/hero-actions';
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

export interface HomePageProps {
    /** The banner's buttons. The app streams in <HeroActions> for the visitor's session. */
    heroActions?: ReactNode;
    /** The closing "Ready to organize?" band; the app leaves it out for signed-in users. */
    join?: ReactNode;
}

/** The public landing page. Static, except the session-dependent slots. */
export function HomePage({
    heroActions = <HeroActions signedIn={false} />,
    join = <HomeJoinBand />,
}: HomePageProps) {
    const t = useTranslations('Home');
    // Words marked in the copy (first use on the page only). Each language
    // tags its own words in messages/*.json.
    const words = {
        network: (text: ReactNode) => (
            <Definition slug="mutual-aid-network">{text}</Definition>
        ),
        mutualAid: (text: ReactNode) => (
            <Definition slug="mutual-aid">{text}</Definition>
        ),
        toolLibrary: (text: ReactNode) => (
            <Definition slug="tool-library">{text}</Definition>
        ),
        org: (text: ReactNode) => (
            <Definition slug="organization">{text}</Definition>
        ),
    };

    return (
        <>
            <HeroBanner
                image={foodServe}
                imageAlt={t('banner.imageAlt')}
                title={t('banner.title')}
                subtitle={t.rich('banner.subtitle', words)}
                action={heroActions}
            />
            <FeatureGrid
                title={t('about.title')}
                intro={t.rich('about.body', words)}
                note={t('about.languages')}
                features={features.map(({ id, icon }) => ({
                    id,
                    icon,
                    title: t(`features.${id}.title`),
                    description: t(`features.${id}.body`),
                }))}
                footnote={t('earlyDays')}
            />
            {join}
        </>
    );
}

/** "Ready to organize?" with a Create account button. For signed-out visitors. */
export function HomeJoinBand() {
    const t = useTranslations('Home');
    return (
        <CallToAction
            title={t('join.title')}
            description={t('join.body')}
            action={
                <Button asChild size="lg">
                    <Link href="/sign-up">{t('cta')}</Link>
                </Button>
            }
        />
    );
}
