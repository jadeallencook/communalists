import { describe, expect, it } from 'vitest';

import {
    comparePeriods,
    DAY_MS,
    daysSince,
    FEED_ACTIONS,
    percent,
    searchTerms,
    statWindows,
    WEEK_MS,
    weeklyBuckets,
} from './platform-stats';

const now = Date.UTC(2026, 10, 27, 18, 30);

describe('statWindows', () => {
    it('ends now and the previous 30 days sit right before the last 30', () => {
        const w = statWindows(now);
        expect(w.last7).toEqual({ start: now - 7 * DAY_MS, end: now });
        expect(w.last30.end).toBe(now);
        expect(w.previous30.end).toBe(w.last30.start);
        expect(w.previous30.end - w.previous30.start).toBe(30 * DAY_MS);
    });
});

describe('weeklyBuckets', () => {
    it('gives 12 back-to-back weeks ending now, oldest first', () => {
        const weeks = weeklyBuckets(now);
        expect(weeks).toHaveLength(12);
        expect(weeks.at(-1)).toEqual({ start: now - WEEK_MS, end: now });
        expect(weeks[0].start).toBe(now - 12 * WEEK_MS);
        for (let i = 1; i < weeks.length; i++)
            expect(weeks[i].start).toBe(weeks[i - 1].end);
    });

    it('takes another length', () => {
        expect(weeklyBuckets(now, 3)).toHaveLength(3);
    });
});

describe('comparePeriods', () => {
    it('says which way it went and by how much', () => {
        expect(comparePeriods(12, 8)).toEqual({ change: 4, trend: 'up' });
        expect(comparePeriods(3, 8)).toEqual({ change: 5, trend: 'down' });
        expect(comparePeriods(5, 5)).toEqual({ change: 0, trend: 'same' });
    });
});

describe('daysSince', () => {
    it('counts whole days', () => {
        expect(daysSince(now - 3 * DAY_MS - 1000, now)).toBe(3);
        expect(daysSince(now - 1000, now)).toBe(0);
    });

    it('is 0 for a missing or future time', () => {
        expect(daysSince(undefined, now)).toBe(0);
        expect(daysSince(now + DAY_MS, now)).toBe(0);
    });
});

describe('percent', () => {
    it('rounds and handles an empty whole', () => {
        expect(percent(1, 3)).toBe(33);
        expect(percent(0, 0)).toBe(0);
    });
});

describe('FEED_ACTIONS', () => {
    it('leaves out the actions an import repeats hundreds of times', () => {
        expect(FEED_ACTIONS).not.toContain('createUnclaimed');
        expect(FEED_ACTIONS).not.toContain('editUnclaimed');
        expect(FEED_ACTIONS).not.toContain('exportOrganizations');
    });

    it('fits in one Firestore "in" filter (30 values)', () => {
        expect(FEED_ACTIONS.length).toBeLessThanOrEqual(30);
    });
});

describe('searchTerms', () => {
    it('is null for blank input', () => {
        expect(searchTerms('   ')).toBeNull();
        expect(searchTerms(undefined)).toBeNull();
    });

    it('looks up a handle prefix and both name spellings', () => {
        expect(searchTerms(' oakland auto ')).toEqual({
            handle: 'oakland-auto',
            names: ['oakland auto', 'Oakland auto'],
        });
    });

    it('does not repeat a name that is already capitalized', () => {
        expect(searchTerms('Glide')?.names).toEqual(['Glide']);
    });

    it('caps the length', () => {
        expect(searchTerms('a'.repeat(200))!.names[0]).toHaveLength(60);
    });
});
