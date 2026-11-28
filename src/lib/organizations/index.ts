import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { geohashQueryBounds } from 'geofire-common';
import { cacheLife, cacheTag } from 'next/cache';
import { cache } from 'react';

import { getAdminDb } from '@/lib/firebase/admin';
import { photoOf, type Photo } from '@/lib/photos';
import { logRead } from '@/lib/firebase/read-log';
import type { GeneralArea } from '@/lib/places';
import type { CountryCode } from '@/lib/places/types';
import {
    profileSettingsOf,
    type ProfileGroup,
    type ProfileVisibility,
} from '@/lib/profiles';
import type { OrganizationInput } from '@/lib/validation/organization';

import { effectiveRole } from '@/lib/platform-admin';

import { missingDetails } from './details';
import { changedFields, COPIED_FIELDS, type OrgEditField } from './edit';
import { claimBlocks, handleHeldUntil, nextHandleChangeAt } from './handle';
import {
    MAX_RADIUS_MILES,
    distanceMiles,
    type DirectoryOrganization,
} from './directory';
import {
    moderationProblem,
    ROLE_CHANGES,
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
    type Visibility,
} from './options';
import { socialLinksOf, type SocialLink } from '@/lib/socials';

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
    /** Optional, public: where people go (never a home). Events will default to it. */
    streetAddress?: string;
    website?: string;
    contactEmail?: string;
    /** Optional, public. E.164, plus `;ext=N` (src/lib/phone.ts). */
    phone?: string;
    /** Optional: the year the group started. */
    foundedYear?: number;
    socials: SocialLink[];
    joinPolicy: JoinPolicy;
    visibility: Visibility;
    memberListVisibility: MemberListVisibility;
    status: 'active' | 'archived';
    /** Added by a super user and not claimed yet: no members, every super user acts as owner. */
    unclaimed: boolean;
    memberCount: number;
    /** The logo, if any (src/lib/photos). Public wherever the organization is shown. */
    photo?: Photo;
    /** When the handle last changed (epoch ms), for the 30-day limit. */
    handleChangedAt?: number;
}

export interface Membership {
    orgId: string;
    uid: string;
    role: OrgRole;
    status: MembershipStatus;
    org: Pick<Organization, 'name' | 'handle' | 'focusAreas'> & {
        /** The logo's small link. */
        photo?: string;
    };
}

const db = () => getAdminDb();
const organizations = () => db().collection('organizations');
const handles = () => db().collection('handles');
const memberships = () => db().collection('memberships');
const membershipId = (orgId: string, uid: string) => `${orgId}_${uid}`;
/** Firestore Timestamp → epoch ms (cached values can't hold Timestamps). */
const millis = (value: unknown) =>
    value && typeof (value as { toMillis?: unknown }).toMillis === 'function'
        ? (value as { toMillis: () => number }).toMillis()
        : undefined;

export const orgTag = (orgId: string) => `org:${orgId}`;
export const handleTag = (handle: string) => `handle:${handle}`;
export const membershipsTag = (uid: string) => `memberships:${uid}`;
/** Every directory listing. Cleared when an organization is created, or changes how it's listed. */
export const DIRECTORY_TAG = 'directory';
/** An organization's people (members, requests, bans) and moderation log. */
export const orgMembersTag = (orgId: string) => `orgMembers:${orgId}`;

/** The person copied onto each membership, so member lists are one query. */
export interface MemberCopy {
    displayName: string;
    username?: string;
    /** Their photo's small link, and the profile visibility that decides who sees it. */
    photo?: string;
    visibility?: ProfileVisibility;
}
const MEMBER_COPY_FIELDS = [
    'displayName',
    'username',
    'photo',
    'visibility',
] as const satisfies readonly (keyof MemberCopy)[];
const memberCopy = (member: MemberCopy) =>
    JSON.parse(JSON.stringify(member)) as MemberCopy; // drops undefined

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
        streetAddress: data.streetAddress,
        website: data.website,
        contactEmail: data.contactEmail,
        phone: data.phone,
        foundedYear: data.foundedYear,
        socials: socialLinksOf(data.socials),
        joinPolicy: data.joinPolicy,
        visibility: data.visibility,
        memberListVisibility: memberListVisibilityOf(data.memberListVisibility),
        status: data.status,
        unclaimed: data.claimStatus === 'unclaimed',
        memberCount: data.memberCount ?? 0,
        photo: photoOf(data.photo),
        handleChangedAt: millis(data.handleChangedAt),
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

/**
 * An organization by id (active or archived), cached and tagged with it.
 * For things that point at an organization by id, like comments; decide
 * access on fresh data.
 */
export async function getOrganizationById(
    orgId: string
): Promise<Organization | null> {
    'use cache';
    cacheTag(orgTag(orgId));
    cacheLife('hours');
    logRead('organizations');
    const snapshot = await organizations().doc(orgId).get();
    return snapshot.exists
        ? toOrganization(snapshot.id, snapshot.data()!)
        : null;
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
export async function isHandleTaken(
    handle: string,
    orgId: string | null = null
): Promise<boolean> {
    logRead('handles');
    return claimBlocks(
        toClaim(await handles().doc(handle).get()),
        orgId,
        Date.now()
    );
}

/** A `handles/{handle}` document as the rules in ./handle.ts read it. */
function toClaim(
    snapshot: FirebaseFirestore.DocumentSnapshot
): { orgId: string; heldUntil?: number } | null {
    if (!snapshot.exists) return null;
    const d = snapshot.data()!;
    return { orgId: d.orgId, heldUntil: millis(d.heldUntil) };
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
                    photo: d.org.photo,
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
                photo: d.org.photo,
            },
        };
    }
);

/** The stored reach for the form's choice: miles and km for local groups. */
function reachOf(input: OrganizationInput) {
    return input.reach === 'local'
        ? {
              scope: 'local' as const,
              radiusMiles: input.radiusMiles,
              radiusKm: milesToKm(input.radiusMiles!),
          }
        : { scope: input.reach };
}

/** A new organization document, as the create form describes it. */
function newOrganizationFields(
    input: OrganizationInput,
    location: GeneralArea,
    createdBy: string
) {
    const now = FieldValue.serverTimestamp();
    return {
        name: input.name,
        handle: input.handle,
        focusAreas: input.focusAreas,
        description: input.description,
        location,
        reach: reachOf(input),
        languages: input.languages,
        socials: input.socials,
        joinPolicy: input.joinPolicy,
        visibility: input.visibility,
        memberListVisibility: input.memberListVisibility,
        status: 'active',
        createdBy,
        createdAt: now,
        updatedAt: now,
        ...(input.streetAddress ? { streetAddress: input.streetAddress } : {}),
        ...(input.website ? { website: input.website } : {}),
        ...(input.contactEmail ? { contactEmail: input.contactEmail } : {}),
        ...(input.phone ? { phone: input.phone } : {}),
        ...(input.foundedYear ? { foundedYear: input.foundedYear } : {}),
        // Derived, so super users can count pages that need research.
        missingDetails: missingDetails(input),
    };
}

export type CreateOrganizationResult =
    | { ok: true; orgId: string; handle: string }
    | { ok: false; error: 'handleTaken' | 'ownedLimit' };

/**
 * Creates the organization, claims its handle and makes the creator its owner,
 * all in one transaction: either everything is written or nothing is.
 */
export async function createOrganization(
    uid: string,
    member: MemberCopy,
    input: OrganizationInput,
    location: GeneralArea
): Promise<CreateOrganizationResult> {
    const orgRef = organizations().doc();
    const handleRef = handles().doc(input.handle);
    const membershipRef = memberships().doc(membershipId(orgRef.id, uid));

    return db().runTransaction(async (tx) => {
        logRead('handles');
        // A held old handle can be taken once its hold has run out.
        if (claimBlocks(toClaim(await tx.get(handleRef)), null, Date.now())) {
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
        tx.create(orgRef, {
            ...newOrganizationFields(input, location, uid),
            memberCount: 1,
        });
        tx.set(handleRef, { orgId: orgRef.id, createdAt: now });
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
            member: memberCopy(member),
            joinedAt: now,
        });
        return { ok: true, orgId: orgRef.id, handle: input.handle } as const;
    });
}

/**
 * A super user adds an organization nobody has claimed yet: the
 * organization and its handle, with no members and no owner. `createdBy` is
 * kept for the audit trail and never shown. The owned-organizations limit
 * doesn't apply, because nobody owns it. Logged in the admin log.
 */
export async function createUnclaimedOrganization(
    adminUid: string,
    input: OrganizationInput,
    location: GeneralArea
): Promise<
    | { ok: true; orgId: string; handle: string }
    | { ok: false; error: 'handleTaken' }
> {
    const orgRef = organizations().doc();
    const handleRef = handles().doc(input.handle);
    return db().runTransaction(async (tx) => {
        logRead('handles');
        if (claimBlocks(toClaim(await tx.get(handleRef)), null, Date.now())) {
            return { ok: false, error: 'handleTaken' } as const;
        }
        const now = FieldValue.serverTimestamp();
        tx.create(orgRef, {
            ...newOrganizationFields(input, location, adminUid),
            claimStatus: 'unclaimed',
            memberCount: 0,
        });
        tx.set(handleRef, { orgId: orgRef.id, createdAt: now });
        tx.create(db().collection('adminLog').doc(), {
            action: 'createUnclaimed',
            orgId: orgRef.id,
            orgName: input.name,
            actorUid: adminUid,
            createdAt: now,
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
        ...(data.reach.scope === 'local' && data.reach.radiusMiles
            ? { radiusMiles: data.reach.radiusMiles }
            : {}),
        ...(data.foundedYear ? { foundedYear: data.foundedYear } : {}),
        languages: data.languages ?? [],
        memberCount: data.memberCount ?? 0,
        ...(data.website ? { website: data.website } : {}),
        socials: socialLinksOf(data.socials),
        unclaimed: data.claimStatus === 'unclaimed',
        ...(photoOf(data.photo) ? { photo: photoOf(data.photo)!.small } : {}),
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

/** A listed group's address and city, for the sitemap. */
export interface SitemapOrganization {
    handle: string;
    country: string;
    placeId: string;
    reach: ReachScope;
}

/**
 * Every listed, active group, for the sitemap (technical/seo.md). Cached a
 * day and cleared with the directory; only the fields a URL needs are read.
 */
export async function getSitemapOrganizations(): Promise<
    SitemapOrganization[]
> {
    'use cache';
    cacheTag(DIRECTORY_TAG);
    cacheLife('days');
    const snapshot = await organizations()
        .where('status', '==', 'active')
        .where('visibility', '==', 'listed')
        .select('handle', 'location.country', 'location.placeId', 'reach.scope')
        .get();
    logRead('organizations', Math.max(snapshot.size, 1));
    return snapshot.docs.flatMap((doc) => {
        const data = doc.data();
        if (!data.handle) return [];
        return [
            {
                handle: data.handle,
                country: data.location?.country ?? '',
                placeId: data.location?.placeId ?? '',
                reach: data.reach?.scope ?? 'local',
            },
        ];
    });
}

// --- People: joining, leaving, moderating. Every write is a transaction that
// re-reads what it decides on, keeps memberCount right, and (for moderation)
// appends to organizations/{orgId}/moderationLog.

export interface OrgPerson {
    uid: string;
    displayName: string;
    /** For linking to /comrade/{username}. Missing only for accounts mid-setup. */
    username?: string;
    /** Their photo's small link: decide who sees it with visiblePhoto (src/lib/profiles.ts). */
    photo?: string;
    /** Missing on old copies; treat as "name" (no photo shown). */
    visibility?: ProfileVisibility;
    role: OrgRole;
    status: MembershipStatus;
    /** When they asked (pending), joined (active) or were banned. Epoch ms. */
    since?: number;
    /** Banned only: why. Staff-only. */
    banReason?: string;
}

/**
 * Everyone with a membership record in the organization, cached. Staff-only
 * data inside: filter before showing. Memberships made before the name (or
 * username) was copied onto them are repaired here: read from the profile,
 * shown, and written back, so each costs one extra read once.
 */
export async function getOrgPeople(orgId: string): Promise<OrgPerson[]> {
    'use cache';
    cacheTag(orgMembersTag(orgId));
    cacheLife('hours');
    const snapshot = await memberships().where('orgId', '==', orgId).get();
    logRead('memberships', Math.max(snapshot.size, 1));

    const missing = snapshot.docs.filter((doc) => {
        const copy = doc.data().member;
        return !copy?.displayName || !copy?.username;
    });
    const repaired = new Map<string, MemberCopy>();
    if (missing.length > 0) {
        const profiles = await db().getAll(
            ...missing.map((doc) =>
                db().collection('users').doc(doc.data().uid)
            )
        );
        logRead('users (member copy repair)', profiles.length);
        const batch = db().batch();
        missing.forEach((doc, i) => {
            const p = profiles[i].data();
            if (!p?.displayName) return;
            const copy = memberCopy(
                memberCopyOf({
                    displayName: p.displayName,
                    username: p.username,
                    photo: photoOf(p.photo),
                    profile: {
                        visibility: profileSettingsOf(p.profile).visibility,
                    },
                })
            );
            repaired.set(doc.id, copy);
            batch.update(doc.ref, { member: copy });
        });
        if (repaired.size > 0)
            await batch
                .commit()
                .catch((error: Error) =>
                    console.error(
                        '[org] member copy repair failed',
                        error.message
                    )
                );
    }

    return snapshot.docs.map((doc) => {
        const d = doc.data();
        const member = repaired.get(doc.id) ?? d.member ?? {};
        return {
            uid: d.uid,
            displayName: member.displayName ?? '',
            username: member.username,
            photo: member.photo,
            visibility: member.visibility,
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

/** Everything the moderation log records: actions on people, and profile edits. */
export type LogAction =
    | ModerationAction
    | 'editProfile'
    | 'claim'
    | 'deleteOrganization'
    | 'restoreOrganization'
    // The organization's reply to a comment on its page (features/20).
    | 'replyComment'
    | 'deleteReply';

export interface ModerationLogEntry {
    id: string;
    action: LogAction;
    /** editProfile only: the fields that changed (OrgEditField keys). */
    fields?: string[];
    targetName: string;
    actorName: string;
    /** Done by a super user, shown as "the Communalists team" rather than by name. */
    byTeam?: boolean;
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
            fields: d.fields,
            targetName: d.target?.displayName ?? '',
            actorName: d.actor?.team ? '' : (d.actor?.displayName ?? ''),
            byTeam: d.actor?.team === true || undefined,
            reason: d.reason || undefined,
            at: millis(d.createdAt),
        };
    });
}

export type JoinResult =
    | { ok: true; status: 'active' | 'pending' }
    | { ok: false; error: 'banned' | 'inviteOnly' | 'notFound' | 'unclaimed' };

/** Joins an open organization, or asks to join one that takes requests. */
export async function joinOrganization(
    orgId: string,
    uid: string,
    member: MemberCopy
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
        // Nobody can approve requests until someone claims it.
        if (org.unclaimed) return { ok: false, error: 'unclaimed' } as const;
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
                ...(org.photo ? { photo: org.photo.small } : {}),
            },
            member: memberCopy(member),
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
 * can ask again), and role changes (makeModerator, makeOwner, makeMember).
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

        // A new owner must stay within the owned-organizations limit.
        if (action === 'makeOwner') {
            const owned = await tx.get(
                memberships()
                    .where('uid', '==', targetUid)
                    .where('role', '==', 'owner')
                    .where('status', '==', 'active')
            );
            logRead('memberships', Math.max(owned.size, 1));
            if (owned.size >= MAX_OWNED_ORGANIZATIONS)
                return { ok: false, error: 'ownedLimit' } as const;
        }

        const now = FieldValue.serverTimestamp();
        const text = reason?.trim() || undefined;
        const countChange =
            action === 'approve'
                ? 1
                : action === 'remove' || action === 'ban'
                  ? -1
                  : 0;
        switch (action) {
            case 'makeModerator':
            case 'makeOwner':
            case 'makeMember':
                tx.update(targetRef, { role: ROLE_CHANGES[action] });
                break;
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
 * Keeps the person copied onto their memberships (name, username, photo
 * link and visibility) in step with their profile. Pass the whole copy:
 * fields left out are removed. Returns the organizations touched, so their
 * caches can be cleared.
 */
export async function syncMemberCopy(
    uid: string,
    member: MemberCopy
): Promise<string[]> {
    const copy = memberCopy(member);
    const snapshot = await memberships().where('uid', '==', uid).get();
    logRead('memberships', Math.max(snapshot.size, 1));
    const stale = snapshot.docs.filter((doc) => {
        const current: Partial<MemberCopy> = doc.data().member ?? {};
        return MEMBER_COPY_FIELDS.some((key) => current[key] !== copy[key]);
    });
    for (let i = 0; i < stale.length; i += 400) {
        const batch = db().batch();
        for (const doc of stale.slice(i, i + 400))
            batch.update(doc.ref, { member: copy });
        await batch.commit();
    }
    return stale.map((doc) => doc.data().orgId as string);
}

/** What a person's membership copy should hold, from their profile. */
export function memberCopyOf(profile: {
    displayName?: string;
    username?: string;
    photo?: Photo;
    profile: { visibility: ProfileVisibility };
}): MemberCopy {
    return {
        displayName: profile.displayName ?? '',
        username: profile.username,
        photo: profile.photo?.small,
        visibility: profile.profile.visibility,
    };
}

// --- Editing (owners and moderators; the handle owners only).

export type UpdateOrganizationResult =
    | {
          ok: true;
          handle: string;
          previousHandle: string;
          changed: OrgEditField[];
          /** Everyone with a membership, when their copy of the organization changed. */
          copyHolders: string[];
      }
    | {
          ok: false;
          error: 'notAllowed' | 'notFound' | 'handleTaken' | 'handleCooldown';
      };

/** Who is editing: a super user edits unclaimed organizations as their owner. */
export interface OrgEditor {
    uid: string;
    displayName: string;
    platformAdmin: boolean;
}

/**
 * Saves an edit by `actorUid`. In one transaction: checks the actor is an
 * active owner or moderator (owners only for the handle), the handle's
 * 30-day limit and claim, then writes the organization, moves the handle
 * claim (holding the old one for 30 days) and logs which fields changed.
 * Membership copies (name, handle, focus areas) are updated afterwards in
 * batches, so a big group doesn't hit the transaction's write limit.
 */
export async function updateOrganization(
    orgId: string,
    editor: OrgEditor,
    input: OrganizationInput,
    location: GeneralArea
): Promise<UpdateOrganizationResult> {
    const actorUid = editor.uid;
    const orgRef = organizations().doc(orgId);
    const actorRef = memberships().doc(membershipId(orgId, actorUid));
    const logRef = orgRef.collection('moderationLog').doc();
    const now = Date.now();

    const result = await db().runTransaction(async (tx) => {
        logRead('organizations');
        logRead('memberships');
        const [orgSnap, actorSnap] = await Promise.all([
            tx.get(orgRef),
            tx.get(actorRef),
        ]);
        if (!orgSnap.exists) return { ok: false, error: 'notFound' } as const;
        const org = toOrganization(orgSnap.id, orgSnap.data()!);
        if (org.status !== 'active')
            return { ok: false, error: 'notFound' } as const;
        const actor = actorSnap.data();
        const role = effectiveRole(
            actor?.status === 'active' ? actor.role : null,
            org,
            editor.platformAdmin
        );
        if (role !== 'owner' && role !== 'moderator')
            return { ok: false, error: 'notAllowed' } as const;
        // On an unclaimed organization, a super user edits for the team.
        const byTeam = org.unclaimed;

        const reach = reachOf(input);
        const changed = changedFields(
            {
                ...org,
                location: org.location.placeId,
                reach: {
                    scope: org.reach.scope,
                    radiusMiles: org.reach.radiusMiles,
                },
            },
            {
                ...input,
                location: location.placeId,
                reach: {
                    scope: reach.scope,
                    radiusMiles:
                        input.reach === 'local' ? input.radiusMiles : undefined,
                },
            }
        );

        const handleChanged = changed.includes('handle');
        const newHandleRef = handles().doc(input.handle);
        if (handleChanged) {
            if (role !== 'owner')
                return { ok: false, error: 'notAllowed' } as const;
            if (nextHandleChangeAt(org.handleChangedAt, now) !== null)
                return { ok: false, error: 'handleCooldown' } as const;
            logRead('handles');
            if (claimBlocks(toClaim(await tx.get(newHandleRef)), orgId, now))
                return { ok: false, error: 'handleTaken' } as const;
        }

        const stamp = FieldValue.serverTimestamp();
        tx.update(orgRef, {
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
            streetAddress: input.streetAddress ?? FieldValue.delete(),
            website: input.website ?? FieldValue.delete(),
            contactEmail: input.contactEmail ?? FieldValue.delete(),
            phone: input.phone ?? FieldValue.delete(),
            foundedYear: input.foundedYear ?? FieldValue.delete(),
            missingDetails: missingDetails(input),
            updatedAt: stamp,
            ...(handleChanged ? { handleChangedAt: stamp } : {}),
        });
        if (handleChanged) {
            tx.set(newHandleRef, { orgId, createdAt: stamp });
            // The old handle stays claimed (but no longer resolves) for 30 days.
            tx.set(handles().doc(org.handle), {
                orgId,
                heldUntil: new Date(handleHeldUntil(now)),
                createdAt: stamp,
            });
        }
        if (changed.length > 0) {
            tx.create(logRef, {
                action: 'editProfile',
                fields: changed,
                actor: byTeam
                    ? { uid: actorUid, team: true }
                    : { uid: actorUid, displayName: editor.displayName },
                createdAt: stamp,
            });
            if (byTeam)
                tx.create(db().collection('adminLog').doc(), {
                    action: 'editUnclaimed',
                    orgId,
                    orgName: input.name,
                    actorUid,
                    fields: changed,
                    createdAt: stamp,
                });
        }
        return {
            ok: true,
            handle: input.handle,
            previousHandle: org.handle,
            changed,
        } as const;
    });
    if (!result.ok) return result;

    let copyHolders: string[] = [];
    if (result.changed.some((field) => COPIED_FIELDS.includes(field))) {
        const snapshot = await memberships().where('orgId', '==', orgId).get();
        logRead('memberships', Math.max(snapshot.size, 1));
        for (let i = 0; i < snapshot.docs.length; i += 400) {
            const batch = db().batch();
            for (const doc of snapshot.docs.slice(i, i + 400)) {
                batch.update(doc.ref, {
                    'org.name': input.name,
                    'org.handle': input.handle,
                    'org.focusAreas': input.focusAreas,
                });
            }
            await batch.commit();
        }
        copyHolders = snapshot.docs.map((doc) => doc.data().uid as string);
    }
    return { ...result, copyHolders };
}

// --- The logo (src/lib/photos). Owners and moderators change it; super users
// can also remove one from any organization as moderation (decision #71).

export type SetOrganizationPhotoResult =
    | {
          ok: true;
          handle: string;
          name: string;
          /** The logo it replaced: delete its files. */
          previous?: Photo;
          /** Everyone with a membership (their copy of the logo changed). */
          copyHolders: string[];
      }
    | { ok: false; error: 'notAllowed' | 'notFound' };

/**
 * Sets or removes the logo in a transaction that checks the editor: an
 * active owner or moderator (super users on unclaimed organizations), or,
 * with `moderation`, any super user removing it, which goes in adminLog with
 * the reason. Logged in the organization's moderation log as an edit of
 * "logo". Membership copies are updated afterwards in batches.
 */
export async function setOrganizationPhoto(
    orgId: string,
    editor: OrgEditor,
    photo: Photo | null,
    moderation?: { reason: string }
): Promise<SetOrganizationPhotoResult> {
    const orgRef = organizations().doc(orgId);
    const actorRef = memberships().doc(membershipId(orgId, editor.uid));
    const result = await db().runTransaction(async (tx) => {
        logRead('organizations');
        logRead('memberships');
        const [orgSnap, actorSnap] = await Promise.all([
            tx.get(orgRef),
            tx.get(actorRef),
        ]);
        if (!orgSnap.exists) return { ok: false, error: 'notFound' } as const;
        const org = toOrganization(orgSnap.id, orgSnap.data()!);
        if (org.status !== 'active')
            return { ok: false, error: 'notFound' } as const;
        const moderating = !!moderation && photo === null;
        if (moderating) {
            if (!editor.platformAdmin)
                return { ok: false, error: 'notAllowed' } as const;
        } else {
            const actor = actorSnap.data();
            const role = effectiveRole(
                actor?.status === 'active' ? actor.role : null,
                org,
                editor.platformAdmin
            );
            if (role !== 'owner' && role !== 'moderator')
                return { ok: false, error: 'notAllowed' } as const;
        }
        // Super users act for the team, on unclaimed organizations or as moderators.
        const byTeam = moderating || org.unclaimed;

        const stamp = FieldValue.serverTimestamp();
        tx.update(orgRef, {
            photo: photo ?? FieldValue.delete(),
            updatedAt: stamp,
        });
        tx.create(orgRef.collection('moderationLog').doc(), {
            action: 'editProfile',
            fields: ['logo'],
            actor: byTeam
                ? { uid: editor.uid, team: true }
                : { uid: editor.uid, displayName: editor.displayName },
            createdAt: stamp,
        });
        if (byTeam)
            tx.create(db().collection('adminLog').doc(), {
                action: moderating ? 'removeLogo' : 'editUnclaimed',
                orgId,
                orgName: org.name,
                actorUid: editor.uid,
                ...(moderating
                    ? { reason: moderation!.reason }
                    : { fields: ['logo'] }),
                createdAt: stamp,
            });
        return {
            ok: true,
            handle: org.handle,
            name: org.name,
            previous: org.photo,
        } as const;
    });
    if (!result.ok) return result;

    const snapshot = await memberships().where('orgId', '==', orgId).get();
    logRead('memberships', Math.max(snapshot.size, 1));
    for (let i = 0; i < snapshot.docs.length; i += 400) {
        const batch = db().batch();
        for (const doc of snapshot.docs.slice(i, i + 400))
            batch.update(doc.ref, {
                'org.photo': photo?.small ?? FieldValue.delete(),
            });
        await batch.commit();
    }
    return {
        ...result,
        copyHolders: snapshot.docs.map((doc) => doc.data().uid as string),
    };
}

// --- A person's groups, for their profile (src/lib/profiles.ts decides which
// a viewer may see).

/** The person's active groups, with the settings that decide who may see each. Cached reads. */
export async function getProfileGroups(uid: string): Promise<ProfileGroup[]> {
    const memberships = await getMemberships(uid);
    const orgs = await Promise.all(
        memberships.map((m) => getOrganizationByHandle(m.org.handle))
    );
    return memberships.flatMap((m, i) => {
        const org = orgs[i];
        if (!org || org.id !== m.orgId) return [];
        return [
            {
                orgId: org.id,
                name: org.name,
                handle: org.handle,
                role: m.role,
                listed: org.visibility === 'listed',
                memberList: org.memberListVisibility,
            },
        ];
    });
}
