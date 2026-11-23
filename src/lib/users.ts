import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { cacheLife, cacheTag } from 'next/cache';
import { cache } from 'react';

import type { GeneralArea } from '@/lib/places';

import { getAdminDb } from '@/lib/firebase/admin';
import { logRead } from '@/lib/firebase/read-log';

// users/{uid}: the public-safe profile for an account. Email and password
// live in Firebase Auth only. Rules deny client access; read and write here
// through the Admin SDK.
//
// Accounts can exist without a profile (prototype users, or someone who
// stopped after sign-up), and new required fields can be added later, so every
// field is optional. src/lib/account-setup.ts decides what's still missing.
//
// Caching (documentation/technical/firebase.md → "Caching reads"):
// getUserProfile is cached on the server per user, tagged `user:{uid}`, and
// the tag is cleared in the action that saves the profile. Use
// getUserProfileFresh when a decision must not rest on a stale copy.

export interface UserProfile {
    displayName?: string;
    location?: GeneralArea;
    /** Preferred language for emails and notifications. */
    locale?: string;
}

/** A profile that has passed account setup. */
export type CompleteUserProfile = UserProfile &
    Required<Pick<UserProfile, 'displayName' | 'location' | 'locale'>>;

const users = () => getAdminDb().collection('users');

/** Cache tag for everything derived from one user's profile. */
export const userTag = (uid: string) => `user:${uid}`;

async function readProfile(uid: string): Promise<UserProfile | null> {
    logRead('users');
    const snapshot = await users().doc(uid).get();
    if (!snapshot.exists) return null;
    // Only plain fields: cached values must be serializable (no Timestamps).
    const { displayName, location, locale } = snapshot.data() as UserProfile;
    return { displayName, location, locale };
}

/**
 * The profile, cached across requests for up to an hour and cleared when
 * it's saved. Fine for showing things (header name, dashboard, form defaults).
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    'use cache';
    cacheTag(userTag(uid));
    cacheLife('hours');
    return readProfile(uid);
}

/** Straight from Firestore (once per request), for decisions like "is setup done?". */
export const getUserProfileFresh = cache(readProfile);

/** Creates the profile or merges into it. `createdAt` is set only the first time. */
export async function saveUserProfile(
    uid: string,
    fields: Pick<UserProfile, 'displayName' | 'location' | 'locale'>
): Promise<void> {
    const ref = users().doc(uid);
    await getAdminDb().runTransaction(async (tx) => {
        logRead('users (save)');
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
