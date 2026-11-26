import 'server-only';

import { geohashForLocation } from 'geofire-common';

import usPlaces from './data/us.json';
import { findPlace, findPlaceBySlug, searchPlaces as search } from './search';
import type { CountryCode, Place, PlaceDataset } from './types';

// Server-side access to the place datasets (~1 MB each). Kept off the client:
// browsers call /api/places instead.

const datasets: Record<CountryCode, PlaceDataset> = {
    // JSON imports widen tuples to arrays; the build script guarantees the shape.
    US: usPlaces as unknown as PlaceDataset,
};

export const searchPlaces = (
    country: CountryCode,
    query: string,
    limit?: number
) => search(datasets[country], query, limit);

export const getPlace = (country: CountryCode, id: string) =>
    findPlace(datasets[country], id);

/** From a readable path's lowercase region and city: ("US", "ca", "oakland"). */
export const getPlaceBySlug = (
    country: CountryCode,
    region: string,
    city: string
) => findPlaceBySlug(datasets[country], region, city);

/** A profile's general area: label, ~1 km coordinates, and a geohash for radius queries. */
export interface GeneralArea {
    placeId: string;
    country: CountryCode;
    label: string;
    lat: number;
    lng: number;
    geohash: string;
}

export const toGeneralArea = (place: Place): GeneralArea => ({
    placeId: place.id,
    country: place.country,
    label: place.label,
    lat: place.lat,
    lng: place.lng,
    geohash: geohashForLocation([place.lat, place.lng]),
});
