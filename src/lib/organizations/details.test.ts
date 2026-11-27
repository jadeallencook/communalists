import { describe, expect, it } from 'vitest';

import { isDetailGap, missingDetails, missingDetailsChanged } from './details';

describe('missingDetails', () => {
    it('flags every gap, including no way to reach them', () => {
        expect(missingDetails({})).toEqual([
            'contact',
            'phone',
            'email',
            'website',
            'address',
        ]);
    });

    it('treats blank text and empty socials as missing', () => {
        expect(
            missingDetails({
                phone: '  ',
                contactEmail: '',
                website: null,
                streetAddress: ' ',
                socials: [],
            })
        ).toContain('contact');
    });

    it('a social link alone is a way to reach them', () => {
        expect(
            missingDetails({
                socials: [{ platform: 'instagram', handle: 'x' }],
            })
        ).toEqual(['phone', 'email', 'website', 'address']);
    });

    it('a complete page has no gaps', () => {
        expect(
            missingDetails({
                phone: '+15105550100',
                contactEmail: 'hi@example.org',
                website: 'https://example.org',
                streetAddress: '1 Main St',
                socials: [],
            })
        ).toEqual([]);
    });
});

describe('missingDetailsChanged', () => {
    it('is true when nothing is stored yet', () => {
        expect(missingDetailsChanged(undefined, {})).toBe(true);
    });

    it('is false when the stored list matches', () => {
        expect(
            missingDetailsChanged(['phone', 'email', 'website', 'address'], {
                socials: [{}],
            })
        ).toBe(false);
    });

    it('is true when a detail was added since', () => {
        expect(
            missingDetailsChanged(['phone', 'email', 'website', 'address'], {
                socials: [{}],
                phone: '+15105550100',
            })
        ).toBe(true);
    });
});

describe('isDetailGap', () => {
    it('accepts only known keys', () => {
        expect(isDetailGap('contact')).toBe(true);
        expect(isDetailGap('logo')).toBe(false);
        expect(isDetailGap(undefined)).toBe(false);
    });
});
