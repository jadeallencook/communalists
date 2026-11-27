import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { cacheLife, cacheTag } from 'next/cache';

import { getAdminDb } from '@/lib/firebase/admin';
import { logRead } from '@/lib/firebase/read-log';
import { effectiveRole } from '@/lib/platform-admin';

import { handleHeldUntil } from './handle';
import {
    canDelete,
    canRestore,
    deleteConfirmed,
    RESTORE_DAYS,
    makeUnclaimedProblem,
    type MakeUnclaimedProblem,
} from './lifecycle';
import type { MembershipStatus, OrgRole } from './membership';

// Deleting (archiving), restoring, and making an organization unclaimed, in
// Firestore. Rules: ./lifecycle.ts. Design: features/16 → "Deleting" and
// features/18 → "Making an organization unclaimed".
//
// Deleting archives: the organization's status becomes `archived`, its
// handle is held for 30 days, and every membership becomes `archived` with
// its old status kept in `previousStatus`, so dashboards, owner limits and
// member lists drop it without any other query changing. A super user can
// restore it within 30 days.

const db = () => getAdminDb();
const organizations = () => db().collection('organizations');
const memberships = () => db().collection('memberships');
const millis = (value: unknown) =>
    value && typeof (value as { toMillis?: unknown }).toMillis === 'function'
        ? (value as { toMillis: () => number }).toMillis()
        : undefined;

/** Recently deleted organizations (the restore list on /admin). */
export const DELETED_TAG = 'deleted';

/** Sets every membership of an organization from one status to another, in batches. */
async function setMembershipStatuses(
    orgId: string,
    change: 'archive' | 'restore'
): Promise<string[]> {
    const snapshot = await memberships().where('orgId', '==', orgId).get();
    logRead('memberships', Math.max(snapshot.size, 1));
    const docs = snapshot.docs.filter((doc) =>
        change === 'archive'
            ? doc.data().status !== 'archived'
            : doc.data().status === 'archived'
    );
    for (let i = 0; i < docs.length; i += 400) {
        const batch = db().batch();
        for (const doc of docs.slice(i, i + 400)) {
            const d = doc.data();
            batch.update(
                doc.ref,
                change === 'archive'
                    ? { status: 'archived', previousStatus: d.status }
                    : {
                          status:
                              (d.previousStatus as MembershipStatus) ??
                              'active',
                          previousStatus: FieldValue.delete(),
                      }
            );
        }
        await batch.commit();
    }
    return docs.map((doc) => doc.data().uid as string);
}

export type DeleteResult =
    | { ok: true; handle: string; memberUids: string[] }
    | { ok: false; error: 'notAllowed' | 'notFound' | 'notConfirmed' };

/**
 * An owner deletes (archives) the organization after typing its name. Super
 * users count as owners of unclaimed organizations. Checked on fresh data.
 */
export async function deleteOrganization(
    orgId: string,
    actor: { uid: string; displayName: string; platformAdmin: boolean },
    typedName: string
): Promise<DeleteResult> {
    const orgRef = organizations().doc(orgId);
    const actorRef = memberships().doc(`${orgId}_${actor.uid}`);
    const now = Date.now();
    const result = await db().runTransaction(async (tx) => {
        logRead('organizations');
        logRead('memberships');
        const [orgSnap, actorSnap] = await Promise.all([
            tx.get(orgRef),
            tx.get(actorRef),
        ]);
        const org = orgSnap.data();
        if (!org || org.status !== 'active')
            return { ok: false, error: 'notFound' } as const;
        const unclaimed = org.claimStatus === 'unclaimed';
        const member = actorSnap.data();
        const role = effectiveRole(
            member?.status === 'active' ? (member.role as OrgRole) : null,
            { unclaimed },
            actor.platformAdmin
        );
        if (!canDelete(role))
            return { ok: false, error: 'notAllowed' } as const;
        if (!deleteConfirmed(typedName, org.name))
            return { ok: false, error: 'notConfirmed' } as const;

        const stamp = FieldValue.serverTimestamp();
        tx.update(orgRef, {
            status: 'archived',
            archivedAt: stamp,
            archivedBy: actor.uid,
            updatedAt: stamp,
        });
        // Nobody else can take the address for 30 days (old flyers and links).
        tx.set(db().collection('handles').doc(org.handle), {
            orgId,
            heldUntil: new Date(handleHeldUntil(now)),
            createdAt: stamp,
        });
        tx.create(orgRef.collection('moderationLog').doc(), {
            action: 'deleteOrganization',
            actor: unclaimed
                ? { uid: actor.uid, team: true }
                : { uid: actor.uid, displayName: actor.displayName },
            createdAt: stamp,
        });
        if (unclaimed)
            tx.create(db().collection('adminLog').doc(), {
                action: 'deleteUnclaimed',
                orgId,
                orgName: org.name,
                actorUid: actor.uid,
                createdAt: stamp,
            });
        return { ok: true, handle: org.handle as string } as const;
    });
    if (!result.ok) return result;
    // After the transaction, so a big group doesn't hit the write limit.
    const memberUids = await setMembershipStatuses(orgId, 'archive');
    return { ...result, memberUids };
}

export interface DeletedOrganization {
    id: string;
    name: string;
    handle: string;
    archivedAt: number;
}

/** Organizations deleted in the last 30 days, newest first, cached. Super users only. */
export async function getRecentlyDeleted(): Promise<DeletedOrganization[]> {
    'use cache';
    cacheTag(DELETED_TAG);
    cacheLife('minutes');
    // Restoring removes archivedAt, so a range on it alone finds what's still
    // deleted (one field: no composite index). The cutoff is checked again in
    // memory with the exact rule.
    const snapshot = await organizations()
        .where(
            'archivedAt',
            '>=',
            new Date(Date.now() - RESTORE_DAYS * 86_400_000)
        )
        .get();
    logRead('organizations', Math.max(snapshot.size, 1));
    const now = Date.now();
    return snapshot.docs
        .flatMap((doc) => {
            const d = doc.data();
            const archivedAt = millis(d.archivedAt);
            return canRestore(archivedAt, now)
                ? [
                      {
                          id: doc.id,
                          name: d.name as string,
                          handle: d.handle as string,
                          archivedAt: archivedAt!,
                      },
                  ]
                : [];
        })
        .sort((a, b) => b.archivedAt - a.archivedAt);
}

export type RestoreResult =
    | { ok: true; handle: string; memberUids: string[] }
    | { ok: false; error: 'notFound' | 'tooLate' | 'handleTaken' };

/** A super user restores an organization deleted in the last 30 days. */
export async function restoreOrganization(
    adminUid: string,
    orgId: string
): Promise<RestoreResult> {
    const orgRef = organizations().doc(orgId);
    const result = await db().runTransaction(async (tx) => {
        logRead('organizations');
        const orgSnap = await tx.get(orgRef);
        const org = orgSnap.data();
        if (!org || org.status !== 'archived')
            return { ok: false, error: 'notFound' } as const;
        if (!canRestore(millis(org.archivedAt), Date.now()))
            return { ok: false, error: 'tooLate' } as const;
        const handleRef = db().collection('handles').doc(org.handle);
        logRead('handles');
        const claim = (await tx.get(handleRef)).data();
        if (claim && claim.orgId !== orgId)
            return { ok: false, error: 'handleTaken' } as const;

        const stamp = FieldValue.serverTimestamp();
        tx.update(orgRef, {
            status: 'active',
            archivedAt: FieldValue.delete(),
            archivedBy: FieldValue.delete(),
            updatedAt: stamp,
        });
        tx.set(handleRef, { orgId, createdAt: stamp });
        tx.create(orgRef.collection('moderationLog').doc(), {
            action: 'restoreOrganization',
            actor: { uid: adminUid, team: true },
            createdAt: stamp,
        });
        tx.create(db().collection('adminLog').doc(), {
            action: 'restoreOrganization',
            orgId,
            orgName: org.name,
            actorUid: adminUid,
            createdAt: stamp,
        });
        return { ok: true, handle: org.handle as string } as const;
    });
    if (!result.ok) return result;
    const memberUids = await setMembershipStatuses(orgId, 'restore');
    return { ...result, memberUids };
}

export type MakeUnclaimedResult =
    | { ok: true; handle: string; removedUids: string[] }
    | { ok: false; error: MakeUnclaimedProblem | 'notFound' };

/**
 * A super user who owns an organization (made by mistake without ticking
 * "unclaimed") hands it to the team: their membership and any join requests
 * are removed, and it becomes unclaimed with the same handle and details.
 * Only while they're its only active member.
 */
export async function makeOrganizationUnclaimed(
    adminUid: string,
    platformAdmin: boolean,
    orgId: string
): Promise<MakeUnclaimedResult> {
    const orgRef = organizations().doc(orgId);
    return db().runTransaction(async (tx) => {
        logRead('organizations');
        const orgSnap = await tx.get(orgRef);
        const org = orgSnap.data();
        if (!org || org.status !== 'active')
            return { ok: false, error: 'notFound' } as const;
        const people = await tx.get(memberships().where('orgId', '==', orgId));
        logRead('memberships', Math.max(people.size, 1));
        const mine = people.docs
            .find((doc) => doc.data().uid === adminUid)
            ?.data();
        const problem = makeUnclaimedProblem({
            platformAdmin,
            role: mine?.status === 'active' ? (mine.role as OrgRole) : null,
            unclaimed: org.claimStatus === 'unclaimed',
            activeMembers: people.docs.filter(
                (doc) => doc.data().status === 'active'
            ).length,
        });
        if (problem) return { ok: false, error: problem } as const;

        const stamp = FieldValue.serverTimestamp();
        for (const doc of people.docs) tx.delete(doc.ref);
        tx.update(orgRef, {
            claimStatus: 'unclaimed',
            memberCount: 0,
            claimedBy: FieldValue.delete(),
            claimedAt: FieldValue.delete(),
            updatedAt: stamp,
        });
        tx.create(db().collection('adminLog').doc(), {
            action: 'makeUnclaimed',
            orgId,
            orgName: org.name,
            actorUid: adminUid,
            createdAt: stamp,
        });
        return {
            ok: true,
            handle: org.handle as string,
            removedUids: people.docs.map((doc) => doc.data().uid as string),
        } as const;
    });
}
