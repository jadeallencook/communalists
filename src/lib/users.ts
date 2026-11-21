import 'server-only';

import { FieldValue, type Timestamp } from 'firebase-admin/firestore';

import { getAdminDb } from '@/lib/firebase/admin';
import type { GeneralArea } from '@/lib/places';

// users/{uid}: the public-safe profile for an account. Email and password
// live in Firebase Auth only. Rules deny client access; read and write here
// through the Admin SDK.

export interface UserProfile {
    displayName: string;
    location: GeneralArea;
    locale: string;
    createdAt?: Timestamp;
}

const users = () => getAdminDb().collection('users');

export async function createUserProfile(
    uid: string,
    profile: Omit<UserProfile, 'createdAt'>
): Promise<void> {
    await users()
        .doc(uid)
        .create({ ...profile, createdAt: FieldValue.serverTimestamp() });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const snapshot = await users().doc(uid).get();
    return snapshot.exists ? (snapshot.data() as UserProfile) : null;
}
