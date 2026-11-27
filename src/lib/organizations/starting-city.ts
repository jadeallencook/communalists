import 'server-only';

import { getPlace } from '../places';
import { isSupportedCountry, type PlaceOption } from '../places/types';
import { getUserProfile } from '../users';

import { DEFAULT_PLACE } from './directory';

/**
 * The city on someone's profile, or null when they're signed out or have
 * none. The homepage search fills its city box with it.
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
 * Where /find starts for someone: their profile's city ("us/ca/oakland"), or
 * DEFAULT_PLACE when they're signed out or have no city. Used by plain /find
 * (which redirects here) and the homepage search. Decision #52.
 */
export async function startingCitySlug(uid?: string): Promise<string> {
    return (await profileCity(uid))?.slug ?? DEFAULT_PLACE.slug;
}
