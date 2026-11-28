import 'server-only';

import {
    applicationDefault,
    cert,
    getApp,
    getApps,
    initializeApp,
    type App,
} from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Server-side Firebase (Admin SDK). Use it from Server Components, Server
// Actions, and Route Handlers. It bypasses security rules, so every caller
// must check authorization itself.
//
// Credentials, in order of preference:
// 1. FIREBASE_SERVICE_ACCOUNT_KEY: the service-account JSON (Vercel env var).
// 2. Emulators: FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST set,
//    no credential needed.
// 3. Application Default Credentials (e.g. `gcloud auth application-default login`).
const usingEmulators = () =>
    Boolean(
        process.env.FIRESTORE_EMULATOR_HOST ||
        process.env.FIREBASE_AUTH_EMULATOR_HOST
    );

/** The project's Storage bucket (Firebase's default name when unset). */
export function storageBucketName(): string {
    return (
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebasestorage.app`
    );
}

/**
 * Where download links point: the Storage emulator locally, Firebase
 * otherwise. Local .env.local files made before Storage existed don't set
 * the emulator host, so it defaults to firebase.json's port.
 */
export function storageDownloadHost(): string {
    if (usingEmulators()) {
        process.env.FIREBASE_STORAGE_EMULATOR_HOST ??= '127.0.0.1:9199';
        return `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}`;
    }
    return 'https://firebasestorage.googleapis.com';
}

function getAdminApp(): App {
    if (getApps().length) return getApp();

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const storageBucket = storageBucketName();
    // Sets the Storage emulator host before the SDK first reads it.
    storageDownloadHost();

    if (serviceAccount) {
        return initializeApp({
            credential: cert(JSON.parse(serviceAccount)),
            projectId,
            storageBucket,
        });
    }
    if (usingEmulators()) return initializeApp({ projectId, storageBucket });
    return initializeApp({
        credential: applicationDefault(),
        projectId,
        storageBucket,
    });
}

export function getAdminAuth(): Auth {
    return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
    return getFirestore(getAdminApp());
}

/** The Storage bucket (photos). Files are only ever written here, by the server. */
export function getAdminBucket() {
    // Named here, not only in initializeApp: an app made earlier in the
    // process (say, before a dev server reload) may not have it.
    storageDownloadHost(); // sets the emulator host first, locally
    return getStorage(getAdminApp()).bucket(storageBucketName());
}
