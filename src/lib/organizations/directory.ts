// Finding organizations: what the /find/organizations filters mean, read from the URL, and
// how a list of listed organizations is narrowed and sorted for one visitor.
// Pure: no React, Next or Firebase, so it's tested directly and a future
// mobile app can reuse it. Reads live in ./index.ts (getDirectory*).
// Design: documentation/features/16-organizations.md → "Finding organizations".

import { distanceBetween } from 'geofire-common';

import { findPath } from '../paths';
import { isSupportedCountry, type CountryCode } from '../places/types';
import type { SocialLink } from '../socials';

import {
    OFFERED_FOCUS_AREAS,
    ORG_LANGUAGES,
    RADIUS_MILES,
    REACH_SCOPES,
    type FocusArea,
    type OrgLanguage,
    type RadiusMiles,
    type ReachScope,
} from './options';

/** The fields a directory listing needs: public, and small enough to cache in bulk. */
export interface DirectoryOrganization {
    id: string;
    name: string;
    handle: string;
    focusAreas: FocusArea[];
    description: string;
    location: { label: string; country: CountryCode; lat: number; lng: number };
    reach: ReachScope;
    /** How far a local group reaches. Missing on entries cached before 2026-11-26. */
    radiusMiles?: number;
    foundedYear?: number;
    languages: OrgLanguage[];
    memberCount: number;
    /** Public links, shown when a result is expanded. */
    website?: string;
    socials: SocialLink[];
    /** Added by a super user and not claimed yet. */
    unclaimed?: boolean;
}

export interface DirectoryFilters {
    /** Local groups based this far from the visitor's city. */
    radiusMiles: RadiusMiles;
    /** Any of these; empty means all. */
    focusAreas: FocusArea[];
    /** Any of these; empty means all. */
    languages: OrgLanguage[];
    /** Which kinds of groups to show; never empty (none chosen means all). */
    reach: ReachScope[];
}

export interface DirectorySearch extends DirectoryFilters {
    /** The visitor's city, if chosen. */
    country: CountryCode;
    placeId?: string;
}

export const DEFAULT_RADIUS_MILES: RadiusMiles = 25;
/** No filters: the default distance and every kind of group. */
export const DEFAULT_FILTERS: DirectoryFilters = {
    radiusMiles: DEFAULT_RADIUS_MILES,
    focusAreas: [],
    languages: [],
    reach: [...REACH_SCOPES],
};
/**
 * Where /find/organizations starts for visitors who are signed out or have no city on
 * their profile: San Francisco (GeoNames 5391959). Plain /find/organizations redirects to
 * its path, and so does the homepage search when no city is chosen. Change it here only
 * (a test checks the slug matches the place). Decision #52.
 */
export const DEFAULT_PLACE = {
    country: 'US',
    placeId: '5391959',
    slug: 'us/ca/san-francisco',
} as const;
/** Local candidates are read once out to this distance, then narrowed by the radius filter. */
export const MAX_RADIUS_MILES: RadiusMiles = 100;
const KM_PER_MILE = 1.609344;

type Params = Record<string, string | string[] | undefined>;
const all = (value: string | string[] | undefined) =>
    value === undefined ? [] : Array.isArray(value) ? value : [value];
const first = (value: string | string[] | undefined) => all(value)[0];
const known = <T extends string>(values: readonly T[], input: string[]) =>
    values.filter((value) => input.includes(value));

/**
 * The search in a /find/organizations URL's parameters. The city is normally in the path
 * (/find/organizations/us/ca/oakland); `country` and `placeId` are read for older links
 * and the filter form without JavaScript, which the page redirects to the
 * path. Lenient: unknown or malformed values are dropped
 * (it's a URL anyone can edit), never an error.
 */
export function parseDirectorySearch(params: Params): DirectorySearch {
    const country = first(params.country);
    const placeId = first(params.placeId);
    const radius = Number(first(params.radius));
    const reach = known(REACH_SCOPES, all(params.reach));
    return {
        country: isSupportedCountry(country) ? country : 'US',
        placeId: placeId && /^\d{1,12}$/.test(placeId) ? placeId : undefined,
        radiusMiles: (RADIUS_MILES as readonly number[]).includes(radius)
            ? (radius as RadiusMiles)
            : DEFAULT_RADIUS_MILES,
        focusAreas: known(OFFERED_FOCUS_AREAS, all(params.focusAreas)),
        languages: known(ORG_LANGUAGES, all(params.languages)),
        reach: reach.length > 0 ? reach : [...REACH_SCOPES],
    };
}

/**
 * The filters as URL parameters, leaving out defaults so links stay short.
 * The city isn't one: it's in the path (directoryHref).
 */
export function directoryFilterParams(filters: DirectoryFilters) {
    const params = new URLSearchParams();
    if (filters.radiusMiles !== DEFAULT_RADIUS_MILES)
        params.set('radius', String(filters.radiusMiles));
    for (const area of filters.focusAreas) params.append('focusAreas', area);
    for (const language of filters.languages)
        params.append('languages', language);
    if (filters.reach.length < REACH_SCOPES.length)
        for (const scope of filters.reach) params.append('reach', scope);
    return params;
}

/**
 * A /find/organizations link: the city as a readable path ("us/ca/oakland", from
 * places/slug.ts), then the filters, e.g. /find/organizations/us/ca/oakland?radius=10.
 * No city: plain /find/organizations (the visitor's own city or the default one).
 * Decision #49.
 */
export function directoryHref(
    filters: DirectoryFilters,
    placeSlug?: string
): string {
    const start = findPath('organizations');
    const path = placeSlug ? `${start}/${placeSlug}` : start;
    const query = directoryFilterParams(filters).toString();
    return query ? `${path}?${query}` : path;
}

/**
 * The homepage search's link: /find/organizations from the chosen city, or from
 * `startingSlug` (the profile's city or DEFAULT_PLACE) when none is chosen,
 * with the chosen focus area as a filter. Only a listed focus area counts.
 * A city without a known path uses ?country=&placeId=, which
 * /find/organizations redirects to the path.
 */
export function homeSearchHref({
    focusArea,
    place,
    startingSlug,
}: {
    focusArea?: string | null;
    place?: { country: CountryCode; id: string; slug?: string } | null;
    startingSlug: string;
}): string {
    const filters: DirectoryFilters = {
        ...DEFAULT_FILTERS,
        focusAreas: (OFFERED_FOCUS_AREAS as readonly string[]).includes(
            focusArea ?? ''
        )
            ? [focusArea as FocusArea]
            : [],
    };
    if (!place) return directoryHref(filters, startingSlug);
    if (place.slug) return directoryHref(filters, place.slug);
    const query = new URLSearchParams({
        country: place.country,
        placeId: place.id,
    });
    for (const [key, value] of directoryFilterParams(filters))
        query.append(key, value);
    return `${findPath('organizations')}?${query}`;
}

/**
 * How many filters narrow the search, beyond the city: a non-default
 * distance, fewer than all kinds of groups, and each focus area and language.
 * Shown on the mobile "Filters" button.
 */
export function activeFilterCount(search: DirectoryFilters): number {
    return (
        (search.radiusMiles !== DEFAULT_RADIUS_MILES ? 1 : 0) +
        (search.reach.length < REACH_SCOPES.length ? 1 : 0) +
        search.focusAreas.length +
        search.languages.length
    );
}

export interface DirectoryResult {
    org: DirectoryOrganization;
    /** From the visitor's city to the group's, rounded to whole miles. */
    distanceMiles: number;
}

export interface DirectoryResults {
    local: DirectoryResult[];
    national: DirectoryResult[];
    international: DirectoryResult[];
}

export const distanceMiles = (
    from: { lat: number; lng: number },
    to: { lat: number; lng: number }
) => distanceBetween([from.lat, from.lng], [to.lat, to.lng]) / KM_PER_MILE;

/**
 * Narrows candidate organizations for a visitor at `origin`:
 * - local groups based within the radius (distance only: a group's own
 *   service radius isn't checked, decided 2026-11-23), closest first;
 * - nationwide groups in the visitor's country, and international groups,
 *   biggest first.
 * Focus areas and languages match if the group has any of the chosen ones.
 */
export function filterDirectory(
    candidates: DirectoryOrganization[],
    origin: { country: CountryCode; lat: number; lng: number },
    filters: DirectoryFilters
): DirectoryResults {
    const results: DirectoryResults = {
        local: [],
        national: [],
        international: [],
    };
    const seen = new Set<string>();
    for (const org of candidates) {
        if (seen.has(org.id)) continue;
        seen.add(org.id);
        if (!filters.reach.includes(org.reach)) continue;
        if (
            filters.focusAreas.length > 0 &&
            !org.focusAreas.some((area) => filters.focusAreas.includes(area))
        )
            continue;
        if (
            filters.languages.length > 0 &&
            !org.languages.some((language) =>
                filters.languages.includes(language)
            )
        )
            continue;
        const distance = distanceMiles(origin, org.location);
        if (org.reach === 'local' && distance > filters.radiusMiles) continue;
        if (org.reach === 'national' && org.location.country !== origin.country)
            continue;
        results[org.reach].push({ org, distanceMiles: Math.round(distance) });
    }
    const byDistance = (a: DirectoryResult, b: DirectoryResult) =>
        a.distanceMiles - b.distanceMiles ||
        a.org.name.localeCompare(b.org.name);
    const bySize = (a: DirectoryResult, b: DirectoryResult) =>
        b.org.memberCount - a.org.memberCount ||
        a.org.name.localeCompare(b.org.name);
    results.local.sort(byDistance);
    results.national.sort(bySize);
    results.international.sort(bySize);
    return results;
}

/** How far "nearby organizations" on an organization's page looks, and how many it shows. */
export const NEARBY_RADIUS_MILES: RadiusMiles = 50;
export const NEARBY_LIMIT = 4;

/**
 * Other local organizations within NEARBY_RADIUS_MILES of an organization's
 * city, closest first, at most NEARBY_LIMIT. Leaves out the organization
 * itself. Candidates are already listed and active (getDirectoryLocal).
 */
export function nearbyOrganizations(
    candidates: DirectoryOrganization[],
    origin: { id: string; country: CountryCode; lat: number; lng: number }
): DirectoryResult[] {
    return filterDirectory(
        candidates.filter((org) => org.id !== origin.id),
        origin,
        {
            radiusMiles: NEARBY_RADIUS_MILES,
            focusAreas: [],
            languages: [],
            reach: ['local'],
        }
    ).local.slice(0, NEARBY_LIMIT);
}
