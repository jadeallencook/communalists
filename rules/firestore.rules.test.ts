// Security rules tests, against the Firestore emulator (`pnpm test:rules`).
// Every read and write in the app goes through the Admin SDK, which skips the
// rules, so the rules deny every client: signed out, signed in, or a super
// user's account. These tests prove it for each collection we store, so
// opening one later is a deliberate change with its own tests.
// See documentation/technical/firebase.md → "Security in the rebuild".

import { readFileSync } from 'node:fs';

import {
    assertFails,
    initializeTestEnvironment,
    type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    setDoc,
    type Firestore,
} from 'firebase/firestore';
import { afterAll, beforeAll, describe, it } from 'vitest';

let env: RulesTestEnvironment;

beforeAll(async () => {
    const [host, port] = (
        process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080'
    ).split(':');
    env = await initializeTestEnvironment({
        // The dev emulators' project (firebase.json is in single-project
        // mode). Nothing is written, so a running `pnpm dev` keeps its data.
        projectId: 'demo-communalists',
        firestore: {
            host,
            port: Number(port),
            rules: readFileSync('firestore.rules', 'utf8'),
        },
    });
});

afterAll(async () => {
    await env?.cleanup();
});

/** Documents in every collection the app stores (and planned ones). */
const PATHS = [
    'users/someone',
    'usernames/someone',
    'organizations/org1',
    'organizations/org1/moderationLog/entry1',
    'memberships/org1_someone',
    'handles/some-handle',
    'claimRequests/org1_someone',
    'adminLog/entry1',
    'definitions/mutual-aid',
    // Comments on a word (features/20): the comments, one vote per person
    // per comment, open reports and the per-person rate limit.
    'definitions/mutual-aid/comments/c1',
    'definitions/mutual-aid/commentVotes/c1_someone',
    'commentReports/definition~mutual-aid~c1',
    'commentLimits/someone',
    // Comments on an organization's page (decision #70), the reply on the
    // comment itself, and a report on a reply.
    'organizations/org1/comments/c1',
    'organizations/org1/commentVotes/c1_someone',
    'commentReports/organization~org1~c1~reply',
    // Endorsements (decision #73): one per person per organization.
    'endorsements/org1_someone',
    // Comrades and notifications (decision #74): one per pair, one per
    // thing per person.
    'comradeships/other_someone',
    'notifications/comradeRequest~other_someone~someone',
];

// The test contexts are typed as the compat SDK, but work with the modular
// functions (as the library's own docs show).
const asModular = (db: unknown) => db as Firestore;
const clients: [string, () => Firestore][] = [
    ['signed out', () => asModular(env.unauthenticatedContext().firestore())],
    [
        'signed in',
        () => asModular(env.authenticatedContext('someone').firestore()),
    ],
];

describe.each(clients)('a %s client', (_who, db) => {
    it.each(PATHS)('can’t read %s', async (path) => {
        await assertFails(getDoc(doc(db(), path)));
    });

    it.each(PATHS)('can’t write %s', async (path) => {
        await assertFails(setDoc(doc(db(), path), { any: 'thing' }));
    });

    it.each(PATHS)('can’t delete %s', async (path) => {
        await assertFails(deleteDoc(doc(db(), path)));
    });

    it.each([
        'definitions',
        'organizations',
        'adminLog',
        'definitions/mutual-aid/comments',
        'organizations/org1/comments',
        'commentReports',
        'comradeships',
        'notifications',
    ])('can’t list %s', async (name) => {
        await assertFails(getDocs(collection(db(), name)));
    });
});
