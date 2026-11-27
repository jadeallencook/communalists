import { describe, expect, it } from 'vitest';

import {
    activeFilterCount,
    directoryFilterParams,
    directoryHref,
    filterDirectory,
    homeSearchHref,
    nearbyOrganizations,
    parseDirectorySearch,
    type DirectoryFilters,
    type DirectoryOrganization,
} from './directory';

const sanJose = { country: 'US' as const, lat: 37.3394, lng: -121.895 };
const oakland = { lat: 37.8044, lng: -122.2712 }; // ~39 mi from San Jose
const santaClara = { lat: 37.3541, lng: -121.9552 }; // ~3 mi
const losAngeles = { lat: 34.0522, lng: -118.2437 }; // ~300 mi

const org = (
    id: string,
    overrides: Partial<DirectoryOrganization> & {
        at?: { lat: number; lng: number };
        country?: 'US';
    } = {}
): DirectoryOrganization => {
    const { at = santaClara, country = 'US', ...rest } = overrides;
    return {
        id,
        name: id,
        handle: id,
        focusAreas: ['food'],
        description: '',
        location: { label: id, country, ...at },
        reach: 'local',
        languages: ['en'],
        memberCount: 1,
        socials: [],
        ...rest,
    };
};

const filters = (
    overrides: Partial<DirectoryFilters> = {}
): DirectoryFilters => ({
    radiusMiles: 25,
    focusAreas: [],
    languages: [],
    reach: ['local', 'national', 'international'],
    ...overrides,
});

describe('filterDirectory', () => {
    it('keeps local groups within the radius, closest first', () => {
        const results = filterDirectory(
            [
                org('oakland', { at: oakland }),
                org('santa-clara'),
                org('here', { at: sanJose }),
            ],
            sanJose,
            filters({ radiusMiles: 50 })
        );
        expect(results.local.map((r) => r.org.id)).toEqual([
            'here',
            'santa-clara',
            'oakland',
        ]);
        expect(results.local[0].distanceMiles).toBe(0);
        expect(results.local[2].distanceMiles).toBeGreaterThan(30);

        const closer = filterDirectory(
            [org('oakland', { at: oakland }), org('santa-clara')],
            sanJose,
            filters({ radiusMiles: 25 })
        );
        expect(closer.local.map((r) => r.org.id)).toEqual(['santa-clara']);
    });

    it("measures distance only, not the group's own service radius", () => {
        // Based 39 mi away; its own area (stored on the org) isn't checked.
        const results = filterDirectory(
            [org('oakland', { at: oakland })],
            sanJose,
            filters({ radiusMiles: 50 })
        );
        expect(results.local).toHaveLength(1);
    });

    it('shows nationwide groups in the same country and international ones anywhere, biggest first', () => {
        const results = filterDirectory(
            [
                org('la', {
                    at: losAngeles,
                    reach: 'national',
                    memberCount: 3,
                }),
                org('big', {
                    at: losAngeles,
                    reach: 'national',
                    memberCount: 9,
                }),
                org('world', { at: losAngeles, reach: 'international' }),
                org('far-local', { at: losAngeles }),
            ],
            sanJose,
            filters()
        );
        expect(results.national.map((r) => r.org.id)).toEqual(['big', 'la']);
        expect(results.international.map((r) => r.org.id)).toEqual(['world']);
        expect(results.local).toEqual([]);
    });

    it('matches any chosen focus area and any chosen language', () => {
        const candidates = [
            org('food-en'),
            org('housing-vi', { focusAreas: ['housing'], languages: ['vi'] }),
            org('both', {
                focusAreas: ['food', 'legal'],
                languages: ['es', 'vi'],
            }),
        ];
        const ids = (f: DirectoryFilters) =>
            filterDirectory(candidates, sanJose, f).local.map((r) => r.org.id);
        expect(ids(filters({ focusAreas: ['legal', 'housing'] }))).toEqual([
            'both',
            'housing-vi',
        ]);
        expect(ids(filters({ languages: ['vi'] }))).toEqual([
            'both',
            'housing-vi',
        ]);
        expect(
            ids(filters({ focusAreas: ['food'], languages: ['vi'] }))
        ).toEqual(['both']);
    });

    it('leaves out kinds of groups not chosen, and duplicates', () => {
        const results = filterDirectory(
            [org('a'), org('a'), org('world', { reach: 'international' })],
            sanJose,
            filters({ reach: ['local'] })
        );
        expect(results.local).toHaveLength(1);
        expect(results.international).toEqual([]);
    });
});

describe('nearbyOrganizations', () => {
    const here = { id: 'self', ...sanJose };

    it('lists other local groups within 50 mi, closest first, leaving out itself', () => {
        const result = nearbyOrganizations(
            [
                org('oakland', { at: oakland }),
                org('self', { at: sanJose }),
                org('santa-clara', { at: santaClara }),
                org('la', { at: losAngeles }),
                org('national', { reach: 'national', at: santaClara }),
            ],
            here
        );
        expect(result.map((r) => r.org.id)).toEqual(['santa-clara', 'oakland']);
        expect(result[0].distanceMiles).toBe(3);
    });

    it('shows at most 4', () => {
        const many = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => org(id));
        expect(nearbyOrganizations(many, here)).toHaveLength(4);
    });

    it('is empty when nothing is near', () => {
        expect(
            nearbyOrganizations([org('la', { at: losAngeles })], here)
        ).toEqual([]);
    });
});

describe('parseDirectorySearch', () => {
    it('reads a search and drops anything unknown', () => {
        expect(
            parseDirectorySearch({
                country: 'US',
                placeId: '5392171',
                radius: '50',
                focusAreas: ['food', 'mutualAid'],
                languages: 'vi',
                reach: ['local', 'galactic'],
            })
        ).toEqual({
            country: 'US',
            placeId: '5392171',
            radiusMiles: 50,
            focusAreas: ['food'],
            languages: ['vi'],
            reach: ['local'],
        });
    });

    it('falls back to defaults', () => {
        expect(
            parseDirectorySearch({
                country: 'XX',
                placeId: '../x',
                radius: '7',
            })
        ).toEqual({
            country: 'US',
            placeId: undefined,
            radiusMiles: 25,
            focusAreas: [],
            languages: [],
            reach: ['local', 'national', 'international'],
        });
    });

    it('round-trips the filters through URL parameters, leaving out defaults', () => {
        const search = parseDirectorySearch({
            radius: '10',
            focusAreas: ['food', 'housing'],
            reach: ['local', 'national'],
        });
        const params = directoryFilterParams(search);
        expect(params.toString()).toBe(
            'radius=10&focusAreas=food&focusAreas=housing&reach=local&reach=national'
        );
        expect(
            parseDirectorySearch({
                ...Object.fromEntries(params),
                focusAreas: params.getAll('focusAreas'),
                reach: params.getAll('reach'),
            })
        ).toEqual(search);
        expect(directoryFilterParams(parseDirectorySearch({})).toString()).toBe(
            ''
        );
    });
});

describe('directoryHref', () => {
    it('puts the city in the path and the filters after it', () => {
        const filters = parseDirectorySearch({
            radius: '10',
            languages: ['es'],
        });
        expect(directoryHref(filters, 'us/ca/oakland')).toBe(
            '/find/us/ca/oakland?radius=10&languages=es'
        );
        expect(directoryHref(parseDirectorySearch({}), 'us/ca/oakland')).toBe(
            '/find/us/ca/oakland'
        );
    });

    it('is plain /find without a city', () => {
        expect(directoryHref(parseDirectorySearch({}))).toBe('/find');
        expect(directoryHref(parseDirectorySearch({ radius: '50' }))).toBe(
            '/find?radius=50'
        );
    });
});

describe('homeSearchHref', () => {
    const startingSlug = 'us/ca/san-francisco';

    it('starts from the starting city when nothing is chosen', () => {
        expect(homeSearchHref({ startingSlug })).toBe(
            '/find/us/ca/san-francisco'
        );
    });

    it('adds the chosen focus area and uses the chosen city', () => {
        expect(homeSearchHref({ focusArea: 'housing', startingSlug })).toBe(
            '/find/us/ca/san-francisco?focusAreas=housing'
        );
        expect(
            homeSearchHref({
                focusArea: 'food',
                place: { country: 'US', id: '5378538', slug: 'us/ca/oakland' },
                startingSlug,
            })
        ).toBe('/find/us/ca/oakland?focusAreas=food');
    });

    it('ignores anything that is not a listed focus area', () => {
        expect(homeSearchHref({ focusArea: 'free text', startingSlug })).toBe(
            '/find/us/ca/san-francisco'
        );
    });

    it('falls back to placeId when the city has no path', () => {
        expect(
            homeSearchHref({
                focusArea: 'legal',
                place: { country: 'US', id: '5378538', slug: '' },
                startingSlug,
            })
        ).toBe('/find?country=US&placeId=5378538&focusAreas=legal');
    });
});

describe('activeFilterCount', () => {
    it('is 0 for the defaults', () => {
        expect(activeFilterCount(parseDirectorySearch({}))).toBe(0);
    });

    it('counts distance, reach, and each focus area and language', () => {
        expect(
            activeFilterCount(
                parseDirectorySearch({
                    radius: '50',
                    reach: ['local'],
                    focusAreas: ['food', 'housing'],
                    languages: ['vi'],
                })
            )
        ).toBe(5);
    });
});
