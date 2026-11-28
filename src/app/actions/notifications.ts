'use server';

import { refresh, updateTag } from 'next/cache';

import { getSessionUser } from '@/lib/auth/session';
import { markAllRead, notificationsTag } from '@/lib/notifications/store';

/**
 * Marks the signed-in person's notifications read: /notifications calls it
 * once it has shown them, so the bell's count clears (decision #74).
 */
export async function markNotificationsReadAction(): Promise<void> {
    const user = await getSessionUser();
    if (!user) return;
    try {
        const changed = await markAllRead(user.uid);
        if (!changed) return;
    } catch (error) {
        // The inbox still shows; the bell keeps its count until next time.
        console.error(
            '[notifications] mark read failed',
            (error as Error).message
        );
        return;
    }
    updateTag(notificationsTag(user.uid));
    refresh();
}
