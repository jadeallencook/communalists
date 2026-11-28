import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { HeroSearchPlaceholder } from '@/components/organisms/hero-search';
import { HomeJoinBand, HomePage } from '@/components/pages/home-page';
import { getSessionUser } from '@/lib/auth/session';
import { startingCity } from '@/lib/organizations/starting-city';
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

import { HomeSearchContainer } from './home-search-container';

// The page is static; only the banner's search (which starts on the
// profile's city, or San Francisco) and the sign-up band depend on the session, so they
// stream in behind <Suspense>.
export default function Page() {
    return (
        <>
            <Suspense fallback={null}>
                <HomeStructuredData />
            </Suspense>
            <HomePage
                heroSearch={
                    <Suspense fallback={<HeroSearchPlaceholder />}>
                        <HomeHeroSearch />
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

async function HomeHeroSearch() {
    const user = await getSessionUser();
    return <HomeSearchContainer startingCity={await startingCity(user?.uid)} />;
}

async function HomeJoin() {
    const user = await getSessionUser();
    return user ? null : <HomeJoinBand />;
}
