import { describe, expect, it } from 'vitest';

import { isLocalDev, isTestAccount, TEST_ACCOUNTS } from '.';

const local = {
    NODE_ENV: 'development',
    FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
    FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'demo-communalists',
};

describe('isLocalDev', () => {
    it('is true for next dev against the emulators on a demo project', () => {
        expect(isLocalDev(local)).toBe(true);
    });

    it('is false for anything that could hold real accounts', () => {
        for (const env of [
            { ...local, NODE_ENV: 'production' },
            { ...local, NODE_ENV: 'test' },
            { ...local, VERCEL: '1' },
            { ...local, FIREBASE_SERVICE_ACCOUNT_KEY: '{}' },
            { ...local, FIRESTORE_EMULATOR_HOST: undefined },
            { ...local, FIREBASE_AUTH_EMULATOR_HOST: '' },
            { ...local, NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'communalists' },
            { ...local, NEXT_PUBLIC_FIREBASE_PROJECT_ID: undefined },
            {},
        ]) {
            expect(isLocalDev(env)).toBe(false);
        }
    });
});

describe('TEST_ACCOUNTS', () => {
    it('lists the seeded accounts with what each is for', () => {
        expect(TEST_ACCOUNTS.map((a) => a.email)).toEqual([
            'comrade1@communalists.com',
            'comrade2@communalists.com',
            'comrade3@communalists.com',
        ]);
        expect(TEST_ACCOUNTS[0].summary).toContain('owns South Bay Mutual Aid');
        expect(TEST_ACCOUNTS[0].summary).toContain(
            'moderates Oakland Auto Club'
        );
        expect(TEST_ACCOUNTS[2].summary).toContain('account setup');
    });

    it('only accepts seeded emails', () => {
        expect(isTestAccount('comrade1@communalists.com')).toBe(true);
        expect(isTestAccount('someone@example.com')).toBe(false);
    });
});
