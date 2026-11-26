import { normalize } from './normalize';
import { placeIndexBySlug, placeSlug } from './slug';
import type { CountryCode, Place, PlaceDataset } from './types';

// Pure search over a place dataset. No I/O, so it's easy to test and to reuse.

export { normalize };

export const MIN_QUERY_LENGTH = 2;

function toPlace(
    dataset: PlaceDataset,
    [id, name, region, lat, lng]: PlaceDataset['places'][number]
): Place {
    const regionName = dataset.regions[region] ?? region;
    return {
        id: String(id),
        slug: placeSlug(dataset, id, region) ?? '',
        label: `${name}, ${regionName}`,
        country: dataset.country as CountryCode,
        name,
        region: regionName,
        lat,
        lng,
    };
}

/**
 * Find places by name. Accepts "san j", "san jose, ca", "san jose california"
 * or "springfield il". Exact names rank first, then names that start with the
 * query, then names with a word that does; ties go to the more populous place.
 */
export function searchPlaces(
    dataset: PlaceDataset,
    query: string,
    limit = 8
): Place[] {
    let cityQuery = normalize(query);
    let regionQuery = '';

    const comma = cityQuery.indexOf(',');
    if (comma >= 0) {
        regionQuery = cityQuery.slice(comma + 1).trim();
        cityQuery = cityQuery.slice(0, comma).trim();
    } else {
        // "springfield il" or "san jose california": peel a trailing region off.
        const words = cityQuery.split(/\s+/);
        for (let take = Math.min(2, words.length - 1); take >= 1; take--) {
            const tail = words.slice(-take).join(' ');
            const isRegion = Object.entries(dataset.regions).some(
                ([code, name]) =>
                    normalize(code) === tail || normalize(name) === tail
            );
            if (isRegion) {
                regionQuery = tail;
                cityQuery = words.slice(0, -take).join(' ');
                break;
            }
        }
    }
    if (cityQuery.length < MIN_QUERY_LENGTH) return [];

    const regionMatches = (code: string) => {
        if (!regionQuery) return true;
        const name = normalize(dataset.regions[code] ?? '');
        return normalize(code) === regionQuery || name.startsWith(regionQuery);
    };

    const ranked: { score: number; index: number }[] = [];
    dataset.places.forEach(([, name, region], index) => {
        if (!regionMatches(region)) return;
        const n = normalize(name);
        const score =
            n === cityQuery
                ? 0
                : n.startsWith(cityQuery)
                  ? 1
                  : n.split(/[\s-]+/).some((word) => word.startsWith(cityQuery))
                    ? 2
                    : -1;
        if (score >= 0) ranked.push({ score, index });
    });

    // Places are stored most populous first, so index breaks ties by population.
    return ranked
        .sort((a, b) => a.score - b.score || a.index - b.index)
        .slice(0, limit)
        .map(({ index }) => toPlace(dataset, dataset.places[index]));
}

export function findPlace(dataset: PlaceDataset, id: string): Place | null {
    const entry = dataset.places.find(([placeId]) => String(placeId) === id);
    return entry ? toPlace(dataset, entry) : null;
}

/** The place at a readable path's region and city ("ca", "oakland"), if any. */
export function findPlaceBySlug(
    dataset: PlaceDataset,
    region: string,
    city: string
): Place | null {
    const index = placeIndexBySlug(dataset, region, city);
    return index === null ? null : toPlace(dataset, dataset.places[index]);
}
