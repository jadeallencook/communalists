// Finding organizations: what the /find filters mean, read from the URL, and
// how a list of listed organizations is narrowed and sorted for one visitor.
// Pure: no React, Next or Firebase, so it's tested directly and a future
// mobile app can reuse it. Reads live in ./index.ts (getDirectory*).
// Design: documentation/features/16-organizations.md → "Finding organizations".

import { distanceBetween } from 'geofire-common';

import { isSupportedCountry, type CountryCode } from '../places/types';

import {
    OFFERED_FOCUS_AREAS,
    ORG_LANGUAGES,
    RADIUS_MILES,
    REACH_SCOPES,
    type FocusArea,
    type JoinPolicy,
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
    languages: OrgLanguage[];
    joinPolicy: JoinPolicy;
    memberCount: number;
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
/**
 * Where /find starts for visitors who aren't signed in and haven't chosen a
 * city: San Francisco (GeoNames 5391959). The page says it's a starting
 * point, so nobody mistakes it for "nothing near you".
 */
export const DEFAULT_PLACE = { country: 'US', placeId: '5391959' } as const;
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
 * The search in a /find URL. Lenient: unknown or malformed values are dropped
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

/** The same search as URL parameters, leaving out defaults so links stay short. */
export function directorySearchParams(search: DirectorySearch) {
    const params = new URLSearchParams();
    if (search.placeId) {
        params.set('country', search.country);
        params.set('placeId', search.placeId);
    }
    if (search.radiusMiles !== DEFAULT_RADIUS_MILES)
        params.set('radius', String(search.radiusMiles));
    for (const area of search.focusAreas) params.append('focusAreas', area);
    for (const language of search.languages)
        params.append('languages', language);
    if (search.reach.length < REACH_SCOPES.length)
        for (const scope of search.reach) params.append('reach', scope);
    return params;
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
