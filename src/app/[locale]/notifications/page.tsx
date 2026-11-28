import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { NotificationsPageLoading } from '@/components/pages/notifications-page';
import { requireAccount } from '@/lib/auth/require-account';
import { relationsTo } from '@/lib/comrades/relations';
import { getComradeships } from '@/lib/comrades/store';
import { NOTIFICATIONS_SHOWN } from '@/lib/notifications';
import { getNotifications } from '@/lib/notifications/store';
import { NOTIFICATIONS_PATH } from '@/lib/paths';
import { visiblePhoto } from '@/lib/profiles';
import { getUserProfile } from '@/lib/users';

import {
    NotificationsContainer,
    type NotificationRow,
} from './notifications-container';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Notifications');
    return { title: t('metaTitle'), robots: { index: false } };
}

// Reads the session, so it streams behind <Suspense>. Design:
// documentation/features/22-notifications.md.
export default function Page() {
    return (
        <Suspense fallback={<NotificationsPageLoading />}>
            <NotificationsServerContainer />
        </Suspense>
    );
}

async function NotificationsServerContainer() {
    const { user } = await requireAccount(NOTIFICATIONS_PATH);
    let rows: NotificationRow[] | null;
    let more = false;
    try {
        const [stored, pairs] = await Promise.all([
            getNotifications(user.uid),
            getComradeships(user.uid),
        ]);
        more = stored.length >= NOTIFICATIONS_SHOWN;
        const actors = await Promise.all(
            stored.map((n) => (n.actor ? getUserProfile(n.actor) : null))
        );
        const relations = await relationsTo(
            user.uid,
            stored.flatMap((n, i) =>
                n.actor && actors[i]
                    ? [
                          {
                              uid: n.actor,
                              visibility: actors[i].profile.visibility,
                          },
                      ]
                    : []
            )
        );
        // A request is answerable while it's still waiting for this person.
        const waiting = new Set(
            pairs
                .filter((p) => p.status === 'pending' && p.from !== user.uid)
                .map((p) => p.other)
        );
        rows = stored.map((n, i) => {
            const actor = actors[i];
            return {
                id: n.id,
                kind: n.kind,
                at: n.at,
                unread: !n.read,
                actorUid: n.actor,
                actor:
                    actor?.displayName && actor.username
                        ? {
                              name: actor.displayName,
                              username: actor.username,
                              photo: visiblePhoto(
                                  actor.photo?.small,
                                  actor.profile.visibility,
                                  relations.get(n.actor!) ?? 'signedIn'
                              ),
                          }
                        : undefined,
                answerable:
                    n.kind === 'comradeRequest' &&
                    !!n.actor &&
                    waiting.has(n.actor),
            };
        });
    } catch (error) {
        console.error('[notifications] read failed', (error as Error).message);
        rows = null;
    }
    return <NotificationsContainer rows={rows} more={more} />;
}
