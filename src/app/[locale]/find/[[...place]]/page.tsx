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
    DEFAULT_PLACE,
    directoryHref,
    filterDirectory,
    parseDirectorySearch,
    type DirectorySearch,
} from '@/lib/organizations/directory';
import { getPlace, getPlaceBySlug } from '@/lib/places';
import { isSupportedCountry, type Place } from '@/lib/places/types';
import { getUserProfile } from '@/lib/users';

import { TrackEvent } from '../../track-event';
import { FindContainer } from '../find-container';

type Props = PageProps<'/[locale]/find/[[...place]]'>;

/**
 * The city in the URL: /find/us/ca/oakland (decision #49). Anything that
 * isn't that exact path is sent to it: older ?country=&placeId= links, the
 * filter form without JavaScript, other casing, and partial paths (/find/us).
 * An unknown city is a 404.
 */
type CityInUrl =
    | { kind: 'none' }
    | { kind: 'city'; place: Place }
    | { kind: 'redirect'; href: string }
    | { kind: 'notFound' };

function cityInUrl(
    segments: string[] | undefined,
    search: DirectorySearch
): CityInUrl {
    if (!segments?.length) {
        if (!search.placeId) return { kind: 'none' };
        const place = getPlace(search.country, search.placeId);
        return { kind: 'redirect', href: directoryHref(search, place?.slug) };
    }
    if (segments.length !== 3)
        return { kind: 'redirect', href: directoryHref(search) };
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

// A shared search link names its city, e.g. "Mutual aid organizations near
// Oakland, California". Only a city in the URL counts: the profile's city is
// private, and the default one is just a starting point.
export async function generateMetadata({
    params,
    searchParams,
}: Props): Promise<Metadata> {
    const t = await getTranslations('Find');
    const city = cityInUrl(
        (await params).place,
        parseDirectorySearch(await searchParams)
    );
    const place = city.kind === 'city' ? city.place : null;
    const title = place
        ? t('metaTitleNear', { city: place.label })
        : t('metaTitle');
    const description = place
        ? t('metaDescriptionNear', { city: place.label })
        : t('intro');
    return { title, description, openGraph: { title, description } };
}

// Public. The search lives in the URL (shareable): the city in the path,
// filters in the query. With no city in the URL, signed-in visitors search
// from their profile's city and everyone else from DEFAULT_PLACE
// (Oakland), which the page labels as a starting point. Reads the URL and
// the session, so it streams behind <Suspense>. Design: features/16 →
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
    const city = cityInUrl(segments, search);
    if (city.kind === 'notFound') notFound();
    if (city.kind === 'redirect')
        return redirect({ href: city.href, locale: await getLocale() });

    let place: Place | null = city.kind === 'city' ? city.place : null;
    // No city in the URL: the profile's city, or else the default one.
    if (!place && user) {
        const home = (await getUserProfile(user.uid))?.location;
        if (home) place = getPlace(home.country, home.placeId);
    }
    const usingDefault = !place;
    place ??= getPlace(DEFAULT_PLACE.country, DEFAULT_PLACE.placeId);
    if (place) {
        search.country = place.country;
        search.placeId = place.id;
    }

    let results = null;
    if (place) {
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
        results = filterDirectory(
            [...local, ...national, ...international],
            place,
            search
        );
    }

    return (
        <>
            {/* A profile's city is private: reported as "profile", never by name. */}
            <TrackEvent
                event="find-search"
                data={{
                    city:
                        city.kind === 'city'
                            ? city.place.slug
                            : usingDefault
                              ? 'default'
                              : 'profile',
                    radius: String(search.radiusMiles),
                    focusAreas: search.focusAreas.join(','),
                    languages: search.languages.join(','),
                    reach: search.reach.join(','),
                }}
            />
            <FindContainer
                search={search}
                place={
                    place
                        ? { id: place.id, label: place.label, slug: place.slug }
                        : null
                }
                results={results}
                canCreate={!!user}
                defaultCity={usingDefault && !!place}
            />
        </>
    );
}
