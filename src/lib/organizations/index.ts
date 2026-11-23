import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { geohashQueryBounds } from 'geofire-common';
import { cacheLife, cacheTag } from 'next/cache';
import { cache } from 'react';

import { getAdminDb } from '@/lib/firebase/admin';
import { logRead } from '@/lib/firebase/read-log';
import type { GeneralArea } from '@/lib/places';
import type { CountryCode } from '@/lib/places/types';
import type { OrganizationInput } from '@/lib/validation/organization';

import {
    MAX_RADIUS_MILES,
    distanceMiles,
    type DirectoryOrganization,
} from './directory';
import {
    moderationProblem,
    type MembershipStatus,
    type ModerationAction,
    type ModerationProblem,
    type OrgRole,
} from './membership';
import {
    MAX_OWNED_ORGANIZATIONS,
    memberListVisibilityOf,
    milesToKm,
    type MemberListVisibility,
    type JoinPolicy,
    type OrgLanguage,
    type FocusArea,
    type ReachScope,
    type SocialPlatform,
    type Visibility,
} from './options';

// Organizations in Firestore (design: documentation/features/16-organizations.md).
//
//   organizations/{orgId}        the profile
//   handles/{handle}             { orgId }: claims the unique handle
//   memberships/{orgId}_{uid}    one per person per organization, with a
//                                small copy of the organization for listing
//
// All access goes through the Admin SDK from server actions and containers;
// rules deny clients. Reads are cached with tags (org:{id}, handle:{handle},
// memberships:{uid}); writers clear them. Decide access on fresh data.

export type { MembershipStatus, OrgRole } from './membership';

export interface Organization {
    id: string;
    name: string;
    handle: string;
    focusAreas: FocusArea[];
    description: string;
    location: GeneralArea;
    reach: { scope: ReachScope; radiusKm?: number; radiusMiles?: number };
    languages: OrgLanguage[];
    website?: string;
    contactEmail?: string;
    socials: { platform: SocialPlatform; url: string }[];
    joinPolicy: JoinPolicy;
    visibility: Visibility;
    memberListVisibility: MemberListVisibility;
    status: 'active' | 'archived';
    memberCount: number;
    /** Storage path of the logo, if any. */
    logoPath?: string;
}

export interface Membership {
    orgId: string;
    uid: string;
    role: OrgRole;
    status: MembershipStatus;
    org: Pick<Organization, 'name' | 'handle' | 'focusAreas'> & {
        logoPath?: string;
    };
}

const db = () => getAdminDb();
const organizations = () => db().collection('organizations');
const handles = () => db().collection('handles');
const memberships = () => db().collection('memberships');
const membershipId = (orgId: string, uid: string) => `${orgId}_${uid}`;

export const orgTag = (orgId: string) => `org:${orgId}`;
export const handleTag = (handle: string) => `handle:${handle}`;
export const membershipsTag = (uid: string) => `memberships:${uid}`;
/** Every directory listing. Cleared when an organization is created, or changes how it's listed. */
export const DIRECTORY_TAG = 'directory';
/** An organization's people (members, requests, bans) and moderation log. */
export const orgMembersTag = (orgId: string) => `orgMembers:${orgId}`;

/** Only the plain fields: cached values can't hold Firestore Timestamps. */
function toOrganization(
    id: string,
    data: FirebaseFirestore.DocumentData
): Organization {
    return {
        id,
        name: data.name,
        handle: data.handle,
        focusAreas: data.focusAreas ?? [],
        description: data.description ?? '',
        location: data.location,
        reach: data.reach,
        languages: data.languages ?? [],
        website: data.website,
        contactEmail: data.contactEmail,
        socials: data.socials ?? [],
        joinPolicy: data.joinPolicy,
        visibility: data.visibility,
        memberListVisibility: memberListVisibilityOf(data.memberListVisibility),
        status: data.status,
        memberCount: data.memberCount ?? 0,
        logoPath: data.logoPath,
    };
}

async function readByHandle(handle: string): Promise<Organization | null> {
    logRead('handles');
    const claim = await handles().doc(handle).get();
    const orgId = claim.exists ? (claim.data()?.orgId as string) : null;
    if (!orgId) return null;
    logRead('organizations');
    const snapshot = await organizations().doc(orgId).get();
    if (!snapshot.exists) return null;
    const org = toOrganization(snapshot.id, snapshot.data()!);
    return org.status === 'active' && org.handle === handle ? org : null;
}

/** The organization at this handle, cached. A miss may be stale: confirm with getOrganizationByHandleFresh. */
export async function getOrganizationByHandle(
    handle: string
): Promise<Organization | null> {
    'use cache';
    cacheTag(handleTag(handle));
    cacheLife('hours');
    const org = await readByHandle(handle);
    if (org) cacheTag(orgTag(org.id));
    return org;
}

export const getOrganizationByHandleFresh = cache(readByHandle);

/** Whether anything (an organization, or a held old handle) has this handle. Always fresh. */
export async function isHandleTaken(handle: string): Promise<boolean> {
    logRead('handles');
    return (await handles().doc(handle).get()).exists;
}

/** The user's active memberships, cached, sorted by organization name. */
export async function getMemberships(uid: string): Promise<Membership[]> {
    'use cache';
    cacheTag(membershipsTag(uid));
    cacheLife('hours');
    const snapshot = await memberships()
        .where('uid', '==', uid)
        .where('status', '==', 'active')
        .get();
    logRead('memberships', Math.max(snapshot.size, 1));
    return snapshot.docs
        .map((doc) => {
            const d = doc.data();
            return {
                orgId: d.orgId,
                uid: d.uid,
                role: d.role,
                status: d.status,
                org: {
                    name: d.org.name,
                    handle: d.org.handle,
                    focusAreas: d.org.focusAreas ?? [],
                    logoPath: d.org.logoPath,
                },
            } satisfies Membership;
        })
        .sort((a, b) => a.org.name.localeCompare(b.org.name));
}

/** One membership, straight from Firestore: use it for access decisions. */
export const getMembershipFresh = cache(
    async (orgId: string, uid: string): Promise<Membership | null> => {
        logRead('memberships');
        const snapshot = await memberships()
            .doc(membershipId(orgId, uid))
            .get();
        if (!snapshot.exists) return null;
        const d = snapshot.data()!;
        return {
            orgId: d.orgId,
            uid: d.uid,
            role: d.role,
            status: d.status,
            org: {
                name: d.org.name,
                handle: d.org.handle,
                focusAreas: d.org.focusAreas ?? [],
            },
        };
    }
);

export type CreateOrganizationResult =
    | { ok: true; orgId: string; handle: string }
    | { ok: false; error: 'handleTaken' | 'ownedLimit' };

/**
 * Creates the organization, claims its handle and makes the creator its owner,
 * all in one transaction: either everything is written or nothing is.
 */
export async function createOrganization(
    uid: string,
    displayName: string,
    input: OrganizationInput,
    location: GeneralArea
): Promise<CreateOrganizationResult> {
    const orgRef = organizations().doc();
    const handleRef = handles().doc(input.handle);
    const membershipRef = memberships().doc(membershipId(orgRef.id, uid));

    return db().runTransaction(async (tx) => {
        logRead('handles');
        if ((await tx.get(handleRef)).exists) {
            return { ok: false, error: 'handleTaken' } as const;
        }
        const owned = await tx.get(
            memberships()
                .where('uid', '==', uid)
                .where('role', '==', 'owner')
                .where('status', '==', 'active')
        );
        logRead('memberships', Math.max(owned.size, 1));
        if (owned.size >= MAX_OWNED_ORGANIZATIONS) {
            return { ok: false, error: 'ownedLimit' } as const;
        }

        const now = FieldValue.serverTimestamp();
        const reach =
            input.reach === 'local'
                ? {
                      scope: 'local' as const,
                      radiusMiles: input.radiusMiles,
                      radiusKm: milesToKm(input.radiusMiles!),
                  }
                : { scope: input.reach };

        tx.create(orgRef, {
            name: input.name,
            handle: input.handle,
            focusAreas: input.focusAreas,
            description: input.description,
            location,
            reach,
            languages: input.languages,
            socials: input.socials,
            joinPolicy: input.joinPolicy,
            visibility: input.visibility,
            memberListVisibility: input.memberListVisibility,
            status: 'active',
            memberCount: 1,
            createdBy: uid,
            createdAt: now,
            updatedAt: now,
            ...(input.website ? { website: input.website } : {}),
            ...(input.contactEmail ? { contactEmail: input.contactEmail } : {}),
        });
        tx.create(handleRef, { orgId: orgRef.id, createdAt: now });
        tx.create(membershipRef, {
            orgId: orgRef.id,
            uid,
            role: 'owner',
            status: 'active',
            org: {
                name: input.name,
                handle: input.handle,
                focusAreas: input.focusAreas,
            },
            member: { displayName },
            joinedAt: now,
        });
        return { ok: true, orgId: orgRef.id, handle: input.handle } as const;
    });
}

// --- Directory (finding organizations). Listed, active groups only. Each
// read is cached under DIRECTORY_TAG; filtering happens in memory
// (./directory.ts), so the queries need no composite indexes.

function toDirectoryOrganization(
    id: string,
    data: FirebaseFirestore.DocumentData
): DirectoryOrganization | null {
    if (data.status !== 'active' || data.visibility !== 'listed') return null;
    return {
        id,
        name: data.name,
        handle: data.handle,
        focusAreas: data.focusAreas ?? [],
        description: data.description ?? '',
        location: {
            label: data.location.label,
            country: data.location.country,
            lat: data.location.lat,
            lng: data.location.lng,
        },
        reach: data.reach.scope,
        languages: data.languages ?? [],
        joinPolicy: data.joinPolicy,
        memberCount: data.memberCount ?? 0,
    };
}

/**
 * Local groups based within MAX_RADIUS_MILES of a point, cached per city.
 * Geohash ranges around the point (geofire's bounds), then exact distance.
 */
export async function getDirectoryLocal(origin: {
    placeId: string;
    lat: number;
    lng: number;
}): Promise<DirectoryOrganization[]> {
    'use cache';
    cacheTag(DIRECTORY_TAG);
    cacheLife('hours');
    const bounds = geohashQueryBounds(
        [origin.lat, origin.lng],
        MAX_RADIUS_MILES * 1609.344
    );
    const snapshots = await Promise.all(
        bounds.map(([start, end]) =>
            organizations()
                .orderBy('location.geohash')
                .startAt(start)
                .endAt(end)
                .get()
        )
    );
    const found: DirectoryOrganization[] = [];
    for (const snapshot of snapshots) {
        logRead('organizations', Math.max(snapshot.size, 1));
        for (const doc of snapshot.docs) {
            const org = toDirectoryOrganization(doc.id, doc.data());
            if (
                org?.reach === 'local' &&
                distanceMiles(origin, org.location) <= MAX_RADIUS_MILES
            )
                found.push(org);
        }
    }
    return found;
}

/** Nationwide groups based in this country, cached per country. */
export async function getDirectoryNational(
    country: CountryCode
): Promise<DirectoryOrganization[]> {
    'use cache';
    cacheTag(DIRECTORY_TAG);
    cacheLife('hours');
    const snapshot = await organizations()
        .where('reach.scope', '==', 'national')
        .where('location.country', '==', country)
        .where('status', '==', 'active')
        .where('visibility', '==', 'listed')
        .get();
    logRead('organizations', Math.max(snapshot.size, 1));
    return snapshot.docs.flatMap(
        (doc) => toDirectoryOrganization(doc.id, doc.data()) ?? []
    );
}

/** International groups, cached. */
export async function getDirectoryInternational(): Promise<
    DirectoryOrganization[]
> {
    'use cache';
    cacheTag(DIRECTORY_TAG);
    cacheLife('hours');
    const snapshot = await organizations()
        .where('reach.scope', '==', 'international')
        .where('status', '==', 'active')
        .where('visibility', '==', 'listed')
        .get();
    logRead('organizations', Math.max(snapshot.size, 1));
    return snapshot.docs.flatMap(
        (doc) => toDirectoryOrganization(doc.id, doc.data()) ?? []
    );
}

// --- People: joining, leaving, moderating. Every write is a transaction that
// re-reads what it decides on, keeps memberCount right, and (for moderation)
// appends to organizations/{orgId}/moderationLog.

const millis = (value: unknown) =>
    value && typeof (value as { toMillis?: unknown }).toMillis === 'function'
        ? (value as { toMillis: () => number }).toMillis()
        : undefined;

export interface OrgPerson {
    uid: string;
    displayName: string;
    role: OrgRole;
    status: MembershipStatus;
    /** When they asked (pending), joined (active) or were banned. Epoch ms. */
    since?: number;
    /** Banned only: why. Staff-only. */
    banReason?: string;
}

/** Everyone with a membership record in the organization, cached. Staff-only data inside: filter before showing. */
export async function getOrgPeople(orgId: string): Promise<OrgPerson[]> {
    'use cache';
    cacheTag(orgMembersTag(orgId));
    cacheLife('hours');
    const snapshot = await memberships().where('orgId', '==', orgId).get();
    logRead('memberships', Math.max(snapshot.size, 1));
    return snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
            uid: d.uid,
            displayName: d.member?.displayName ?? '',
            role: d.role,
            status: d.status,
            since: millis(
                d.status === 'pending'
                    ? d.requestedAt
                    : d.status === 'banned'
                      ? d.bannedAt
                      : d.joinedAt
            ),
            banReason: d.status === 'banned' ? d.banReason : undefined,
        };
    });
}

export interface ModerationLogEntry {
    id: string;
    action: ModerationAction;
    targetName: string;
    actorName: string;
    reason?: string;
    at?: number;
}

/** The latest moderation actions, newest first, cached. Staff-only. */
export async function getModerationLog(
    orgId: string,
    limit = 50
): Promise<ModerationLogEntry[]> {
    'use cache';
    cacheTag(orgMembersTag(orgId));
    cacheLife('hours');
    const snapshot = await organizations()
        .doc(orgId)
        .collection('moderationLog')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
    logRead('moderationLog', Math.max(snapshot.size, 1));
    return snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
            id: doc.id,
            action: d.action,
            targetName: d.target?.displayName ?? '',
            actorName: d.actor?.displayName ?? '',
            reason: d.reason || undefined,
            at: millis(d.createdAt),
        };
    });
}

export type JoinResult =
    | { ok: true; status: 'active' | 'pending' }
    | { ok: false; error: 'banned' | 'inviteOnly' | 'notFound' };

/** Joins an open organization, or asks to join one that takes requests. */
export async function joinOrganization(
    orgId: string,
    uid: string,
    displayName: string
): Promise<JoinResult> {
    const orgRef = organizations().doc(orgId);
    const ref = memberships().doc(membershipId(orgId, uid));
    return db().runTransaction(async (tx) => {
        logRead('organizations');
        logRead('memberships');
        const [orgSnap, existing] = await Promise.all([
            tx.get(orgRef),
            tx.get(ref),
        ]);
        const org = orgSnap.exists
            ? toOrganization(orgSnap.id, orgSnap.data()!)
            : null;
        if (!org || org.status !== 'active')
            return { ok: false, error: 'notFound' } as const;
        const status = existing.data()?.status as MembershipStatus | undefined;
        if (status === 'banned') return { ok: false, error: 'banned' } as const;
        if (status === 'active' || status === 'pending')
            return { ok: true, status } as const;
        if (org.joinPolicy === 'invite')
            return { ok: false, error: 'inviteOnly' } as const;

        const now = FieldValue.serverTimestamp();
        const open = org.joinPolicy === 'open';
        tx.set(ref, {
            orgId,
            uid,
            role: 'member',
            status: open ? 'active' : 'pending',
            org: {
                name: org.name,
                handle: org.handle,
                focusAreas: org.focusAreas,
            },
            member: { displayName },
            ...(open ? { joinedAt: now } : { requestedAt: now }),
        });
        if (open)
            tx.update(orgRef, {
                memberCount: FieldValue.increment(1),
                updatedAt: now,
            });
        return { ok: true, status: open ? 'active' : 'pending' } as const;
    });
}

/** Withdraws the user's own pending request. */
export async function cancelJoinRequest(orgId: string, uid: string) {
    const ref = memberships().doc(membershipId(orgId, uid));
    await db().runTransaction(async (tx) => {
        logRead('memberships');
        const snap = await tx.get(ref);
        if (snap.data()?.status === 'pending') tx.delete(ref);
    });
}

export type LeaveResult =
    { ok: true } | { ok: false; error: 'lastOwner' | 'notMember' };

/** Leaves the organization. The last owner can't. */
export async function leaveOrganization(
    orgId: string,
    uid: string
): Promise<LeaveResult> {
    const orgRef = organizations().doc(orgId);
    const ref = memberships().doc(membershipId(orgId, uid));
    return db().runTransaction(async (tx) => {
        logRead('memberships');
        const snap = await tx.get(ref);
        const d = snap.data();
        if (d?.status !== 'active')
            return { ok: false, error: 'notMember' } as const;
        if (d.role === 'owner') {
            const owners = await tx.get(
                memberships()
                    .where('orgId', '==', orgId)
                    .where('role', '==', 'owner')
                    .where('status', '==', 'active')
            );
            logRead('memberships', Math.max(owners.size, 1));
            if (owners.size <= 1)
                return { ok: false, error: 'lastOwner' } as const;
        }
        tx.delete(ref);
        tx.update(orgRef, {
            memberCount: FieldValue.increment(-1),
            updatedAt: FieldValue.serverTimestamp(),
        });
        return { ok: true } as const;
    });
}

export type ModerateResult =
    { ok: true; targetUid: string } | { ok: false; error: ModerationProblem };

/**
 * One moderation action by `actorUid` on `targetUid`, checked against fresh
 * data (moderationProblem) and logged with the reason:
 * approve (pending → active), deny (request deleted), block (request → banned),
 * remove (member deleted), ban (member → banned), unban (ban deleted, so they
 * can ask again).
 */
export async function moderateMember(
    orgId: string,
    actorUid: string,
    targetUid: string,
    action: ModerationAction,
    reason?: string
): Promise<ModerateResult> {
    const orgRef = organizations().doc(orgId);
    const actorRef = memberships().doc(membershipId(orgId, actorUid));
    const targetRef = memberships().doc(membershipId(orgId, targetUid));
    const logRef = orgRef.collection('moderationLog').doc();
    return db().runTransaction(async (tx) => {
        logRead('memberships', 2);
        const [actorSnap, targetSnap] = await Promise.all([
            tx.get(actorRef),
            tx.get(targetRef),
        ]);
        const actor = actorSnap.data();
        const target = targetSnap.data();
        const problem = moderationProblem({
            action,
            actorUid,
            actorRole: actor?.status === 'active' ? actor.role : null,
            target: target
                ? { uid: targetUid, role: target.role, status: target.status }
                : null,
            reason,
        });
        if (problem) return { ok: false, error: problem } as const;

        const now = FieldValue.serverTimestamp();
        const text = reason?.trim() || undefined;
        const countChange =
            action === 'approve'
                ? 1
                : action === 'remove' || action === 'ban'
                  ? -1
                  : 0;
        switch (action) {
            case 'approve':
                tx.update(targetRef, {
                    status: 'active',
                    joinedAt: now,
                    requestedAt: FieldValue.delete(),
                });
                break;
            case 'deny':
            case 'remove':
            case 'unban':
                tx.delete(targetRef);
                break;
            case 'block':
            case 'ban':
                // A ban keeps the record so they can't ask again.
                tx.update(targetRef, {
                    status: 'banned',
                    role: 'member',
                    bannedAt: now,
                    banReason: text,
                    joinedAt: FieldValue.delete(),
                    requestedAt: FieldValue.delete(),
                });
                break;
        }
        if (countChange)
            tx.update(orgRef, {
                memberCount: FieldValue.increment(countChange),
                updatedAt: now,
            });
        tx.create(logRef, {
            action,
            target: {
                uid: targetUid,
                displayName: target!.member?.displayName ?? '',
            },
            actor: {
                uid: actorUid,
                displayName: actor!.member?.displayName ?? '',
            },
            ...(text ? { reason: text } : {}),
            createdAt: now,
        });
        return { ok: true, targetUid } as const;
    });
}

/**
 * Keeps the name copied onto a person's memberships in step with their
 * profile. Returns the organizations touched, so their caches can be cleared.
 */
export async function syncMemberName(
    uid: string,
    displayName: string
): Promise<string[]> {
    const snapshot = await memberships().where('uid', '==', uid).get();
    logRead('memberships', Math.max(snapshot.size, 1));
    const stale = snapshot.docs.filter(
        (doc) => doc.data().member?.displayName !== displayName
    );
    for (let i = 0; i < stale.length; i += 400) {
        const batch = db().batch();
        for (const doc of stale.slice(i, i + 400))
            batch.update(doc.ref, { 'member.displayName': displayName });
        await batch.commit();
    }
    return stale.map((doc) => doc.data().orgId as string);
}
