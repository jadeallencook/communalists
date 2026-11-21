import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import {
    connectFirestoreEmulator,
    getFirestore,
    type Firestore,
} from 'firebase/firestore';

// Browser-side Firebase. Everything is created lazily so importing this file
// never initializes Firebase during the build or on the server.
//
// NEXT_PUBLIC_* values are inlined at build time, so each must be referenced
// by its literal name (no dynamic `process.env[key]`).
const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';

let auth: Auth | undefined;
let db: Firestore | undefined;

export function getFirebaseApp(): FirebaseApp {
    return getApps().length ? getApp() : initializeApp(config);
}

export function getClientAuth(): Auth {
    if (!auth) {
        auth = getAuth(getFirebaseApp());
        if (useEmulators) {
            connectAuthEmulator(auth, 'http://127.0.0.1:9099', {
                disableWarnings: true,
            });
        }
    }
    return auth;
}

export function getClientDb(): Firestore {
    if (!db) {
        db = getFirestore(getFirebaseApp());
        if (useEmulators) connectFirestoreEmulator(db, '127.0.0.1', 8080);
    }
    return db;
}
