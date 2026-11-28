import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { getAdminDb } from '@/lib/firebase/admin';
import { logRead } from '@/lib/firebase/read-log';
import { notify, unnotify } from '@/lib/notifications/store';
import { profileSettingsOf, type ProfileComrade } from '@/lib/profiles';
import { getUserProfile } from '@/lib/users';

import {
    acceptedComrades,
    acceptsRequestsFrom,
    comradeshipOf,
    comradeState,
    pairId,
    pendingSentCount,
    sendOutcome,
    type Comradeship,
    type ComradeIntent,
    type ComradeState,
} from '.';

// Comradeships in Firestore (design: documentation/features/21-comrades.md).
//
//   comradeships/{low}_{high}   { uids: [low, high], from, to, status,
//                                 createdAt, respondedAt?, hiddenFromSender? }
//
// Times are epoch ms. Read with `uids array-contains` (a single-field index),
// cached per person and cleared for both people on every change. Every
// change runs in a transaction with its notifications. Server only (Admin
// SDK); rules deny clients.

const db = () => getAdminDb();
const comradeships = () => db().collection('comradeships');

/** One person's comradeships (all states). Cleared for both people on any change. */
export const comradesTag = (uid: string) => `comrades:${uid}`;

/** Everything between this person and others: requests both ways, comrades, declines. */
export async function getComradeships(uid: string): Promise<Comradeship[]> {
    'use cache';
    cacheTag(comradesTag(uid));
    cacheLife('hours');
    const snapshot = await comradeships()
        .where('uids', 'array-contains', uid)
        .get();
    logRead('comradeships', Math.max(snapshot.size, 1));
    return snapshot.docs.flatMap((doc) => {
        const pair = comradeshipOf(uid, doc.data());
        return pair ? [pair] : [];
    });
}

/** The uids of this person's comrades. */
export async function getComradeUids(uid: string): Promise<Set<string>> {
    const pairs = await getComradeships(uid);
    return new Set(acceptedComrades(pairs).map((p) => p.other));
}

/**
 * This person's comrades for their profile, most recent first, with each
 * one's current name, username, photo and visibility. Accounts that are
 * gone or never finished setup drop out. src/lib/profiles.ts decides which
 * a viewer may see.
 */
export async function getProfileComrades(
    uid: string
): Promise<ProfileComrade[]> {
    const pairs = acceptedComrades(await getComradeships(uid));
    const people = await Promise.all(pairs.map((p) => getUserProfile(p.other)));
    return pairs.flatMap((p, i) => {
        const person = people[i];
        if (!person?.displayName || !person.username) return [];
        return [
            {
                uid: p.other,
                name: person.displayName,
                username: person.username,
                photo: person.photo?.small,
                visibility: person.profile.visibility,
            },
        ];
    });
}

export type ChangeComradeshipResult =
    | {
          ok: true;
          /** What the viewer sees now. */
          state: ComradeState;
          /** Comrades were removed: both photos may need a new link. */
          removed?: boolean;
      }
    | { ok: false; error: 'notFound' | 'closed' | 'limit' };

/**
 * Sends, takes back, accepts, declines or ends a comradeship between
 * `viewer` and `other`, in one transaction with its notifications. Decided
 * on fresh data; a change that's already done (or no longer possible, like
 * accepting a request that was taken back) leaves things as they are and
 * reports the current state. `sharesGroup` is whether they share an active
 * group, for the other person's "who can send me requests" setting.
 */
export async function changeComradeship({
    viewer,
    other,
    intent,
    sharesGroup,
}: {
    viewer: string;
    other: string;
    intent: ComradeIntent;
    sharesGroup: boolean;
}): Promise<ChangeComradeshipResult> {
    if (viewer === other) return { ok: false, error: 'notFound' };
    const id = pairId(viewer, other);
    const ref = comradeships().doc(id);
    const otherRef = db().collection('users').doc(other);
    // Requests waiting from the viewer, for the limit. Cached, but cleared on
    // each of their changes, so it's current enough for a cap of 50.
    const pendingSent =
        intent === 'request'
            ? pendingSentCount(viewer, await getComradeships(viewer))
            : 0;

    return db().runTransaction(async (tx) => {
        const [snap, otherSnap] = await Promise.all([
            tx.get(ref),
            tx.get(otherRef),
        ]);
        logRead('comradeships (change)', 2);
        const now = Date.now();
        const pair = snap.exists ? comradeshipOf(viewer, snap.data()) : null;
        const current = () => comradeState(viewer, pair, now);
        const request = { kind: 'comradeRequest' as const, ref: id };
        const accepted = { kind: 'comradeAccepted' as const, ref: id };

        // They can't be asked if their account is gone or has no profile yet.
        const otherProfile = otherSnap.data();
        if (!otherProfile?.username && intent === 'request')
            return { ok: false, error: 'notFound' } as const;

        const accept = () => {
            tx.update(ref, { status: 'accepted', respondedAt: now });
            unnotify(tx, { uid: viewer, ...request });
            notify(tx, { uid: other, actor: viewer, ...accepted });
            return { ok: true, state: 'comrades' } as const;
        };

        switch (intent) {
            case 'request': {
                const outcome = sendOutcome({
                    sender: viewer,
                    pair,
                    now,
                    accepts: acceptsRequestsFrom(
                        profileSettingsOf(otherProfile?.profile).comrades
                            .requests,
                        sharesGroup
                    ),
                    pendingSent,
                });
                if (outcome === 'closed' || outcome === 'limit')
                    return { ok: false, error: outcome } as const;
                if (outcome === 'accept') return accept();
                if (outcome === 'silent') {
                    if (pair?.hiddenFromSender)
                        tx.update(ref, { hiddenFromSender: false });
                    return { ok: true, state: 'sent' } as const;
                }
                if (outcome === 'create') {
                    tx.set(ref, {
                        uids: [viewer, other].sort(),
                        from: viewer,
                        to: other,
                        status: 'pending',
                        createdAt: now,
                    });
                    notify(tx, { uid: other, actor: viewer, ...request });
                    return { ok: true, state: 'sent' } as const;
                }
                return { ok: true, state: current() } as const;
            }
            case 'cancel': {
                if (pair?.from !== viewer) break;
                if (pair.status === 'pending') {
                    tx.delete(ref);
                    unnotify(tx, { uid: other, ...request });
                    return { ok: true, state: 'none' } as const;
                }
                if (pair.status === 'declined') {
                    // Kept for the cooldown; it just stops showing as sent.
                    tx.update(ref, { hiddenFromSender: true });
                    return { ok: true, state: 'none' } as const;
                }
                break;
            }
            case 'accept': {
                if (pair?.status === 'pending' && pair.from === other)
                    return accept();
                break;
            }
            case 'decline': {
                if (pair?.status === 'pending' && pair.from === other) {
                    tx.update(ref, { status: 'declined', respondedAt: now });
                    unnotify(tx, { uid: viewer, ...request });
                    return { ok: true, state: 'none' } as const;
                }
                break;
            }
            case 'remove': {
                if (pair?.status === 'accepted') {
                    tx.delete(ref);
                    unnotify(tx, { uid: pair.from, ...accepted });
                    return { ok: true, state: 'none', removed: true } as const;
                }
                break;
            }
        }
        return { ok: true, state: current() } as const;
    });
}
