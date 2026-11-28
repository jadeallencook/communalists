import { describe, expect, it } from 'vitest';

import { ariaCurrent, NAV_ITEMS, navCurrent, navItemsFor } from './navigation';

const item = (key: string) => NAV_ITEMS.find((i) => i.key === key)!;

describe('navItemsFor', () => {
    it('shows public sections to visitors', () => {
        expect(navItemsFor(false).map((i) => i.key)).toEqual([
            'organizations',
            'dictionary',
        ]);
    });

    it('adds Dashboard at the end when signed in', () => {
        expect(navItemsFor(true).map((i) => i.key)).toEqual([
            'organizations',
            'dictionary',
            'dashboard',
        ]);
    });
});

describe('navCurrent', () => {
    it('marks the exact page', () => {
        expect(navCurrent(item('organizations'), '/find/organizations')).toBe(
            'page'
        );
        expect(navCurrent(item('dashboard'), '/dashboard/')).toBe('page');
    });

    it('marks the section for pages inside it', () => {
        expect(
            navCurrent(
                item('organizations'),
                '/find/organizations/us/ca/oakland'
            )
        ).toBe('section');
        expect(
            navCurrent(item('organizations'), '/organization/south-bay')
        ).toBe('section');
        expect(navCurrent(item('dictionary'), '/dictionary/mutual-aid')).toBe(
            'section'
        );
    });

    it("doesn't treat creating an organization as browsing them", () => {
        expect(
            navCurrent(item('organizations'), '/organization/new')
        ).toBeUndefined();
    });

    it('needs a whole path segment to match', () => {
        expect(navCurrent(item('organizations'), '/finder')).toBeUndefined();
        expect(navCurrent(item('organizations'), '/organic')).toBeUndefined();
        // Other kinds of search (decision #63) aren't this section.
        expect(
            navCurrent(item('organizations'), '/find/comrades')
        ).toBeUndefined();
    });

    it('marks nothing elsewhere', () => {
        for (const i of NAV_ITEMS) {
            expect(navCurrent(i, '/')).toBeUndefined();
            expect(navCurrent(i, '/account/settings')).toBeUndefined();
        }
    });
});

describe('ariaCurrent', () => {
    it('maps to aria-current values', () => {
        expect(ariaCurrent('page')).toBe('page');
        expect(ariaCurrent('section')).toBe('true');
        expect(ariaCurrent(undefined)).toBeUndefined();
    });
});
