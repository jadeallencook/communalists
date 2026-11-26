import { normalize } from './normalize';
import type { PlaceDataset } from './types';

// Readable place paths for URLs: "us/ca/oakland" (country, region, city),
// e.g. communalists.com/en/find/us/ca/oakland. Pure, so it's tested directly.
// Design: decision #49.

/** "St. Mary's" → "st-marys", "San José" → "san-jose". */
export const slugify = (text: string) =>
    normalize(text)
        .replace(/['’.]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

interface SlugIndex {
    /** "ca/oakland" → index into dataset.places. */
    byPath: Map<string, number>;
    /** GeoNames id → city slug (unique within its region). */
    cityById: Map<number, string>;
}

const indexes = new WeakMap<PlaceDataset, SlugIndex>();

/**
 * Built once per dataset. Places are stored most populous first, so the
 * bigger town keeps the plain name when two in a region share one; the
 * smaller gets its id added ("st-marys-4223413"), so every place has a path.
 */
function slugIndex(dataset: PlaceDataset): SlugIndex {
    const cached = indexes.get(dataset);
    if (cached) return cached;
    const byPath = new Map<string, number>();
    const cityById = new Map<number, string>();
    dataset.places.forEach(([id, name, region], index) => {
        const base = slugify(name) || String(id);
        const regionSlug = region.toLowerCase();
        const city = byPath.has(`${regionSlug}/${base}`)
            ? `${base}-${id}`
            : base;
        byPath.set(`${regionSlug}/${city}`, index);
        cityById.set(id, city);
    });
    const index = { byPath, cityById };
    indexes.set(dataset, index);
    return index;
}

/** The path for a place, "us/ca/oakland", or null if it isn't in the dataset. */
export function placeSlug(
    dataset: PlaceDataset,
    id: number,
    region: string
): string | null {
    const city = slugIndex(dataset).cityById.get(id);
    return city
        ? `${dataset.country.toLowerCase()}/${region.toLowerCase()}/${city}`
        : null;
}

/** The dataset row for "ca" + "oakland" (lowercase, as placeSlug writes them), if any. */
export function placeIndexBySlug(
    dataset: PlaceDataset,
    region: string,
    city: string
): number | null {
    return slugIndex(dataset).byPath.get(`${region}/${city}`) ?? null;
}
