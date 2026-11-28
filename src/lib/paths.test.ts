import { describe, expect, it } from 'vitest';

import { RESERVED_HANDLES } from './organizations/handle';
import { FIND_KINDS, findPath, organizationPath } from './paths';

describe('paths', () => {
    it('builds organization addresses', () => {
        expect(organizationPath('sbma')).toBe('/organization/sbma');
        expect(organizationPath('sbma', 'edit')).toBe(
            '/organization/sbma/edit'
        );
    });

    it('builds search addresses', () => {
        expect(findPath('organizations')).toBe('/find/organizations');
    });

    // Old searches (/find/us/…) are told apart from new ones by their
    // two-letter country code (next.config.ts), so no kind can be two letters.
    it('has no kind that looks like a country code', () => {
        for (const kind of FIND_KINDS) expect(kind).not.toMatch(/^[a-z]{2}$/i);
    });

    it('reserves the words the addresses use', () => {
        for (const word of [
            'organization',
            'organizations',
            'event',
            'events',
            'comrade',
            'comrades',
            'find',
            ...FIND_KINDS,
        ])
            expect(RESERVED_HANDLES.has(word)).toBe(true);
    });
});
