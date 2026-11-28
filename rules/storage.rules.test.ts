// Storage rules tests, against the Storage emulator (`pnpm test:rules`).
// Photos are written only by the server (Admin SDK, which skips the rules)
// and read through download-token links (which Firebase serves without the
// rules), so the rules deny every client. These tests prove it, so opening
// a path later is a deliberate change with its own tests.
// See documentation/technical/firebase.md → "Storage (photos)".

import { readFileSync } from 'node:fs';

import {
    assertFails,
    initializeTestEnvironment,
    type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
    deleteObject,
    getBytes,
    listAll,
    ref,
    uploadBytes,
    type FirebaseStorage,
} from 'firebase/storage';
import { afterAll, beforeAll, describe, it } from 'vitest';

let env: RulesTestEnvironment;

beforeAll(async () => {
    const [host, port] = (
        process.env.FIREBASE_STORAGE_EMULATOR_HOST ?? '127.0.0.1:9199'
    ).split(':');
    env = await initializeTestEnvironment({
        projectId: 'demo-communalists',
        storage: {
            host,
            port: Number(port),
            rules: readFileSync('storage.rules', 'utf8'),
        },
    });
});

afterAll(async () => {
    await env?.cleanup();
});

/** Files the app stores (src/lib/photos: photoPath). */
const PATHS = [
    'photos/users/someone/abc-500.webp',
    'photos/users/someone/abc-128.webp',
    'photos/organizations/org1/abc-500.webp',
    'anything/else.txt',
];

// The test contexts are typed as the compat SDK, but work with the modular
// functions (as the library's own docs show).
const asModular = (storage: unknown) => storage as FirebaseStorage;
const clients: [string, () => FirebaseStorage][] = [
    ['signed out', () => asModular(env.unauthenticatedContext().storage())],
    [
        'signed in',
        () => asModular(env.authenticatedContext('someone').storage()),
    ],
    [
        'signed in as the owner of the folder',
        () => asModular(env.authenticatedContext('org1').storage()),
    ],
];

describe.each(clients)('a %s client', (_who, storage) => {
    it.each(PATHS)('can’t read %s', async (path) => {
        await assertFails(getBytes(ref(storage(), path)));
    });

    it.each(PATHS)('can’t write %s', async (path) => {
        await assertFails(
            uploadBytes(ref(storage(), path), new Uint8Array([1, 2, 3]), {
                contentType: 'image/webp',
            })
        );
    });

    it.each(PATHS)('can’t delete %s', async (path) => {
        await assertFails(deleteObject(ref(storage(), path)));
    });

    it('can’t list photos', async () => {
        await assertFails(listAll(ref(storage(), 'photos')));
    });
});
