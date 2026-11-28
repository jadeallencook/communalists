import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import type { Locale } from '@/i18n/routing';
import { getSessionUser } from '@/lib/auth/session';
import type { GraphicCopy } from '@/lib/graphics';
import { getMemberships } from '@/lib/organizations';
import { GRAPHICS_PATH } from '@/lib/paths';
import { keywordList } from '@/lib/seo';
import { getSiteUrl } from '@/lib/site';

import en from '../../../../messages/en.json';
import es from '../../../../messages/es.json';
import vi from '../../../../messages/vi.json';
import zh from '../../../../messages/zh.json';
import { JsonLd } from '../json-ld';
import { pageMetadata } from '../page-metadata';
import { FillContainer, GraphicsContainer } from './graphics-container';

// /graphics: "Make some propaganda" (features/23, decision #75). Public and
// static; nothing is saved. Only "Fill in from your organization" depends on
// the session, so it streams in behind <Suspense>.

// A graphic can be in any of the four languages, whatever the page's is.
const COPIES = {
    en: en.Graphics.copy,
    es: es.Graphics.copy,
    vi: vi.Graphics.copy,
    zh: zh.Graphics.copy,
} satisfies Record<Locale, GraphicCopy>;

export async function generateMetadata(): Promise<Metadata> {
    const [locale, t] = await Promise.all([
        getLocale(),
        getTranslations('Graphics'),
    ]);
    return pageMetadata({
        path: GRAPHICS_PATH,
        title: t('metaTitle'),
        description: t('metaDescription'),
        keywords: keywordList(t('metaKeywords')),
        // Three sample flyers in the page's language, not the site's photo.
        image: {
            url: `/api/share-cards/graphics/${locale}`,
            alt: t('shareImageAlt'),
        },
    });
}

export default function Page() {
    return (
        <>
            <Suspense fallback={null}>
                <GraphicsStructuredData />
            </Suspense>
            <GraphicsContainer
                copies={COPIES}
                fillSlot={
                    <Suspense fallback={null}>
                        <FillSlot />
                    </Suspense>
                }
            />
        </>
    );
}

/** Tells search engines this is a free tool that runs in the browser (technical/seo.md). */
async function GraphicsStructuredData() {
    const [locale, t] = await Promise.all([
        getLocale(),
        getTranslations('Graphics'),
    ]);
    const site = getSiteUrl();
    return (
        <JsonLd
            data={{
                '@context': 'https://schema.org',
                '@type': 'WebApplication',
                name: t('metaTitle'),
                alternateName: t('title'),
                description: t('metaDescription'),
                url: `${site}/${locale}${GRAPHICS_PATH}`,
                inLanguage: locale,
                applicationCategory: 'DesignApplication',
                operatingSystem: 'Any',
                browserRequirements: 'Requires JavaScript',
                isAccessibleForFree: true,
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                image: `${site}/api/share-cards/graphics/${locale}`,
                publisher: { '@id': `${site}/#organization` },
            }}
        />
    );
}

async function FillSlot() {
    const user = await getSessionUser();
    if (!user)
        return (
            <FillContainer
                signInHref={`/sign-in?next=${encodeURIComponent(GRAPHICS_PATH)}`}
            />
        );
    // A shortcut: if it can't load, the page works without it (decision #68).
    const memberships = await getMemberships(user.uid).catch((error: Error) => {
        console.error('[graphics] memberships read failed', error.message);
        return [];
    });
    const organizations = memberships
        .filter((m) => m.status === 'active')
        .map(({ org }) => ({ handle: org.handle, name: org.name }));
    return <FillContainer organizations={organizations} />;
}
