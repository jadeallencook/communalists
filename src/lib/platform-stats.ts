// The super-user dashboard's numbers: time windows, weekly buckets, how two
// periods compare, which admin-log actions the activity feed shows, and the
// organization search's terms. Pure: no React, Next or Firebase. The
// Firestore side is src/lib/organizations/stats-store.ts.
// Design: documentation/features/18-unclaimed-organizations.md → Dashboard.

import type { AdminAction } from './organizations/claims';
import { suggestHandle } from './organizations/handle';

export const DAY_MS = 24 * 60 * 60 * 1000;
export const WEEK_MS = 7 * DAY_MS;
/** How many weeks the trend charts show. */
export const TREND_WEEKS = 12;

/** [start, end) in epoch ms. */
export interface TimeRange {
    start: number;
    end: number;
}

/**
 * Rolling windows ending now. Rolling (not calendar) windows don't depend on
 * a time zone, so "the last 7 days" means the same for every super user.
 */
export function statWindows(now: number) {
    return {
        last7: { start: now - 7 * DAY_MS, end: now },
        last30: { start: now - 30 * DAY_MS, end: now },
        previous30: { start: now - 60 * DAY_MS, end: now - 30 * DAY_MS },
    };
}

/** `weeks` back-to-back 7-day ranges ending now, oldest first. */
export function weeklyBuckets(
    now: number,
    weeks: number = TREND_WEEKS
): TimeRange[] {
    return Array.from({ length: weeks }, (_, i) => {
        const end = now - (weeks - 1 - i) * WEEK_MS;
        return { start: end - WEEK_MS, end };
    });
}

export type Trend = 'up' | 'down' | 'same';

/** How this period compares with the one before it. */
export function comparePeriods(current: number, previous: number) {
    const change = current - previous;
    const trend: Trend = change > 0 ? 'up' : change < 0 ? 'down' : 'same';
    return { change: Math.abs(change), trend };
}

/** Whole days since `at` (0 on the same day), never negative. */
export function daysSince(at: number | undefined, now: number): number {
    if (!at) return 0;
    return Math.max(0, Math.floor((now - at) / DAY_MS));
}

/** A claim waiting this many days or more is shown as overdue. */
export const CLAIM_OVERDUE_DAYS = 3;

/** Share of `part` in `whole`, as a whole percent (0 when there's no whole). */
export function percent(part: number, whole: number): number {
    if (whole <= 0) return 0;
    return Math.round((part / whole) * 100);
}

/**
 * The team's activity, counted for the last 30 days. Each group is one count
 * query (`action in [...]`), so the dashboard costs one read per group.
 */
export const ACTIVITY_GROUPS = {
    added: ['createUnclaimed'],
    edited: ['editUnclaimed'],
    claims: ['approveClaim', 'approveRemoval', 'denyClaim'],
    lifecycle: ['deleteUnclaimed', 'restoreOrganization', 'makeUnclaimed'],
    words: ['createDefinition', 'editDefinition'],
    exports: ['exportOrganizations'],
} as const satisfies Record<string, readonly AdminAction[]>;

export type ActivityGroup = keyof typeof ACTIVITY_GROUPS;

/**
 * What the activity feed lists one by one. Adding and editing organizations,
 * and downloads, are left out: an import adds hundreds of entries at once,
 * which would push every decision off the list. They're counted instead.
 */
export const FEED_ACTIONS = [
    'approveClaim',
    'approveRemoval',
    'denyClaim',
    'deleteUnclaimed',
    'restoreOrganization',
    'makeUnclaimed',
    'createDefinition',
    'editDefinition',
] as const satisfies readonly AdminAction[];

/** The longest search we'll run. */
export const SEARCH_MAX = 60;

/**
 * What a typed search looks up: a handle prefix ("oakland auto" →
 * "oakland-auto") and name prefixes as typed and with a capital first letter
 * (Firestore range queries are case-sensitive). Null when there's nothing to
 * search for.
 */
export function searchTerms(
    query: string | undefined
): { handle: string; names: string[] } | null {
    const typed = (query ?? '').trim().slice(0, SEARCH_MAX);
    if (!typed) return null;
    const capitalized = typed.charAt(0).toUpperCase() + typed.slice(1);
    const names = [...new Set([typed, capitalized])];
    return { handle: suggestHandle(typed), names };
}
