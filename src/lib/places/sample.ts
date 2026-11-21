import { searchPlaces } from './search';
import type { CountryCode, PlaceDataset, PlaceOption } from './types';

// A tiny slice of the US dataset for Storybook and tests. Not used by the app.

export const samplePlaces: PlaceDataset = {
    source: 'sample',
    country: 'US',
    regions: {
        AZ: 'Arizona',
        CA: 'California',
        IL: 'Illinois',
        MO: 'Missouri',
        NM: 'New Mexico',
    },
    places: [
        [5391959, 'San Francisco', 'CA', 37.77, -122.42, 864816],
        [5392171, 'San Jose', 'CA', 37.34, -121.89, 1026908],
        [5378538, 'Oakland', 'CA', 37.8, -122.27, 433031],
        [4409896, 'Springfield', 'MO', 37.22, -93.3, 169176],
        [4250542, 'Springfield', 'IL', 39.8, -89.64, 114394],
        [5341145, 'Cupertino', 'CA', 37.32, -122.03, 59727],
        [5354172, 'Gilroy', 'CA', 37.01, -121.57, 57664],
        [5392263, 'San Jacinto', 'CA', 33.78, -116.96, 48878],
        [5344147, 'East Palo Alto', 'CA', 37.47, -122.14, 30340],
        [5491930, 'San Jose', 'NM', 35.43, -105.48, 600],
    ],
};

export const sampleOptions: PlaceOption[] = searchPlaces(
    samplePlaces,
    'san',
    4
);

/** A fake place search with network-like delay, for Storybook. */
export const sampleSearch =
    (delayMs = 400) =>
    (
        _country: CountryCode,
        query: string,
        signal: AbortSignal
    ): Promise<PlaceOption[]> =>
        new Promise((resolve, reject) => {
            const timer = setTimeout(
                () =>
                    resolve(
                        searchPlaces(samplePlaces, query).map(
                            ({ id, label }) => ({
                                id,
                                label,
                            })
                        )
                    ),
                delayMs
            );
            signal.addEventListener('abort', () => {
                clearTimeout(timer);
                reject(new DOMException('Aborted', 'AbortError'));
            });
        });
