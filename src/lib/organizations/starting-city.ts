import 'server-only';

import { getPlace } from '../places';
import { isSupportedCountry, type PlaceOption } from '../places/types';
import { getUserProfile } from '../users';

import { DEFAULT_PLACE } from './directory';

/**
 * The city on someone's profile, or null when they're signed out or have
 * none.
 */
export async function profileCity(uid?: string): Promise<PlaceOption | null> {
    if (!uid) return null;
    const home = (await getUserProfile(uid))?.location;
    if (!home || !isSupportedCountry(home.country)) return null;
    const place = getPlace(home.country, home.placeId);
    return place
        ? { id: place.id, label: place.label, slug: place.slug }
        : null;
}

/**
 * The city the homepage search starts on: the profile's city, or
 * DEFAULT_PLACE (San Francisco) when they're signed out or have none.
 */
export async function startingCity(uid?: string): Promise<PlaceOption> {
    const own = await profileCity(uid);
    if (own) return own;
    const place = getPlace(DEFAULT_PLACE.country, DEFAULT_PLACE.placeId);
    return {
        id: DEFAULT_PLACE.placeId,
        label: place?.label ?? 'San Francisco, California',
        slug: DEFAULT_PLACE.slug,
    };
}

/**
 * Where /find/organizations starts for someone: their profile's city ("us/ca/oakland"), or
 * DEFAULT_PLACE when they're signed out or have no city. Used by plain /find/organizations
 * (which redirects here) and the homepage search. Decision #52.
 */
export async function startingCitySlug(uid?: string): Promise<string> {
    return (await profileCity(uid))?.slug ?? DEFAULT_PLACE.slug;
}
