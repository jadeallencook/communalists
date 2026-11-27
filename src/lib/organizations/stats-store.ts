import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { cacheLife, cacheTag } from 'next/cache';

import { getAdminDb } from '@/lib/firebase/admin';
import { logRead } from '@/lib/firebase/read-log';
import {
    ACTIVITY_GROUPS,
    FEED_ACTIONS,
    searchTerms,
    statWindows,
    weeklyBuckets,
    type ActivityGroup,
    type TimeRange,
} from '@/lib/platform-stats';

import { ADMIN_LOG_TAG, CLAIMS_TAG, type AdminLogEntry } from './claim-store';
import {
    DETAIL_GAPS,
    missingDetails,
    missingDetailsChanged,
    type DetailGap,
} from './details';
import { DIRECTORY_TAG } from './index';
import type { FocusArea } from './options';

// The super-user dashboard's reads (design:
// documentation/features/18-unclaimed-organizations.md → Dashboard).
//
// Numbers come from count() aggregation queries: Firestore bills one read per
// 1,000 matching documents (at least one), so a count costs the same whether
// 5 or 500 organizations match. Lists are capped. Super users only.
//
// Indexes: the admin-log counts and feed, and the missing-details lists, need
// the composite indexes in firestore.indexes.json. Everything else is one
// field or equality filters, which single-field indexes serve.

const db = () => getAdminDb();
const organizations = () => db().collection('organizations');
const adminLog = () => db().collection('adminLog');
const millis = (value: unknown) =>
    value && typeof (value as { toMillis?: unknown }).toMillis === 'function'
        ? (value as { toMillis: () => number }).toMillis()
        : undefined;

async function count(
    label: string,
    query: FirebaseFirestore.Query
): Promise<number> {
    const snapshot = await query.count().get();
    logRead(`${label} (count)`);
    return snapshot.data().count;
}

const since = (query: FirebaseFirestore.Query, field: string, at: number) =>
    query.where(field, '>=', new Date(at));
const within = (
    query: FirebaseFirestore.Query,
    field: string,
    { start, end }: TimeRange
) => query.where(field, '>=', new Date(start)).where(field, '<', new Date(end));

const activeUnclaimed = () =>
    organizations()
        .where('claimStatus', '==', 'unclaimed')
        .where('status', '==', 'active');

// The counts are four cached groups, so one failing query (an index still
// building, say) only blanks the sections that use it.

export interface CoreCounts {
    /** When these were counted (epoch ms): cached for up to an hour. */
    at: number;
    organizations: {
        active: number;
        unclaimed: number;
        archived: number;
        /** Ever claimed from unclaimed (has claimedAt). */
        claimed: number;
        addedLast30: number;
        addedPrevious30: number;
        claimedLast30: number;
    };
    users: {
        total: number;
        last7: number;
        last30: number;
        previous30: number;
    };
    claims: {
        approved: number;
        denied: number;
        receivedLast30: number;
        receivedPrevious30: number;
    };
    definitions: number;
}

/** Organizations, accounts, claims and words: single-field indexes only, about 16 reads. */
export async function getCoreCounts(): Promise<CoreCounts> {
    'use cache';
    // Creating, editing, claiming and deleting clear these.
    cacheTag(DIRECTORY_TAG, CLAIMS_TAG, ADMIN_LOG_TAG);
    cacheLife('hours');
    const now = Date.now();
    const w = statWindows(now);
    const users = db().collection('users');
    const claims = db().collection('claimRequests');
    const [orgs, people, decided, definitions] = await Promise.all([
        Promise.all([
            count(
                'organizations',
                organizations().where('status', '==', 'active')
            ),
            count('organizations', activeUnclaimed()),
            count(
                'organizations',
                organizations().where('status', '==', 'archived')
            ),
            count('organizations', since(organizations(), 'claimedAt', 0)),
            count(
                'organizations',
                within(organizations(), 'createdAt', w.last30)
            ),
            count(
                'organizations',
                within(organizations(), 'createdAt', w.previous30)
            ),
            count(
                'organizations',
                since(organizations(), 'claimedAt', w.last30.start)
            ),
        ]),
        Promise.all([
            count('users', users),
            count('users', since(users, 'createdAt', w.last7.start)),
            count('users', since(users, 'createdAt', w.last30.start)),
            count('users', within(users, 'createdAt', w.previous30)),
        ]),
        Promise.all([
            count('claimRequests', claims.where('status', '==', 'approved')),
            count('claimRequests', claims.where('status', '==', 'denied')),
            count(
                'claimRequests',
                since(claims, 'requestedAt', w.last30.start)
            ),
            count('claimRequests', within(claims, 'requestedAt', w.previous30)),
        ]),
        count('definitions', db().collection('definitions')),
    ]);
    return {
        at: now,
        organizations: {
            active: orgs[0],
            unclaimed: orgs[1],
            archived: orgs[2],
            claimed: orgs[3],
            addedLast30: orgs[4],
            addedPrevious30: orgs[5],
            claimedLast30: orgs[6],
        },
        users: {
            total: people[0],
            last7: people[1],
            last30: people[2],
            previous30: people[3],
        },
        claims: {
            approved: decided[0],
            denied: decided[1],
            receivedLast30: decided[2],
            receivedPrevious30: decided[3],
        },
        definitions,
    };
}

/** Active unclaimed organizations missing each detail (composite index), 5 reads. */
export async function getGapCounts(): Promise<Record<DetailGap, number>> {
    'use cache';
    cacheTag(DIRECTORY_TAG);
    cacheLife('hours');
    const counts = await Promise.all(
        DETAIL_GAPS.map((gap) =>
            count(
                'organizations',
                activeUnclaimed().where('missingDetails', 'array-contains', gap)
            )
        )
    );
    return Object.fromEntries(
        DETAIL_GAPS.map((gap, i) => [gap, counts[i]])
    ) as Record<DetailGap, number>;
}

/** Super-user actions in the last 30 days, by group (composite index), 6 reads. */
export async function getActivityCounts(): Promise<
    Record<ActivityGroup, number>
> {
    'use cache';
    cacheTag(ADMIN_LOG_TAG);
    cacheLife('hours');
    const { last30 } = statWindows(Date.now());
    const groups = Object.keys(ACTIVITY_GROUPS) as ActivityGroup[];
    const counts = await Promise.all(
        groups.map((group) =>
            count(
                'adminLog',
                since(
                    adminLog().where('action', 'in', [
                        ...ACTIVITY_GROUPS[group],
                    ]),
                    'createdAt',
                    last30.start
                )
            )
        )
    );
    return Object.fromEntries(
        groups.map((group, i) => [group, counts[i]])
    ) as Record<ActivityGroup, number>;
}

/** Whether the missing-details backfill has run (one equality count, 1 read). */
export async function isMissingDetailsBackfilled(): Promise<boolean> {
    'use cache';
    cacheTag(ADMIN_LOG_TAG);
    cacheLife('hours');
    return (
        (await count(
            'adminLog',
            adminLog().where('action', '==', 'backfillDetails')
        )) > 0
    );
}

export interface BackfillResult {
    read: number;
    updated: number;
}

/**
 * Sets `missingDetails` on every organization written before it existed
 * (2026-11-27), from the app on Vercel so nobody needs production
 * credentials locally. Reads each organization once, writes only the ones
 * that change, and logs the run. Safe to repeat.
 */
export async function backfillMissingDetails(
    adminUid: string
): Promise<BackfillResult> {
    const PAGE = 300;
    let last: FirebaseFirestore.QueryDocumentSnapshot | undefined;
    let read = 0;
    let updated = 0;
    for (;;) {
        let query = organizations().orderBy('__name__').limit(PAGE);
        if (last) query = query.startAfter(last);
        const snapshot = await query.get();
        logRead('organizations', Math.max(snapshot.size, 1));
        if (snapshot.empty) break;
        read += snapshot.size;
        const batch = db().batch();
        let inBatch = 0;
        for (const doc of snapshot.docs) {
            const data = doc.data();
            if (!missingDetailsChanged(data.missingDetails, data)) continue;
            // Not updatedAt: nothing a person sees changed.
            batch.update(doc.ref, { missingDetails: missingDetails(data) });
            inBatch++;
        }
        if (inBatch > 0) await batch.commit();
        updated += inBatch;
        last = snapshot.docs.at(-1);
        if (snapshot.size < PAGE) break;
    }
    await adminLog().add({
        action: 'backfillDetails',
        orgName: '',
        actorUid: adminUid,
        count: updated,
        createdAt: FieldValue.serverTimestamp(),
    });
    return { read, updated };
}

export interface WeeklyTrends {
    weeks: TimeRange[];
    users: number[];
    organizations: number[];
    claims: number[];
}

/** New users, organizations and claim requests per week: 36 reads per cache miss. */
export async function getWeeklyTrends(): Promise<WeeklyTrends> {
    'use cache';
    cacheTag(DIRECTORY_TAG, CLAIMS_TAG);
    cacheLife('hours');
    const weeks = weeklyBuckets(Date.now());
    const per = (
        label: string,
        query: FirebaseFirestore.Query,
        field: string
    ) =>
        Promise.all(
            weeks.map((week) => count(label, within(query, field, week)))
        );
    const [users, orgs, claims] = await Promise.all([
        per('users', db().collection('users'), 'createdAt'),
        per('organizations', organizations(), 'createdAt'),
        per('claimRequests', db().collection('claimRequests'), 'requestedAt'),
    ]);
    return { weeks, users, organizations: orgs, claims };
}

export interface AdminOrganization {
    id: string;
    name: string;
    handle: string;
    focusAreas: FocusArea[];
    place: string;
    unclaimed: boolean;
    archived: boolean;
    createdAt?: number;
    missingDetails: DetailGap[];
}

function toAdminOrganization(
    doc: FirebaseFirestore.QueryDocumentSnapshot
): AdminOrganization {
    const d = doc.data();
    return {
        id: doc.id,
        name: d.name ?? '',
        handle: d.handle ?? '',
        focusAreas: d.focusAreas ?? [],
        place: d.location?.label ?? '',
        unclaimed: d.claimStatus === 'unclaimed',
        archived: d.status === 'archived',
        createdAt: millis(d.createdAt),
        missingDetails: Array.isArray(d.missingDetails) ? d.missingDetails : [],
    };
}

/** The newest organizations, any status, cached. */
export async function getRecentOrganizations(
    limit = 10
): Promise<AdminOrganization[]> {
    'use cache';
    cacheTag(DIRECTORY_TAG);
    cacheLife('hours');
    const snapshot = await organizations()
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
    logRead('organizations', Math.max(snapshot.size, 1));
    return snapshot.docs.map(toAdminOrganization);
}

/** Active unclaimed organizations missing a detail, oldest first, capped. */
export async function getOrganizationsMissing(
    gap: DetailGap,
    limit = 20
): Promise<AdminOrganization[]> {
    'use cache';
    cacheTag(DIRECTORY_TAG);
    cacheLife('hours');
    const snapshot = await activeUnclaimed()
        .where('missingDetails', 'array-contains', gap)
        .orderBy('createdAt', 'asc')
        .limit(limit)
        .get();
    logRead('organizations', Math.max(snapshot.size, 1));
    return snapshot.docs.map(toAdminOrganization);
}

/** At most this many search results. */
export const SEARCH_LIMIT = 10;

/**
 * Organizations whose handle or name starts with what was typed, any status.
 * Up to 30 reads (three prefix queries of 10), cached for a few minutes.
 */
export async function searchOrganizations(
    query: string
): Promise<AdminOrganization[]> {
    'use cache';
    cacheTag(DIRECTORY_TAG);
    cacheLife('minutes');
    const terms = searchTerms(query);
    if (!terms) return [];
    const prefix = (field: string, value: string) =>
        organizations()
            .where(field, '>=', value)
            .where(field, '<', value + '')
            .limit(SEARCH_LIMIT)
            .get();
    const snapshots = await Promise.all([
        ...(terms.handle ? [prefix('handle', terms.handle)] : []),
        ...terms.names.map((name) => prefix('name', name)),
    ]);
    const found = new Map<string, AdminOrganization>();
    for (const snapshot of snapshots) {
        logRead('organizations', Math.max(snapshot.size, 1));
        for (const doc of snapshot.docs)
            if (!found.has(doc.id)) found.set(doc.id, toAdminOrganization(doc));
    }
    return [...found.values()]
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, SEARCH_LIMIT);
}

/** The latest decisions and changes (not adds, edits or downloads), newest first. */
export async function getAdminFeed(limit = 20): Promise<AdminLogEntry[]> {
    'use cache';
    cacheTag(ADMIN_LOG_TAG);
    cacheLife('hours');
    const snapshot = await adminLog()
        .where('action', 'in', [...FEED_ACTIONS])
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
    logRead('adminLog', Math.max(snapshot.size, 1));
    return snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
            id: doc.id,
            action: d.action,
            orgName: d.orgName ?? '',
            actorUid: d.actorUid,
            targetName: d.target?.displayName,
            word: d.definition?.word,
            count: typeof d.count === 'number' ? d.count : undefined,
            at: millis(d.createdAt),
        };
    });
}
