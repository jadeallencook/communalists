import 'server-only';

import { getPlace } from '../places';
import { isSupportedCountry } from '../places/types';
import { getUserProfile } from '../users';

import { DEFAULT_PLACE } from './directory';

/**
 * Where /find starts for someone: their profile's city ("us/ca/oakland"), or
 * DEFAULT_PLACE when they're signed out or have no city. Used by plain /find
 * (which redirects here) and the homepage's Browse button. Decision #52.
 */
export async function startingCitySlug(uid?: string): Promise<string> {
    if (uid) {
        const home = (await getUserProfile(uid))?.location;
        if (home && isSupportedCountry(home.country)) {
            const place = getPlace(home.country, home.placeId);
            if (place) return place.slug;
        }
    }
    return DEFAULT_PLACE.slug;
}
