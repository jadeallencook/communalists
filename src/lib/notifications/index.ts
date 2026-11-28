// Notifications: a person's in-app inbox (decision #74). Comrade requests are
// the first kind; organizations posting events, asking members for things
// and library checkouts are planned to use the same inbox, each as a new
// `kind`. Pure (no React, Next or Firebase).
// Design: documentation/features/22-notifications.md.

/** Stored keys; never rename. Add a kind here, then its row in NotificationList. */
export const NOTIFICATION_KINDS = [
    'comradeRequest',
    'comradeAccepted',
] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

/** The inbox shows this many, newest first; older ones aren't listed. */
export const NOTIFICATIONS_SHOWN = 50;

/**
 * `notifications/{kind}~{ref}~{uid}`: one per thing per person, so sending
 * the same thing twice updates it instead of adding a copy, and it can be
 * removed when it no longer applies (a request that was answered).
 * `ref` names the thing (a comradeship's pair id).
 */
export function notificationId(
    kind: NotificationKind,
    ref: string,
    uid: string
): string {
    return `${kind}~${ref}~${uid}`;
}

/** A stored notification as its owner sees it. `at` is epoch ms. */
export interface StoredNotification {
    id: string;
    kind: NotificationKind;
    /** Who did it (a person's uid), when someone did. */
    actor?: string;
    /** What it's about: a comradeship's pair id. */
    ref: string;
    at: number;
    read: boolean;
}

/** Reads one stored notification, or null for an unknown kind (from a newer version). */
export function notificationOf(
    id: string,
    data: unknown
): StoredNotification | null {
    const d = (data ?? {}) as Record<string, unknown>;
    if (!(NOTIFICATION_KINDS as readonly unknown[]).includes(d.kind))
        return null;
    if (typeof d.ref !== 'string') return null;
    return {
        id,
        kind: d.kind as NotificationKind,
        ...(typeof d.actor === 'string' ? { actor: d.actor } : {}),
        ref: d.ref,
        at: typeof d.createdAt === 'number' ? d.createdAt : 0,
        read: d.read === true,
    };
}

/** The bell's number: up to 9, then "9+". Empty when there's nothing new. */
export function unreadBadge(count: number): string {
    if (count <= 0) return '';
    return count > 9 ? '9+' : String(count);
}
