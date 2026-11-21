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

// Server-side Firebase (Admin SDK). Use it from Server Components, Server
// Actions, and Route Handlers. It bypasses security rules, so every caller
// must check authorization itself.
//
// Credentials, in order of preference:
// 1. FIREBASE_SERVICE_ACCOUNT_KEY: the service-account JSON (Vercel env var).
// 2. Emulators: FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST set,
//    no credential needed.
// 3. Application Default Credentials (e.g. `gcloud auth application-default login`).
function getAdminApp(): App {
    if (getApps().length) return getApp();

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const usingEmulators = Boolean(
        process.env.FIRESTORE_EMULATOR_HOST ||
        process.env.FIREBASE_AUTH_EMULATOR_HOST
    );

    if (serviceAccount) {
        return initializeApp({
            credential: cert(JSON.parse(serviceAccount)),
            projectId,
        });
    }
    if (usingEmulators) return initializeApp({ projectId });
    return initializeApp({ credential: applicationDefault(), projectId });
}

export function getAdminAuth(): Auth {
    return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
    return getFirestore(getAdminApp());
}
