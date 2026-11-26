import { describe, expect, it } from 'vitest';

import {
    FOCUS_AREAS,
    FOCUS_AREAS_BY_USE,
    focusAreasByUse,
    JOIN_POLICIES,
    MAX_FOCUS_AREAS,
    milesToKm,
    normalizeWebUrl,
    OFFERED_FOCUS_AREAS,
    REACH_SCOPES,
    MEMBER_LIST_VISIBILITIES,
    VISIBILITIES,
} from './options';

// These keys are stored in Firestore. If this test fails, you renamed or
// removed a stored value: put it back (relabel in messages/*.json instead, or
// retire it with RETIRED_FOCUS_AREAS). Adding a key: append it here too.
describe('stored keys are permanent', () => {
    it('keeps every focus area key', () => {
        expect(FOCUS_AREAS).toEqual([
            'general',
            'food',
            'housing',
            'transportation',
            'technology',
            'health',
            'childcare',
            'education',
            'clothing',
            'hygiene',
            'lending',
            'disasterRelief',
            'legal',
            'labor',
            'arts',
            'hobbies',
            'faith',
            'animals',
            'environment',
            'other',
        ]);
    });

    it('keeps reach, join policy and visibility keys', () => {
        expect(REACH_SCOPES).toEqual(['local', 'national', 'international']);
        expect(JOIN_POLICIES).toEqual(['request', 'open', 'invite']);
        expect(VISIBILITIES).toEqual(['listed', 'unlisted']);
        expect(MEMBER_LIST_VISIBILITIES).toEqual([
            'public',
            'members',
            'hidden',
        ]);
    });

    it('offers enough focus areas to choose up to the cap', () => {
        expect(OFFERED_FOCUS_AREAS.length).toBeGreaterThan(MAX_FOCUS_AREAS);
    });
});

describe('normalizeWebUrl', () => {
    it('adds https and keeps paths', () => {
        expect(normalizeWebUrl('sbma.org')).toBe('https://sbma.org/');
        expect(normalizeWebUrl('http://sbma.org/about')).toBe(
            'https://sbma.org/about'
        );
    });

    it('rejects non-web addresses', () => {
        for (const bad of [
            '',
            'javascript:alert(1)',
            'mailto:a@b.co',
            'localhost',
            'not a url',
        ]) {
            expect(normalizeWebUrl(bad)).toBeNull();
        }
    });
});

describe('milesToKm', () => {
    it('rounds to whole km', () => {
        expect(milesToKm(25)).toBe(40);
        expect(milesToKm(100)).toBe(161);
    });
});

describe('focusAreasByUse', () => {
    it('ranks every offered focus area exactly once', () => {
        expect([...FOCUS_AREAS_BY_USE].sort()).toEqual(
            [...OFFERED_FOCUS_AREAS].sort()
        );
        expect(focusAreasByUse()).toHaveLength(OFFERED_FOCUS_AREAS.length);
    });

    it('puts the most common first', () => {
        expect(focusAreasByUse().slice(0, 3)).toEqual([
            'food',
            'housing',
            'health',
        ]);
    });
});
