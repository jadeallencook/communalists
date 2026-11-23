import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { cacheLife, cacheTag } from 'next/cache';
import { cache } from 'react';

import { getAdminDb } from '@/lib/firebase/admin';
import { logRead } from '@/lib/firebase/read-log';
import type { GeneralArea } from '@/lib/places';
import type { OrganizationInput } from '@/lib/validation/organization';

import {
    MAX_OWNED_ORGANIZATIONS,
    milesToKm,
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

export type OrgRole = 'owner' | 'moderator' | 'member';
export type MembershipStatus = 'active' | 'pending' | 'invited';

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
            joinedAt: now,
        });
        return { ok: true, orgId: orgRef.id, handle: input.handle } as const;
    });
}
