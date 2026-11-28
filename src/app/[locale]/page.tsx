import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import {
    HeroActions,
    HeroActionsPlaceholder,
} from '@/components/molecules/hero-actions';
import { HomeJoinBand, HomePage } from '@/components/pages/home-page';
import { getSessionUser } from '@/lib/auth/session';
import { startingCitySlug } from '@/lib/organizations/starting-city';
import { findPath } from '@/lib/paths';
import { getSiteUrl } from '@/lib/site';

import { JsonLd } from './json-ld';
import { pageMetadata, SITE_NAME } from './page-metadata';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Metadata');
    return pageMetadata({
        path: '/',
        title: t('homeTitle'),
        description: t('description'),
        absoluteTitle: true,
    });
}

// The page is static; only the buttons depend on the session, so they stream
// in behind <Suspense> (no flash of sign-up buttons for signed-in users).
export default function Page() {
    return (
        <>
            <Suspense fallback={null}>
                <HomeStructuredData />
            </Suspense>
            <HomePage
                heroActions={
                    <Suspense fallback={<HeroActionsPlaceholder />}>
                        <HomeHeroActions />
                    </Suspense>
                }
                join={
                    <Suspense fallback={null}>
                        <HomeJoin />
                    </Suspense>
                }
            />
        </>
    );
}

/** Tells search engines the site's name and what it is (technical/seo.md). */
async function HomeStructuredData() {
    const [locale, t] = await Promise.all([
        getLocale(),
        getTranslations('Metadata'),
    ]);
    const url = getSiteUrl();
    return (
        <JsonLd
            data={{
                '@context': 'https://schema.org',
                '@graph': [
                    {
                        '@type': 'WebSite',
                        '@id': `${url}/#website`,
                        name: SITE_NAME,
                        url: `${url}/${locale}`,
                        inLanguage: locale,
                        description: t('description'),
                        publisher: { '@id': `${url}/#organization` },
                    },
                    {
                        '@type': 'Organization',
                        '@id': `${url}/#organization`,
                        name: SITE_NAME,
                        url,
                        description: t('description'),
                    },
                ],
            }}
        />
    );
}

async function HomeHeroActions() {
    const user = await getSessionUser();
    // Browse goes straight to the visitor's city (their profile's, or the default).
    const city = await startingCitySlug(user?.uid);
    return (
        <HeroActions
            signedIn={!!user}
            findHref={`${findPath('organizations')}/${city}`}
        />
    );
}

async function HomeJoin() {
    const user = await getSessionUser();
    return user ? null : <HomeJoinBand />;
}
