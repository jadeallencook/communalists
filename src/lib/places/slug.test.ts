import { describe, expect, it } from 'vitest';

import usPlaces from './data/us.json';
import { findPlace, findPlaceBySlug } from './search';
import { placeSlug, slugify } from './slug';
import type { PlaceDataset } from './types';

const dataset: PlaceDataset = {
    source: 'test',
    country: 'US',
    regions: { CA: 'California', GA: 'Georgia', NM: 'New Mexico' },
    // Most populous first, like the generated data.
    places: [
        [1, 'Oakland', 'CA', 37.8, -122.27, 433031],
        [2, 'San José', 'NM', 35.43, -105.48, 600],
        [3, "St. Mary's", 'GA', 30.73, -81.55, 18000],
        [4, 'St Marys', 'GA', 31.0, -82.0, 0],
    ],
};

describe('slugify', () => {
    it('lowercases, strips accents and punctuation, and joins words with dashes', () => {
        expect(slugify('San José')).toBe('san-jose');
        expect(slugify("St. Mary's")).toBe('st-marys');
        expect(slugify('  Winston-Salem ')).toBe('winston-salem');
        expect(slugify("Coeur d'Alene")).toBe('coeur-dalene');
    });
});

describe('placeSlug and findPlaceBySlug', () => {
    it('writes country/region/city and reads it back', () => {
        expect(placeSlug(dataset, 1, 'CA')).toBe('us/ca/oakland');
        expect(findPlace(dataset, '1')?.slug).toBe('us/ca/oakland');
        expect(findPlaceBySlug(dataset, 'ca', 'oakland')?.id).toBe('1');
        expect(findPlaceBySlug(dataset, 'nm', 'san-jose')?.label).toBe(
            'San José, New Mexico'
        );
    });

    it('gives the bigger town the plain name when two share one, and the other its id', () => {
        expect(placeSlug(dataset, 3, 'GA')).toBe('us/ga/st-marys');
        expect(placeSlug(dataset, 4, 'GA')).toBe('us/ga/st-marys-4');
        expect(findPlaceBySlug(dataset, 'ga', 'st-marys')?.id).toBe('3');
        expect(findPlaceBySlug(dataset, 'ga', 'st-marys-4')?.id).toBe('4');
    });

    it('finds nothing for an unknown city or the wrong region', () => {
        expect(findPlaceBySlug(dataset, 'ca', 'nowhere')).toBeNull();
        expect(findPlaceBySlug(dataset, 'nm', 'oakland')).toBeNull();
        expect(placeSlug(dataset, 99, 'CA')).toBeNull();
    });

    it('gives every place in the real US data its own path', () => {
        const us = usPlaces as unknown as PlaceDataset;
        const paths = new Set(
            us.places.map(([id, , region]) => placeSlug(us, id, region))
        );
        expect(paths.size).toBe(us.places.length);
        expect(paths.has(null)).toBe(false);
        expect(findPlaceBySlug(us, 'ca', 'oakland')?.id).toBe('5378538');
    });
});
