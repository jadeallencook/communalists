import type { MetadataRoute } from 'next';
import { connection } from 'next/server';

import { routing } from '@/i18n/routing';
import { letterOf, localize } from '@/lib/definitions';
import { getDefinitions } from '@/lib/definitions/store';
import { getSitemapOrganizations } from '@/lib/organizations';
import { DEFAULT_FILTERS, directoryHref } from '@/lib/organizations/directory';
import { organizationPath } from '@/lib/paths';
import { getPlace } from '@/lib/places';
import { isSupportedCountry } from '@/lib/places/types';
import { localizedSitemapEntries } from '@/lib/seo';
import { getSiteUrl } from '@/lib/site';

// /sitemap.xml: every public page worth finding, in all four languages
// (documentation/technical/seo.md). City searches are listed only where a
// local group is based, so search engines aren't sent 20,000 empty cities.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Read per request (from the cache), never at build: the build has no
    // database credentials.
    await connection();
    const site = getSiteUrl();
    const [definitions, organizations] = await Promise.all([
        getDefinitions(),
        getSitemapOrganizations(),
    ]);

    const paths = new Map<string, number | undefined>([['/', undefined]]);
    const add = (path: string, lastModified?: number) => {
        const known = paths.get(path);
        if (!paths.has(path) || (lastModified ?? 0) > (known ?? 0))
            paths.set(path, lastModified);
    };

    for (const definition of definitions) {
        add(`/dictionary/${definition.slug}`, definition.updatedAt);
        // A letter's page is listed if it has words in any language.
        for (const locale of routing.locales) {
            const { word } = localize(definition, locale);
            add(`/dictionary/${letterOf(word, locale, definition.slug)}`);
        }
    }

    for (const org of organizations) {
        add(organizationPath(org.handle));
        if (org.reach !== 'local' || !isSupportedCountry(org.country)) continue;
        const place = getPlace(org.country, org.placeId);
        if (place) add(directoryHref(DEFAULT_FILTERS, place.slug));
    }

    add('/sign-up');

    return [...paths].flatMap(([path, lastModified]) =>
        localizedSitemapEntries(site, path, lastModified)
    );
}
