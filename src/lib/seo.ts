// Search and link-preview helpers (design: documentation/technical/seo.md).
// Pure, with no React or Next imports, so the sitemap, page metadata and
// tests share one set of rules.

import { routing, type Locale } from '@/i18n/routing';

/** Open Graph wants language_TERRITORY. Our audience is in the US. */
export const OG_LOCALES: Record<Locale, string> = {
    en: 'en_US',
    es: 'es_US',
    vi: 'vi_VN',
    zh: 'zh_CN',
};

/** Search snippets cut off near 160 characters. */
export const DESCRIPTION_MAX = 160;

/** `/` is the home page; every other path starts with a slash and has no locale. */
const withLocale = (locale: string, path: string) =>
    path === '/' ? `/${locale}` : `/${locale}${path}`;

/**
 * A page's canonical URL and its other languages (hreflang). `x-default` is
 * the address with no locale, which the proxy sends to the visitor's own
 * language. Relative URLs; metadataBase or the caller makes them absolute.
 */
export function localizedAlternates(path: string, locale: Locale) {
    const languages: Record<string, string> = {};
    for (const other of routing.locales)
        languages[other] = withLocale(other, path);
    languages['x-default'] = path;
    return { canonical: withLocale(locale, path), languages };
}

/**
 * Text cut to fit a search snippet: whitespace collapsed, cut at a word
 * boundary with an ellipsis. Text with no spaces (Chinese) is cut by length.
 */
export function snippet(text: string, max = DESCRIPTION_MAX): string {
    const flat = text.replace(/\s+/g, ' ').trim();
    if (flat.length <= max) return flat;
    const cut = flat.slice(0, max - 1);
    const space = cut.lastIndexOf(' ');
    const base = space > max * 0.6 ? cut.slice(0, space) : cut;
    return `${base.replace(/[\s,;:.–—-]+$/, '')}…`;
}

/** Unique, non-empty keywords in order. */
export function keywordList(
    ...groups: (string | readonly string[] | undefined | null)[]
): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const group of groups) {
        const items =
            typeof group === 'string' ? group.split(',') : (group ?? []);
        for (const raw of items) {
            const word = raw.trim();
            const key = word.toLowerCase();
            if (!word || seen.has(key)) continue;
            seen.add(key);
            out.push(word);
        }
    }
    return out;
}

/**
 * JSON-LD for a <script type="application/ld+json">. `<` is escaped so text
 * written by users (an organization's description) can't close the tag.
 */
export const jsonLdString = (data: object) =>
    JSON.stringify(data).replace(/</g, '\\u003c');

/** One sitemap address in every language, each listing the others. */
export interface LocalizedSitemapEntry {
    url: string;
    lastModified?: Date;
    alternates: { languages: Record<string, string> };
}

export function localizedSitemapEntries(
    siteUrl: string,
    path: string,
    lastModified?: number
): LocalizedSitemapEntry[] {
    const { languages } = localizedAlternates(path, routing.defaultLocale);
    const absolute = Object.fromEntries(
        Object.entries(languages).map(([lang, href]) => [
            lang,
            `${siteUrl}${href}`,
        ])
    );
    return routing.locales.map((locale) => ({
        url: absolute[locale],
        ...(lastModified ? { lastModified: new Date(lastModified) } : {}),
        alternates: { languages: absolute },
    }));
}
