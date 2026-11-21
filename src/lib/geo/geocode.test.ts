import { afterEach, describe, expect, it, vi } from 'vitest';

// `server-only` throws outside React Server Components; stub it for tests.
vi.mock('server-only', () => ({}));

const { areaLabel, geocodeArea, roundCoordinate } = await import('./geocode');

afterEach(() => vi.unstubAllGlobals());

describe('roundCoordinate', () => {
    it('keeps ~1 km precision so no street address is stored', () => {
        expect(roundCoordinate(37.338207)).toBe(37.34);
        expect(roundCoordinate(-121.886329)).toBe(-121.89);
    });
});

describe('areaLabel', () => {
    it('builds "city, state, country"', () => {
        expect(
            areaLabel({
                lat: '0',
                lon: '0',
                display_name: 'ignored',
                address: {
                    city: 'San Jose',
                    state: 'California',
                    country: 'United States',
                },
            })
        ).toBe('San Jose, California, United States');
    });

    it('falls back to towns and villages, then the display name', () => {
        expect(
            areaLabel({
                lat: '0',
                lon: '0',
                display_name: 'x',
                address: { town: 'Gilroy' },
            })
        ).toBe('Gilroy');
        expect(
            areaLabel({ lat: '0', lon: '0', display_name: 'Somewhere' })
        ).toBe('Somewhere');
    });
});

describe('geocodeArea', () => {
    it('returns a rounded area with a geohash', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () =>
                Response.json([
                    {
                        lat: '37.3382082',
                        lon: '-121.8863286',
                        display_name:
                            'San Jose, Santa Clara County, California, United States',
                        address: {
                            city: 'San Jose',
                            state: 'California',
                            country: 'United States',
                        },
                    },
                ])
            )
        );
        const area = await geocodeArea('San Jose', 'en');
        expect(area).toMatchObject({
            label: 'San Jose, California, United States',
            lat: 37.34,
            lng: -121.89,
        });
        expect(area?.geohash).toMatch(/^9q9k/);
    });

    it("searches the visitor's country first, then worldwide", async () => {
        const fetchMock = vi.fn(async (url: string) =>
            Response.json(
                url.includes('countrycodes=us')
                    ? []
                    : [{ lat: '1', lon: '2', display_name: 'Elsewhere' }]
            )
        );
        vi.stubGlobal('fetch', fetchMock);
        const area = await geocodeArea('95112', 'en', 'US');
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock.mock.calls[0][0]).toContain('countrycodes=us');
        expect(fetchMock.mock.calls[1][0]).not.toContain('countrycodes');
        expect(area?.label).toBe('Elsewhere');
    });

    it('returns null when nothing matches', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => Response.json([]))
        );
        expect(await geocodeArea('zzzz', 'en')).toBeNull();
    });
});
