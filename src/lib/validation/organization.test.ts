import { describe, expect, it } from 'vitest';

import { organizationSchema } from './organization';

const valid = {
    name: 'South Bay Mutual Aid',
    handle: ' SBMA ',
    focusAreas: ['general', 'food'],
    description: 'Neighbors helping neighbors.',
    country: 'US',
    placeId: '5392171',
    reach: 'local',
    radiusMiles: '25',
    languages: ['en', 'vi'],
    website: 'sbma.org',
    contactEmail: ' Hello@SBMA.org ',
    socials: [{ platform: 'instagram', handle: 'https://instagram.com/sbma/' }],
    joinPolicy: 'request',
    visibility: 'listed',
    memberListVisibility: 'members',
};

const errorsFor = (input: Record<string, unknown>) => {
    const result = organizationSchema.safeParse(input);
    if (result.success) return {};
    return Object.fromEntries(
        result.error.issues.map((i) => [i.path[0], i.message])
    );
};

describe('organizationSchema', () => {
    it('accepts and normalizes a full organization', () => {
        const org = organizationSchema.parse(valid);
        expect(org.handle).toBe('sbma');
        expect(org.radiusMiles).toBe(25);
        expect(org.website).toBe('https://sbma.org/');
        expect(org.contactEmail).toBe('hello@sbma.org');
        expect(org.socials).toEqual([
            { platform: 'instagram', handle: 'sbma' },
        ]);
    });

    it('keeps optional fields optional', () => {
        const org = organizationSchema.parse({
            ...valid,
            description: '',
            website: '',
            contactEmail: '',
            socials: [],
        });
        expect(org.website).toBeUndefined();
        expect(org.contactEmail).toBeUndefined();
    });

    it('explains handle problems', () => {
        expect(errorsFor({ ...valid, handle: '' }).handle).toBe('required');
        expect(errorsFor({ ...valid, handle: 'ab' }).handle).toBe(
            'handleTooShort'
        );
        expect(errorsFor({ ...valid, handle: 'sb_ma' }).handle).toBe(
            'handleFormat'
        );
        expect(errorsFor({ ...valid, handle: 'dashboard' }).handle).toBe(
            'handleReserved'
        );
    });

    it('requires a radius only for local reach', () => {
        expect(errorsFor({ ...valid, radiusMiles: '' }).radiusMiles).toBe(
            'radiusRequired'
        );
        expect(errorsFor({ ...valid, radiusMiles: '7' }).radiusMiles).toBe(
            'radiusRequired'
        );
        expect(
            errorsFor({ ...valid, reach: 'national', radiusMiles: '' })
        ).toEqual({});
    });

    it('checks links', () => {
        expect(
            errorsFor({ ...valid, website: 'javascript:alert(1)' }).website
        ).toBe('invalidUrl');
        expect(errorsFor({ ...valid, contactEmail: 'nope' }).contactEmail).toBe(
            'invalidEmail'
        );
        expect(
            errorsFor({
                ...valid,
                socials: [{ platform: 'facebook', handle: 'instagram.com/x' }],
            }).socials
        ).toBe('socialMismatch');
        expect(
            errorsFor({
                ...valid,
                socials: [
                    { platform: 'instagram', handle: 'a' },
                    { platform: 'instagram', handle: 'b' },
                ],
            }).socials
        ).toBe('socialDuplicate');
    });

    it('allows 1 to 3 focus areas, counting repeats once', () => {
        expect(
            errorsFor({
                ...valid,
                focusAreas: ['food', 'housing', 'legal', 'health'],
            }).focusAreas
        ).toBe('focusAreasTooMany');
        const parsed = organizationSchema.parse({
            ...valid,
            focusAreas: ['food', 'food', 'housing', 'legal'],
        });
        expect(parsed.focusAreas).toEqual(['food', 'housing', 'legal']);
    });

    it('rejects unknown focus areas', () => {
        expect(
            errorsFor({ ...valid, focusAreas: ['mutualAid'] }).focusAreas
        ).toBe('focusAreasRequired');
    });

    it('requires a focus area, a city and at least one language', () => {
        expect(
            errorsFor({ ...valid, focusAreas: [], placeId: '', languages: [] })
        ).toEqual({
            focusAreas: 'focusAreasRequired',
            placeId: 'placeRequired',
            languages: 'languagesRequired',
        });
    });
});
