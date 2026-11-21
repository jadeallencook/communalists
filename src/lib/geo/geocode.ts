import 'server-only';

import { geohashForLocation } from 'geofire-common';

// Turns a city or ZIP code into a general area for "organizations near you".
// Uses OpenStreetMap's Nominatim (free; max ~1 request/second, identify the
// app in the User-Agent: https://operations.osmfoundation.org/policies/nominatim/).
// Fine for sign-ups; switch to a paid geocoder before anything high-volume,
// such as autocomplete.

export interface GeneralArea {
    label: string; // e.g. "San Jose, California, United States"
    lat: number; // rounded to ~1 km for privacy
    lng: number;
    geohash: string; // for Firestore radius queries (geofire-common)
}

interface NominatimResult {
    lat: string;
    lon: string;
    display_name: string;
    address?: Record<string, string>;
}

/** Round to 2 decimal places (~1.1 km): enough for "near you", never an address. */
export const roundCoordinate = (value: number) => Math.round(value * 100) / 100;

export function areaLabel(result: NominatimResult): string {
    const a = result.address ?? {};
    const parts = [
        a.city ?? a.town ?? a.village ?? a.hamlet ?? a.municipality ?? a.county,
        a.state,
        a.country,
    ].filter(Boolean);
    return parts.length ? parts.join(', ') : result.display_name;
}

async function search(
    query: string,
    locale: string,
    countryCode?: string
): Promise<NominatimResult | undefined> {
    const params = new URLSearchParams({
        q: query,
        format: 'jsonv2',
        limit: '1',
        addressdetails: '1',
    });
    if (countryCode) params.set('countrycodes', countryCode.toLowerCase());
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
            headers: {
                'User-Agent': 'Communalists/1.0 (+https://communalists.com)',
                'Accept-Language': locale,
            },
            signal: AbortSignal.timeout(8000),
        }
    );
    if (!response.ok) throw new Error(`Geocoder responded ${response.status}`);
    const [result] = (await response.json()) as NominatimResult[];
    return result;
}

/**
 * Geocode a city or postal code. Postal codes repeat across countries
 * ("95112" is San Jose, and also a place in Lithuania), so search the
 * visitor's country first when we know it, then worldwide.
 */
export async function geocodeArea(
    query: string,
    locale: string,
    countryCode?: string
): Promise<GeneralArea | null> {
    const result =
        (countryCode && (await search(query, locale, countryCode))) ||
        (await search(query, locale));
    if (!result) return null;

    const lat = roundCoordinate(Number(result.lat));
    const lng = roundCoordinate(Number(result.lon));
    return {
        label: areaLabel(result),
        lat,
        lng,
        geohash: geohashForLocation([lat, lng]),
    };
}
