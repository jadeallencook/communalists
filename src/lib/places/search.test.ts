import { describe, expect, it } from 'vitest';

import { findPlace, normalize, searchPlaces } from './search';
import type { PlaceDataset } from './types';

const dataset: PlaceDataset = {
    source: 'test',
    country: 'US',
    regions: {
        CA: 'California',
        IL: 'Illinois',
        MO: 'Missouri',
        NM: 'New Mexico',
    },
    // Most populous first, like the generated data.
    places: [
        [1, 'San Jose', 'CA', 37.34, -121.89, 1000000],
        [2, 'Springfield', 'MO', 37.22, -93.3, 170000],
        [3, 'Springfield', 'IL', 39.8, -89.64, 114000],
        [4, 'South San Francisco', 'CA', 37.65, -122.41, 66000],
        [5, 'San Jacinto', 'CA', 33.78, -116.96, 50000],
        [6, 'San José', 'NM', 35.0, -106.0, 600],
    ],
};

const labels = (query: string) =>
    searchPlaces(dataset, query).map((p) => p.label);

describe('searchPlaces', () => {
    it('matches prefixes, most populous first', () => {
        expect(labels('san j')).toEqual([
            'San Jose, California',
            'San Jacinto, California',
            'San José, New Mexico',
        ]);
    });

    it('ranks an exact name above a prefix match', () => {
        expect(labels('san jose')[0]).toBe('San Jose, California');
    });

    it('ignores accents', () => {
        expect(labels('san jose')).toContain('San José, New Mexico');
        expect(normalize('  San José ')).toBe('san jose');
    });

    it('narrows by region after a comma, by code or name', () => {
        expect(labels('springfield, il')).toEqual(['Springfield, Illinois']);
        expect(labels('springfield, miss')).toEqual(['Springfield, Missouri']);
    });

    it('narrows by a trailing region without a comma', () => {
        expect(labels('springfield il')).toEqual(['Springfield, Illinois']);
        expect(labels('san jose new mexico')).toEqual(['San José, New Mexico']);
    });

    it('matches the start of any word', () => {
        expect(labels('francisco')).toEqual([
            'South San Francisco, California',
        ]);
    });

    it('needs at least 2 characters', () => {
        expect(labels('s')).toEqual([]);
    });

    it('limits results', () => {
        expect(searchPlaces(dataset, 'san', 2)).toHaveLength(2);
    });
});

describe('findPlace', () => {
    it('returns the place with coordinates', () => {
        expect(findPlace(dataset, '3')).toMatchObject({
            label: 'Springfield, Illinois',
            lat: 39.8,
            lng: -89.64,
            country: 'US',
        });
    });

    it('returns null for an unknown id', () => {
        expect(findPlace(dataset, '999')).toBeNull();
    });
});
