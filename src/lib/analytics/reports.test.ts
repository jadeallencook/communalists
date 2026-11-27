import { describe, expect, it } from 'vitest';

import {
    parseMetricRows,
    parseSiteStats,
    topCities,
    topOrganizations,
} from './reports';

const rows = [
    { x: '/en/org/sbma', y: 10 },
    { x: '/es/org/sbma', y: 4 },
    { x: '/org/sbma', y: 1 },
    { x: '/en/org/oakland-auto-club', y: 7 },
    { x: '/en/org/sbma/edit', y: 50 },
    { x: '/en/org/sbma/claim', y: 3 },
    { x: '/en/find/us/ca/oakland', y: 20 },
    { x: '/vi/find/us/ca/oakland', y: 5 },
    { x: '/en/find/us/ca/san-jos%C3%A9', y: 2 },
    { x: '/en/find', y: 99 },
    { x: '/en/dictionary/a', y: 30 },
    { x: null, y: 8 },
];

describe('parseMetricRows', () => {
    it('reads [{ x, y }]', () => {
        expect(parseMetricRows([{ x: '/a', y: '3' }])).toEqual([
            { x: '/a', y: 3 },
        ]);
    });

    it('is null for anything else', () => {
        expect(parseMetricRows({ error: 'nope' })).toBeNull();
        expect(parseMetricRows([{ path: '/a' }])).toBeNull();
    });
});

describe('parseSiteStats', () => {
    it('reads plain numbers with a comparison', () => {
        expect(
            parseSiteStats({
                pageviews: 120,
                visitors: 40,
                visits: 50,
                comparison: { pageviews: 100, visitors: 30 },
            })
        ).toEqual({
            pageviews: 120,
            visitors: 40,
            previous: { pageviews: 100, visitors: 30 },
        });
    });

    it('reads the older { value } shape', () => {
        expect(
            parseSiteStats({
                pageviews: { value: 5, prev: 2 },
                visitors: { value: 3, prev: 1 },
            })
        ).toEqual({ pageviews: 5, visitors: 3 });
    });

    it('is null for anything else', () => {
        expect(parseSiteStats([])).toBeNull();
    });
});

describe('topOrganizations', () => {
    it('adds up languages and leaves out other pages', () => {
        expect(topOrganizations(rows)).toEqual([
            { key: 'sbma', views: 15 },
            { key: 'oakland-auto-club', views: 7 },
        ]);
    });

    it('takes a limit', () => {
        expect(topOrganizations(rows, 1)).toHaveLength(1);
    });
});

describe('topCities', () => {
    it('adds up languages and decodes the path', () => {
        expect(topCities(rows)).toEqual([
            { key: 'us/ca/oakland', views: 25 },
            { key: 'us/ca/san-josé', views: 2 },
        ]);
    });
});
