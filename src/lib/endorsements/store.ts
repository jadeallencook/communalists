import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { cacheLife, cacheTag } from 'next/cache';

import { getAdminDb } from '@/lib/firebase/admin';
import { logRead } from '@/lib/firebase/read-log';
import { getOrganizationById } from '@/lib/organizations';
import type { ProfileEndorsement } from '@/lib/profiles';

import { canBeEndorsed, endorsementId } from '.';

// Endorsements in Firestore (design: documentation/features/17-profiles.md).
//
//   endorsements/{orgId}_{uid}   { orgId, uid, createdAt }
//   organizations/{orgId}        endorsementCount, kept in the same transaction
//
// No copy of the organization is stored: profiles read each one through the
// cached getOrganizationById, so a rename or new logo shows without syncing.
// Server only (Admin SDK); rules deny clients.

const db = () => getAdminDb();
const endorsements = () => db().collection('endorsements');
const millis = (value: unknown) =>
    value && typeof (value as { toMillis?: unknown }).toMillis === 'function'
        ? (value as { toMillis: () => number }).toMillis()
        : 0;

/** A person's endorsements. Cleared when they endorse or take one back. */
export const endorsementsTag = (uid: string) => `endorsements:${uid}`;

/** The organizations a person endorses (ids, newest first), cached. */
export async function getEndorsedOrgIds(uid: string): Promise<string[]> {
    'use cache';
    cacheTag(endorsementsTag(uid));
    cacheLife('hours');
    const snapshot = await endorsements().where('uid', '==', uid).get();
    logRead('endorsements', Math.max(snapshot.size, 1));
    return snapshot.docs
        .map((doc) => ({
            orgId: doc.data().orgId as string,
            at: millis(doc.data().createdAt),
        }))
        .sort((a, b) => b.at - a.at)
        .map((e) => e.orgId);
}

/**
 * A person's endorsements for their profile, newest first, with each
 * organization's current name and logo. Archived organizations drop out;
 * src/lib/profiles.ts decides which a viewer may see. Cached reads.
 */
export async function getProfileEndorsements(
    uid: string
): Promise<ProfileEndorsement[]> {
    const ids = await getEndorsedOrgIds(uid);
    const orgs = await Promise.all(ids.map((id) => getOrganizationById(id)));
    return orgs.flatMap((org) =>
        org && org.status === 'active'
            ? [
                  {
                      orgId: org.id,
                      name: org.name,
                      handle: org.handle,
                      photo: org.photo?.small,
                      listed: org.visibility === 'listed',
                  },
              ]
            : []
    );
}

export type SetEndorsementResult =
    | { ok: true; endorsed: boolean; count: number }
    | { ok: false; error: 'notFound' };

/**
 * Endorses an organization, or takes it back, in a transaction that keeps
 * the organization's count. Endorsing needs a listed, active organization;
 * taking one back always works. Doing what's already done changes nothing.
 */
export async function setEndorsement(
    orgId: string,
    uid: string,
    endorse: boolean
): Promise<SetEndorsementResult> {
    const orgRef = db().collection('organizations').doc(orgId);
    const ref = endorsements().doc(endorsementId(orgId, uid));
    return db().runTransaction(async (tx) => {
        const [orgSnap, snap] = await Promise.all([
            tx.get(orgRef),
            tx.get(ref),
        ]);
        logRead('endorsements (set)', 2);
        if (!orgSnap.exists) return { ok: false, error: 'notFound' } as const;
        const org = orgSnap.data()!;
        const count = (org.endorsementCount as number | undefined) ?? 0;
        if (snap.exists === endorse)
            return { ok: true, endorsed: endorse, count } as const;
        if (endorse) {
            if (!canBeEndorsed(org as Parameters<typeof canBeEndorsed>[0]))
                return { ok: false, error: 'notFound' } as const;
            tx.create(ref, {
                orgId,
                uid,
                createdAt: FieldValue.serverTimestamp(),
            });
        } else tx.delete(ref);
        const total = Math.max(0, count + (endorse ? 1 : -1));
        tx.update(orgRef, { endorsementCount: total });
        return { ok: true, endorsed: endorse, count: total } as const;
    });
}
