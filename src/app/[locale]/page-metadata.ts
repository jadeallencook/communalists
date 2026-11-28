import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import shareImage from '@/assets/share-image.jpg';
import type { Locale } from '@/i18n/routing';
import { keywordList, localizedAlternates, OG_LOCALES } from '@/lib/seo';
import { routing } from '@/i18n/routing';

// Every public page's metadata goes through here, so titles, descriptions,
// language links and the share image stay consistent
// (documentation/technical/seo.md). Next.js replaces a parent's `openGraph`
// and `twitter` objects instead of merging them, so each page sets them in
// full, image included.

export const SITE_NAME = 'Communalists';

/** The link-preview photo (1200×630) with alt text in the page's language. */
export async function shareImages() {
    const t = await getTranslations('Home.banner');
    return [
        {
            url: shareImage.src,
            width: shareImage.width,
            height: shareImage.height,
            alt: t('imageAlt'),
        },
    ];
}

/** Open Graph and Twitter fields every page shares. */
export async function socialDefaults(locale: Locale) {
    const images = await shareImages();
    return {
        openGraph: {
            siteName: SITE_NAME,
            locale: OG_LOCALES[locale],
            alternateLocale: routing.locales
                .filter((l) => l !== locale)
                .map((l) => OG_LOCALES[l]),
            images,
        },
        twitter: { card: 'summary_large_image' as const, images },
    };
}

interface PageMetadataInput {
    /** The page's address without a locale, from src/lib/paths.ts ('/' for home). */
    path: string;
    title: string;
    description: string;
    /** Page-specific keywords; the site's own are added after them. */
    keywords?: readonly string[];
    /** Skip the "| Communalists" suffix (the home page already names it). */
    absoluteTitle?: boolean;
    type?: 'website' | 'article';
}

export async function pageMetadata({
    path,
    title,
    description,
    keywords,
    absoluteTitle,
    type = 'website',
}: PageMetadataInput): Promise<Metadata> {
    const locale = (await getLocale()) as Locale;
    const t = await getTranslations('Metadata');
    const social = await socialDefaults(locale);
    const alternates = localizedAlternates(path, locale);
    return {
        title: absoluteTitle ? { absolute: title } : title,
        description,
        keywords: keywordList(keywords, t('keywords')),
        alternates,
        openGraph: {
            ...social.openGraph,
            type,
            title,
            description,
            url: alternates.canonical,
        },
        twitter: { ...social.twitter, title, description },
    };
}
