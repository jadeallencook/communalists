// Local development tools (the dev toolbar). Pure: no React, Next or Firebase.
// See documentation/technical/tooling-and-ci.md → "Dev toolbar".

import seed from '../../../scripts/seed-data.json';

export type Env = Record<string, string | undefined>;

/**
 * True only for `next dev` against the Firebase emulators on a `demo-`
 * project, never anything that could hold real accounts. The dev toolbar
 * renders only when this is true, and its server actions check it again:
 * actions can be called directly even when no button shows them.
 */
export function isLocalDev(env: Env): boolean {
    return (
        env.NODE_ENV === 'development' &&
        !env.VERCEL &&
        !env.FIREBASE_SERVICE_ACCOUNT_KEY &&
        !!env.FIRESTORE_EMULATOR_HOST &&
        !!env.FIREBASE_AUTH_EMULATOR_HOST &&
        (env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '').startsWith('demo-')
    );
}

export interface TestAccount {
    uid: string;
    email: string;
    /** One line for the toolbar: who this account is and what it's for. */
    summary: string;
    /** Listed first in the toolbar; the rest go under "More accounts". */
    featured: boolean;
}

const roleWords = {
    owner: 'owns',
    moderator: 'moderates',
    member: 'member of',
};
type Role = keyof typeof roleWords;
const roleOrder = Object.keys(roleWords) as Role[];

/**
 * The seeded accounts (scripts/seed-data.json), described for the toolbar.
 * The `"featured": true` ones cover the main test cases; the rest fill out
 * member lists.
 */
export const TEST_ACCOUNTS: TestAccount[] = seed.users.map((user) => {
    // Owned groups first: the line is truncated in the toolbar.
    const roles = seed.organizations
        .flatMap(({ name, members }) =>
            members
                .filter(([uid]) => uid === user.uid)
                .map(([, role]) => ({ name, role: role as Role }))
        )
        .sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role))
        .map(({ name, role }) => `${roleWords[role]} ${name}`);
    const profile =
        'profile' in user && user.profile
            ? `${user.profile.displayName} (${user.profile.locale})`
            : 'No profile: goes to account setup';
    return {
        uid: user.uid,
        email: user.email,
        summary: [profile, ...roles].join(' · '),
        featured: 'featured' in user && user.featured === true,
    };
});

export const TEST_PASSWORD = seed.password;

export const isTestAccount = (email: string) =>
    TEST_ACCOUNTS.some((account) => account.email === email);

/** What the seed writes, so a reset can clear exactly those cache entries. */
export const SEEDED = {
    uids: seed.users.map((u) => u.uid),
    organizations: seed.organizations.map(({ id, handle }) => ({ id, handle })),
};
