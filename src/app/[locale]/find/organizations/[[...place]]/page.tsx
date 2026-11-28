import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { FindOrganizationsPageLoading } from '@/components/pages/find-organizations-page';
import { redirect } from '@/i18n/navigation';
import { getSessionUser } from '@/lib/auth/session';
import {
    getDirectoryInternational,
    getDirectoryLocal,
    getDirectoryNational,
} from '@/lib/organizations';
import {
    DEFAULT_FILTERS,
    DEFAULT_PLACE,
    directoryHref,
    filterDirectory,
    parseDirectorySearch,
    type DirectorySearch,
} from '@/lib/organizations/directory';
import { getPlace, getPlaceBySlug } from '@/lib/places';
import { startingCitySlug } from '@/lib/organizations/starting-city';
import { isSupportedCountry, type Place } from '@/lib/places/types';
import { findPath } from '@/lib/paths';
import { keywordList } from '@/lib/seo';

import { pageMetadata } from '../../../page-metadata';
import { TrackEvent } from '../../../track-event';
import { FindContainer } from '../find-container';

type Props = PageProps<'/[locale]/find/organizations/[[...place]]'>;

/**
 * The city in the URL: /find/organizations/us/ca/oakland (decision #49). Anything that
 * isn't that exact path is sent to it: plain /find/organizations (to the visitor's
 * starting city, decision #52), older ?country=&placeId= links, the filter
 * form without JavaScript, other casing, and partial paths (/find/organizations/us). An
 * unknown city is a 404.
 */
type CityInUrl =
    | { kind: 'city'; place: Place }
    | { kind: 'redirect'; href: string }
    | { kind: 'notFound' };

function cityInUrl(
    segments: string[] | undefined,
    search: DirectorySearch,
    /** For plain /find/organizations: the visitor's starting city (startingCitySlug). */
    startingSlug: string
): CityInUrl {
    if (!segments?.length) {
        if (!search.placeId)
            return {
                kind: 'redirect',
                href: directoryHref(search, startingSlug),
            };
        const place = getPlace(search.country, search.placeId);
        return { kind: 'redirect', href: directoryHref(search, place?.slug) };
    }
    if (segments.length !== 3)
        return { kind: 'redirect', href: directoryHref(search, startingSlug) };
    const [country, region, city] = segments.map((part) =>
        decodeURIComponent(part).toLowerCase()
    );
    const code = country.toUpperCase();
    if (!isSupportedCountry(code)) return { kind: 'notFound' };
    const place = getPlaceBySlug(code, region, city);
    if (!place) return { kind: 'notFound' };
    if (segments.join('/') !== place.slug)
        return { kind: 'redirect', href: directoryHref(search, place.slug) };
    return { kind: 'city', place };
}

// A search link names its city, e.g. "Mutual aid organizations near Oakland,
// California". Plain /find/organizations redirects, so it never gets this far.
export async function generateMetadata({
    params,
    searchParams,
}: Props): Promise<Metadata> {
    const t = await getTranslations('Find');
    const city = cityInUrl(
        (await params).place,
        parseDirectorySearch(await searchParams),
        DEFAULT_PLACE.slug
    );
    const place = city.kind === 'city' ? city.place : null;
    if (!place)
        return pageMetadata({
            path: findPath('organizations'),
            title: t('metaTitle'),
            description: t('intro'),
        });
    // `name` is the city alone, for keywords: a label's comma would split one.
    const names = { city: place.label, name: place.name };
    // Canonical is the city's path alone: filters in the query are the same
    // page to a search engine, so they don't compete with it.
    return pageMetadata({
        path: directoryHref(DEFAULT_FILTERS, place.slug),
        title: t('metaTitleNear', names),
        description: t('metaDescriptionNear', names),
        keywords: keywordList(t('metaKeywordsNear', names)),
    });
}

// Public. The search lives in the URL (shareable): the city in the path,
// filters in the query. Plain /find/organizations redirects to the visitor's starting city:
// their profile's, or DEFAULT_PLACE (decision #52). Reads the URL and the
// session, so it streams behind <Suspense>. Design: features/16 →
// "Finding organizations".
export default function Page({ params, searchParams }: Props) {
    return (
        <Suspense fallback={<FindOrganizationsPageLoading />}>
            <FindServerContainer params={params} searchParams={searchParams} />
        </Suspense>
    );
}

async function FindServerContainer({
    params,
    searchParams,
}: Pick<Props, 'params' | 'searchParams'>) {
    const [{ place: segments }, query, user] = await Promise.all([
        params,
        searchParams,
        getSessionUser(),
    ]);
    const search = parseDirectorySearch(query);
    const city = cityInUrl(
        segments,
        search,
        segments?.length || search.placeId
            ? DEFAULT_PLACE.slug
            : await startingCitySlug(user?.uid)
    );
    if (city.kind === 'notFound') notFound();
    if (city.kind === 'redirect')
        return redirect({ href: city.href, locale: await getLocale() });

    const place = city.place;
    search.country = place.country;
    search.placeId = place.id;

    const [local, national, international] = await Promise.all([
        search.reach.includes('local')
            ? getDirectoryLocal({
                  placeId: place.id,
                  lat: place.lat,
                  lng: place.lng,
              })
            : [],
        search.reach.includes('national')
            ? getDirectoryNational(place.country)
            : [],
        search.reach.includes('international')
            ? getDirectoryInternational()
            : [],
    ]);
    const results = filterDirectory(
        [...local, ...national, ...international],
        place,
        search
    );

    return (
        <>
            <TrackEvent
                event="find-search"
                data={{
                    city: place.slug,
                    radius: String(search.radiusMiles),
                    focusAreas: search.focusAreas.join(','),
                    languages: search.languages.join(','),
                    reach: search.reach.join(','),
                }}
            />
            <FindContainer
                search={search}
                place={{ id: place.id, label: place.label, slug: place.slug }}
                results={results}
                canCreate={!!user}
            />
        </>
    );
}
