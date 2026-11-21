import 'server-only';

import { FieldValue, type Timestamp } from 'firebase-admin/firestore';

import type { GeneralArea } from '@/lib/places';

import { getAdminDb } from '@/lib/firebase/admin';

// users/{uid}: the public-safe profile for an account. Email and password
// live in Firebase Auth only. Rules deny client access; read and write here
// through the Admin SDK.
//
// Accounts can exist without a profile (prototype users, or someone who
// stopped after sign-up), and new required fields can be added later, so every
// field is optional. src/lib/account-setup.ts decides what's still missing.

export interface UserProfile {
    displayName?: string;
    location?: GeneralArea;
    /** Preferred language for emails and notifications. */
    locale?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

/** A profile that has passed account setup. */
export type CompleteUserProfile = UserProfile &
    Required<Pick<UserProfile, 'displayName' | 'location' | 'locale'>>;

const users = () => getAdminDb().collection('users');

/** Creates the profile or merges into it. `createdAt` is set only the first time. */
export async function saveUserProfile(
    uid: string,
    fields: Pick<UserProfile, 'displayName' | 'location' | 'locale'>
): Promise<void> {
    const ref = users().doc(uid);
    await getAdminDb().runTransaction(async (tx) => {
        const existing = await tx.get(ref);
        tx.set(
            ref,
            {
                ...fields,
                updatedAt: FieldValue.serverTimestamp(),
                ...(existing.exists
                    ? {}
                    : { createdAt: FieldValue.serverTimestamp() }),
            },
            { merge: true }
        );
    });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const snapshot = await users().doc(uid).get();
    return snapshot.exists ? (snapshot.data() as UserProfile) : null;
}
