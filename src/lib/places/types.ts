// Shared by the server (search, validation) and UIs (web now, maybe React
// Native later). No React or Next imports.

/** Countries with a place list. Add one by generating its data file (scripts/build-places.mjs). */
export const SUPPORTED_COUNTRIES = ['US'] as const;
export type CountryCode = (typeof SUPPORTED_COUNTRIES)[number];

export const isSupportedCountry = (value: unknown): value is CountryCode =>
    typeof value === 'string' &&
    (SUPPORTED_COUNTRIES as readonly string[]).includes(value);

/** What a picker shows and submits. */
export interface PlaceOption {
    id: string; // GeoNames id
    label: string; // "San Jose, California"
    /** Readable path, "us/ca/san-jose" (slug.ts): /find/organizations/us/ca/san-jose. */
    slug?: string;
}

/** A place with coordinates (~1 km precision), as stored on a profile. */
export interface Place extends PlaceOption {
    slug: string;
    country: CountryCode;
    name: string;
    region: string;
    lat: number;
    lng: number;
}

/** Shape of src/lib/places/data/<country>.json. */
export interface PlaceDataset {
    source: string;
    country: string;
    regions: Record<string, string>;
    /** [geonameId, name, regionCode, lat, lng, population], most populous first. */
    places: [number, string, string, number, number, number][];
}
