import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { cacheLife, cacheTag } from 'next/cache';
import { cache } from 'react';

import type { GeneralArea } from '@/lib/places';

import { getAdminDb } from '@/lib/firebase/admin';
import { logRead } from '@/lib/firebase/read-log';
import {
    claimBlocks,
    handleHeldUntil,
    nextHandleChangeAt,
} from '@/lib/organizations/handle';
import { photoOf, type Photo } from '@/lib/photos';
import { profileSettingsOf, type ProfileSettings } from '@/lib/profiles';

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
    /** The profile address, /comrade/{username}. Claimed in usernames/{username}. */
    username?: string;
    /** When the username last changed (epoch ms), for the 30-day limit. */
    usernameChangedAt?: number;
    /** What they share on their profile, and with whom (src/lib/profiles.ts). */
    profile: ProfileSettings;
    /** Their profile photo, if any. Shown as their visibility allows. */
    photo?: Photo;
}

/** A profile that has passed account setup. */
export type CompleteUserProfile = UserProfile &
    Required<
        Pick<UserProfile, 'displayName' | 'location' | 'locale' | 'username'>
    >;

const users = () => getAdminDb().collection('users');
const usernames = () => getAdminDb().collection('usernames');

const millis = (value: unknown) =>
    value && typeof (value as { toMillis?: unknown }).toMillis === 'function'
        ? (value as { toMillis: () => number }).toMillis()
        : undefined;

/** Cache tag for everything derived from one user's profile. */
export const userTag = (uid: string) => `user:${uid}`;
/** Cache tag for looking a username up. */
export const usernameTag = (username: string) => `username:${username}`;

async function readProfile(uid: string): Promise<UserProfile | null> {
    logRead('users');
    const snapshot = await users().doc(uid).get();
    if (!snapshot.exists) return null;
    // Only plain fields: cached values must be serializable (no Timestamps).
    const d = snapshot.data()!;
    return {
        displayName: d.displayName,
        location: d.location,
        locale: d.locale,
        username: d.username,
        usernameChangedAt: millis(d.usernameChangedAt),
        profile: profileSettingsOf(d.profile),
        photo: photoOf(d.photo),
    };
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

/**
 * Straight from Firestore every call, not once per request: for reading
 * back what an action just wrote (getUserProfileFresh may hold the copy
 * from before the write).
 */
export const getUserProfileAfterWrite = readProfile;

export type SaveProfileResult =
    | { ok: true; usernameChanged: boolean; previousUsername?: string }
    | { ok: false; error: 'usernameTaken' | 'usernameCooldown' };

/**
 * Creates the profile or merges into it (`createdAt` only the first time).
 * A new username is claimed in the same transaction: it must be free (or
 * this person's own), and a change is allowed once every 30 days, with the
 * old username held for 30 days, like group handles.
 */
export async function saveUserProfile(
    uid: string,
    fields: Pick<UserProfile, 'displayName' | 'location' | 'locale'> & {
        username: string;
    }
): Promise<SaveProfileResult> {
    const ref = users().doc(uid);
    const newClaimRef = usernames().doc(fields.username);
    return getAdminDb().runTransaction(async (tx) => {
        logRead('users (save)');
        const existing = await tx.get(ref);
        const current = existing.data();
        const previous: string | undefined = current?.username;
        const changed = previous !== fields.username;
        const now = Date.now();
        if (changed) {
            // The first username is free to pick; later changes wait 30 days.
            if (
                previous &&
                nextHandleChangeAt(millis(current?.usernameChangedAt), now) !==
                    null
            )
                return { ok: false, error: 'usernameCooldown' } as const;
            logRead('usernames');
            const claim = await tx.get(newClaimRef);
            const claimData = claim.data();
            if (
                claimBlocks(
                    claim.exists
                        ? {
                              orgId: claimData!.uid,
                              heldUntil: millis(claimData!.heldUntil),
                          }
                        : null,
                    uid,
                    now
                )
            )
                return { ok: false, error: 'usernameTaken' } as const;
        }
        const stamp = FieldValue.serverTimestamp();
        tx.set(
            ref,
            {
                ...fields,
                updatedAt: stamp,
                ...(existing.exists ? {} : { createdAt: stamp }),
                ...(changed && previous ? { usernameChangedAt: stamp } : {}),
            },
            { merge: true }
        );
        if (changed) {
            tx.set(newClaimRef, { uid, createdAt: stamp });
            if (previous) {
                // Old profile links stop working; nobody else can take it for 30 days.
                tx.set(usernames().doc(previous), {
                    uid,
                    heldUntil: new Date(handleHeldUntil(now)),
                    createdAt: stamp,
                });
            }
        }
        return {
            ok: true,
            usernameChanged: changed,
            previousUsername: previous,
        } as const;
    });
}

/** Saves what they share on their profile (the settings page). */
export async function saveProfileSettings(
    uid: string,
    settings: ProfileSettings
): Promise<void> {
    await users()
        .doc(uid)
        .set(
            {
                profile: JSON.parse(JSON.stringify(settings)), // drop undefined
                updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
        );
}

/**
 * Points the profile at a new photo, or none, in a transaction, and returns
 * the one it replaced so the caller can delete its files.
 */
export async function setUserPhoto(
    uid: string,
    photo: Photo | null
): Promise<Photo | undefined> {
    const ref = users().doc(uid);
    return getAdminDb().runTransaction(async (tx) => {
        logRead('users (photo)');
        const previous = photoOf((await tx.get(ref)).data()?.photo);
        tx.set(
            ref,
            {
                photo: photo ?? FieldValue.delete(),
                updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
        );
        return previous;
    });
}

/**
 * A super user removes someone's photo as moderation (decision #71): the
 * profile stops pointing at it, and adminLog records who, why and whose.
 * Returns the removed photo so the caller can delete its files, or
 * undefined if there was none.
 */
export async function removeUserPhotoAsModerator(
    uid: string,
    actorUid: string,
    reason: string
): Promise<Photo | undefined> {
    const ref = users().doc(uid);
    return getAdminDb().runTransaction(async (tx) => {
        logRead('users (photo)');
        const data = (await tx.get(ref)).data();
        const previous = photoOf(data?.photo);
        if (!previous) return undefined;
        const stamp = FieldValue.serverTimestamp();
        tx.update(ref, { photo: FieldValue.delete(), updatedAt: stamp });
        tx.create(getAdminDb().collection('adminLog').doc(), {
            action: 'removePhoto',
            target: { uid, displayName: data?.displayName ?? '' },
            reason,
            actorUid,
            createdAt: stamp,
        });
        return previous;
    });
}

/** Whether a username is taken by someone else (or held). Always fresh. */
export async function isUsernameTaken(
    username: string,
    uid: string | null
): Promise<boolean> {
    logRead('usernames');
    const claim = await usernames().doc(username).get();
    const d = claim.data();
    return claimBlocks(
        claim.exists
            ? { orgId: d!.uid, heldUntil: millis(d!.heldUntil) }
            : null,
        uid,
        Date.now()
    );
}

/**
 * Whose profile lives at this username, cached. A held (old) username
 * resolves to nobody: the account's current username must match.
 */
export async function getUidByUsername(
    username: string
): Promise<string | null> {
    'use cache';
    cacheTag(usernameTag(username));
    cacheLife('hours');
    logRead('usernames');
    const claim = await usernames().doc(username).get();
    const uid = claim.data()?.uid as string | undefined;
    if (!uid) return null;
    cacheTag(userTag(uid));
    const profile = await readProfile(uid);
    return profile?.username === username ? uid : null;
}
