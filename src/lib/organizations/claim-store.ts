import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { cacheLife, cacheTag } from 'next/cache';

import { getAdminDb } from '@/lib/firebase/admin';
import { logRead } from '@/lib/firebase/read-log';

import {
    claimDecisionProblem,
    type AdminAction,
    type ClaimDecision,
    type ClaimDecisionProblem,
    type ClaimIntent,
    type ClaimRequestInput,
    type ClaimStatus,
} from './claims';
import type { MemberCopy } from './index';
import { MAX_OWNED_ORGANIZATIONS, type FocusArea } from './options';

// Unclaimed organizations and requests to claim them, in Firestore
// (design: documentation/features/18-unclaimed-organizations.md).
//
//   claimRequests/{orgId}_{uid}   one per person per organization: what they
//                                 asked (claim or remove), their role, how to
//                                 check it, and the decision
//   adminLog/{id}                 every super-user action, append-only
//
// Admin SDK only; rules deny clients. Only super users and the person who
// asked ever see a request.

const db = () => getAdminDb();
const requests = () => db().collection('claimRequests');
const requestId = (orgId: string, uid: string) => `${orgId}_${uid}`;
const millis = (value: unknown) =>
    value && typeof (value as { toMillis?: unknown }).toMillis === 'function'
        ? (value as { toMillis: () => number }).toMillis()
        : undefined;

/** Every pending request (the review list). */
export const CLAIMS_TAG = 'claims';
/** The super-user action log. */
export const ADMIN_LOG_TAG = 'adminLog';

export interface ClaimRequest {
    orgId: string;
    uid: string;
    intent: ClaimIntent;
    role: string;
    message: string;
    status: ClaimStatus;
    org: { name: string; handle: string };
    claimant: { displayName: string; username?: string };
    requestedAt?: number;
}

function toRequest(data: FirebaseFirestore.DocumentData): ClaimRequest {
    return {
        orgId: data.orgId,
        uid: data.uid,
        intent: data.intent,
        role: data.role ?? '',
        message: data.message ?? '',
        status: data.status,
        org: { name: data.org?.name ?? '', handle: data.org?.handle ?? '' },
        claimant: {
            displayName: data.claimant?.displayName ?? '',
            username: data.claimant?.username,
        },
        requestedAt: millis(data.requestedAt),
    };
}

/** The person's request for this organization, straight from Firestore. */
export async function getClaimRequestFresh(
    orgId: string,
    uid: string
): Promise<ClaimRequest | null> {
    logRead('claimRequests');
    const snapshot = await requests().doc(requestId(orgId, uid)).get();
    return snapshot.exists ? toRequest(snapshot.data()!) : null;
}

export type SubmitClaimResult =
    { ok: true } | { ok: false; error: 'notUnclaimed' | 'alreadyPending' };

/**
 * Sends (or, after a denial, re-sends) a request to claim or take down an
 * unclaimed organization. One per person per organization.
 */
export async function submitClaimRequest(
    orgId: string,
    uid: string,
    claimant: MemberCopy,
    input: ClaimRequestInput
): Promise<SubmitClaimResult> {
    const orgRef = db().collection('organizations').doc(orgId);
    const ref = requests().doc(requestId(orgId, uid));
    return db().runTransaction(async (tx) => {
        logRead('organizations');
        logRead('claimRequests');
        const [orgSnap, existing] = await Promise.all([
            tx.get(orgRef),
            tx.get(ref),
        ]);
        const org = orgSnap.data();
        if (org?.status !== 'active' || org.claimStatus !== 'unclaimed')
            return { ok: false, error: 'notUnclaimed' } as const;
        if (existing.data()?.status === 'pending')
            return { ok: false, error: 'alreadyPending' } as const;
        tx.set(ref, {
            orgId,
            uid,
            intent: input.intent,
            role: input.role,
            message: input.message,
            status: 'pending',
            org: { name: org.name, handle: org.handle },
            claimant: JSON.parse(JSON.stringify(claimant)),
            requestedAt: FieldValue.serverTimestamp(),
        });
        return { ok: true } as const;
    });
}

/** Withdraws the person's own pending request. */
export async function cancelClaimRequest(orgId: string, uid: string) {
    const ref = requests().doc(requestId(orgId, uid));
    await db().runTransaction(async (tx) => {
        logRead('claimRequests');
        const snap = await tx.get(ref);
        if (snap.data()?.status === 'pending') tx.delete(ref);
    });
}

/** Every pending request, oldest first, cached. Super users only. */
export async function getPendingClaims(): Promise<ClaimRequest[]> {
    'use cache';
    cacheTag(CLAIMS_TAG);
    cacheLife('hours');
    // One equality filter: no composite index needed. Sorted in memory.
    const snapshot = await requests().where('status', '==', 'pending').get();
    logRead('claimRequests', Math.max(snapshot.size, 1));
    return snapshot.docs
        .map((doc) => toRequest(doc.data()))
        .sort((a, b) => (a.requestedAt ?? 0) - (b.requestedAt ?? 0));
}

export interface AdminLogEntry {
    id: string;
    action: AdminAction;
    orgName: string;
    actorUid: string;
    /** The person a claim decision was about. */
    targetName?: string;
    /** A dictionary word's English name, for createDefinition and editDefinition. */
    word?: string;
    at?: number;
}

export type DecideClaimResult =
    | {
          ok: true;
          intent: ClaimIntent;
          handle: string;
          /** Everyone whose request this closed, including the person decided on. */
          closedUids: string[];
      }
    | { ok: false; error: ClaimDecisionProblem };

/**
 * A super user decides a request, checked on fresh data in one transaction.
 *
 * - Approve a claim: the person becomes the owner, the organization is no
 *   longer unclaimed, and its log says they claimed it.
 * - Approve a removal: the organization is archived (gone from its page and
 *   listings; the handle stays reserved).
 * - Deny: the request is marked denied; they can send a new one.
 *
 * Approving closes everyone else's pending request for that organization.
 */
export async function decideClaim(
    adminUid: string,
    orgId: string,
    uid: string,
    decision: ClaimDecision
): Promise<DecideClaimResult> {
    const orgRef = db().collection('organizations').doc(orgId);
    const ref = requests().doc(requestId(orgId, uid));
    const membershipRef = db().collection('memberships').doc(`${orgId}_${uid}`);
    return db().runTransaction(async (tx) => {
        logRead('claimRequests');
        logRead('organizations');
        const [requestSnap, orgSnap] = await Promise.all([
            tx.get(ref),
            tx.get(orgRef),
        ]);
        const request = requestSnap.exists
            ? toRequest(requestSnap.data()!)
            : null;
        const orgData = orgSnap.data();
        const org = orgData
            ? {
                  status: orgData.status as 'active' | 'archived',
                  unclaimed: orgData.claimStatus === 'unclaimed',
              }
            : null;

        let ownedCount = 0;
        let others: FirebaseFirestore.QueryDocumentSnapshot[] = [];
        if (decision === 'approve') {
            const [owned, pending] = await Promise.all([
                request?.intent === 'claim'
                    ? tx.get(
                          db()
                              .collection('memberships')
                              .where('uid', '==', uid)
                              .where('role', '==', 'owner')
                              .where('status', '==', 'active')
                      )
                    : null,
                tx.get(
                    requests()
                        .where('orgId', '==', orgId)
                        .where('status', '==', 'pending')
                ),
            ]);
            if (owned) logRead('memberships', Math.max(owned.size, 1));
            logRead('claimRequests', Math.max(pending.size, 1));
            ownedCount = owned?.size ?? 0;
            others = pending.docs.filter((doc) => doc.id !== ref.id);
        }

        const problem = claimDecisionProblem({
            decision,
            request,
            org,
            ownedCount,
            maxOwned: MAX_OWNED_ORGANIZATIONS,
        });
        if (problem) return { ok: false, error: problem } as const;

        const now = FieldValue.serverTimestamp();
        const target = {
            uid,
            displayName: request!.claimant.displayName,
        };
        let action: AdminAction = 'denyClaim';
        if (decision === 'approve' && request!.intent === 'claim') {
            action = 'approveClaim';
            tx.update(orgRef, {
                claimStatus: FieldValue.delete(),
                claimedBy: uid,
                claimedAt: now,
                memberCount: FieldValue.increment(1),
                updatedAt: now,
            });
            tx.set(membershipRef, {
                orgId,
                uid,
                role: 'owner',
                status: 'active',
                org: {
                    name: orgData!.name,
                    handle: orgData!.handle,
                    focusAreas: (orgData!.focusAreas ?? []) as FocusArea[],
                },
                member: JSON.parse(JSON.stringify(request!.claimant)),
                joinedAt: now,
            });
            tx.create(orgRef.collection('moderationLog').doc(), {
                action: 'claim',
                target,
                actor: { uid: adminUid, team: true },
                createdAt: now,
            });
        } else if (decision === 'approve') {
            action = 'approveRemoval';
            tx.update(orgRef, {
                status: 'archived',
                archivedAt: now,
                updatedAt: now,
            });
        }
        tx.update(ref, {
            status: decision === 'approve' ? 'approved' : 'denied',
            outcome: 'decided',
            decidedBy: adminUid,
            decidedAt: now,
        });
        for (const doc of others)
            tx.update(doc.ref, {
                status: 'denied',
                outcome: 'resolvedByOther',
                decidedBy: adminUid,
                decidedAt: now,
            });
        tx.create(db().collection('adminLog').doc(), {
            action,
            orgId,
            orgName: orgData?.name ?? request!.org.name,
            actorUid: adminUid,
            target,
            createdAt: now,
        });
        return {
            ok: true,
            intent: request!.intent,
            handle: orgData?.handle ?? request!.org.handle,
            closedUids: [uid, ...others.map((doc) => doc.data().uid as string)],
        } as const;
    });
}
