import type { CountryCode, PlaceOption } from './types';

// Client-side helpers for places. Plain fetch, no React or Next, so a future
// React Native app can reuse them by passing its API origin as baseUrl.

export async function fetchPlaces(
    country: CountryCode,
    query: string,
    signal?: AbortSignal,
    baseUrl = ''
): Promise<PlaceOption[]> {
    const params = new URLSearchParams({ country, q: query });
    const response = await fetch(`${baseUrl}/api/places?${params}`, { signal });
    if (!response.ok)
        throw new Error(`Place search failed: ${response.status}`);
    const body = (await response.json()) as { results: PlaceOption[] };
    return body.results;
}

/** "US" → "United States" / "Estados Unidos" / "Hoa Kỳ" / "美国", from the browser's own data. */
export function countryName(code: CountryCode, locale: string): string {
    try {
        return (
            new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code
        );
    } catch {
        return code;
    }
}
