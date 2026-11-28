import 'server-only';

import {
    FieldValue,
    Timestamp,
    type Transaction,
} from 'firebase-admin/firestore';
import { cacheLife, cacheTag } from 'next/cache';

import { getAdminDb } from '@/lib/firebase/admin';
import { logRead } from '@/lib/firebase/read-log';

import {
    NOTIFICATIONS_SHOWN,
    notificationId,
    notificationOf,
    type NotificationKind,
    type StoredNotification,
} from '.';

// Notifications in Firestore (design: documentation/features/22-notifications.md).
//
//   notifications/{kind}~{ref}~{uid}   { uid, kind, actor?, ref, read, createdAt }
//
// Listed with `uid ==` ordered by `createdAt` (a composite index in
// firestore.indexes.json). Written inside the transaction that changes the
// thing they're about, so a notification never outlives it. Server only
// (Admin SDK); rules deny clients.

const db = () => getAdminDb();
const notifications = () => db().collection('notifications');
const millis = (value: unknown) =>
    value instanceof Timestamp ? value.toMillis() : 0;

/** A person's inbox. Clear it whenever a notification for them changes. */
export const notificationsTag = (uid: string) => `notifications:${uid}`;

/** A person's newest notifications, cached. The bell counts the unread ones. */
export async function getNotifications(
    uid: string
): Promise<StoredNotification[]> {
    'use cache';
    cacheTag(notificationsTag(uid));
    cacheLife('hours');
    const snapshot = await notifications()
        .where('uid', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(NOTIFICATIONS_SHOWN)
        .get();
    logRead('notifications', Math.max(snapshot.size, 1));
    return snapshot.docs.flatMap((doc) => {
        const d = doc.data();
        const n = notificationOf(doc.id, {
            ...d,
            createdAt: millis(d.createdAt),
        });
        return n ? [n] : [];
    });
}

/** Adds (or renews, as unread) a notification, inside the caller's transaction. */
export function notify(
    tx: Transaction,
    {
        uid,
        kind,
        ref,
        actor,
    }: { uid: string; kind: NotificationKind; ref: string; actor?: string }
): void {
    tx.set(notifications().doc(notificationId(kind, ref, uid)), {
        uid,
        kind,
        ref,
        ...(actor ? { actor } : {}),
        read: false,
        createdAt: FieldValue.serverTimestamp(),
    });
}

/** Removes a notification that no longer applies, inside the caller's transaction. */
export function unnotify(
    tx: Transaction,
    { uid, kind, ref }: { uid: string; kind: NotificationKind; ref: string }
): void {
    tx.delete(notifications().doc(notificationId(kind, ref, uid)));
}

/** Marks a person's unread notifications read. Returns how many changed. */
export async function markAllRead(uid: string): Promise<number> {
    const snapshot = await notifications()
        .where('uid', '==', uid)
        .where('read', '==', false)
        .limit(400)
        .get();
    logRead('notifications (unread)', Math.max(snapshot.size, 1));
    if (snapshot.empty) return 0;
    const batch = db().batch();
    for (const doc of snapshot.docs) batch.update(doc.ref, { read: true });
    await batch.commit();
    return snapshot.size;
}
