import { describe, expect, it } from 'vitest';

import {
    isSetupComplete,
    missingSetupSteps,
    safeNextPath,
} from './account-setup';

const complete = {
    displayName: 'Ada',
    username: 'ada',
    locale: 'en',
    location: { placeId: '5392171' },
};
const locales = ['en', 'es', 'vi', 'zh'];

describe('missingSetupSteps', () => {
    it('asks everything of an account with no profile (prototype users)', () => {
        const all = ['name', 'username', 'language', 'location'];
        expect(missingSetupSteps(null)).toEqual(all);
        expect(missingSetupSteps({})).toEqual(all);
    });

    it('asks only what is missing', () => {
        expect(missingSetupSteps({ ...complete, location: null })).toEqual([
            'location',
        ]);
        expect(missingSetupSteps({ ...complete, displayName: '  ' })).toEqual([
            'name',
        ]);
        // Accounts from before usernames are asked for one, and nothing else.
        expect(missingSetupSteps({ ...complete, username: undefined })).toEqual(
            ['username']
        );
    });

    it('treats a full profile as complete', () => {
        expect(missingSetupSteps(complete)).toEqual([]);
        expect(isSetupComplete(complete)).toBe(true);
    });
});

describe('safeNextPath', () => {
    it('keeps paths on this site', () => {
        expect(safeNextPath('/dashboard', locales)).toBe('/dashboard');
        expect(safeNextPath('/orgs/sbma?tab=requests', locales)).toBe(
            '/orgs/sbma?tab=requests'
        );
    });

    it('drops a locale prefix (the redirect adds one)', () => {
        expect(safeNextPath('/es/dashboard', locales)).toBe('/dashboard');
        expect(safeNextPath('/es', locales)).toBe('/');
    });

    it('rejects other sites and junk', () => {
        for (const next of [
            'https://evil.com',
            '//evil.com',
            '/\\evil.com',
            'welcome',
            '/wel\ncome',
            undefined,
            ['/dashboard'],
        ]) {
            expect(safeNextPath(next, locales)).toBe('/dashboard');
        }
    });

    it('never points back at setup', () => {
        expect(safeNextPath('/account/setup', locales)).toBe('/dashboard');
        expect(safeNextPath('/en/account/setup?next=/x', locales)).toBe(
            '/dashboard'
        );
    });
});
