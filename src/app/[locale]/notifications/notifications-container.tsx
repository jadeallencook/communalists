'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useActionState, useEffect, useState } from 'react';

import { comradeAction, type ComradeActionState } from '@/app/actions/comrades';
import { markNotificationsReadAction } from '@/app/actions/notifications';
import { ComradeRespondForm } from '@/components/molecules/comrade-request-list';
import type { NotificationItem } from '@/components/organisms/notification-list';
import { NotificationsPage } from '@/components/pages/notifications-page';
import { NOTIFICATIONS_PATH } from '@/lib/paths';

/** A notification from the server, before its actions are wired. */
export type NotificationRow = Omit<NotificationItem, 'actions'> & {
    actorUid?: string;
    /** A comrade request still waiting for this person's answer. */
    answerable: boolean;
};

/**
 * Wires /notifications: Accept and Decline on waiting requests, and marks
 * everything read once shown. Which ones were new is kept from the first
 * render, so the "New" marks stay while the page is open.
 */
export function NotificationsContainer({
    rows,
    more,
}: {
    rows: NotificationRow[] | null;
    more: boolean;
}) {
    const locale = useLocale();
    const t = useTranslations('Comrades');
    const [unread] = useState(
        () => new Set(rows?.filter((r) => r.unread).map((r) => r.id))
    );
    useEffect(() => {
        if (unread.size > 0) void markNotificationsReadAction();
    }, [unread]);
    const [result, formAction, pending] = useActionState<
        ComradeActionState,
        FormData
    >(comradeAction, {});

    const items: NotificationItem[] | null =
        rows?.map(({ actorUid, answerable, ...row }) => ({
            ...row,
            unread: unread.has(row.id),
            actions:
                actorUid && answerable ? (
                    <ComradeRespondForm
                        uid={actorUid}
                        name={row.actor?.name ?? ''}
                        next={NOTIFICATIONS_PATH}
                        locale={locale}
                        formAction={formAction}
                        pending={pending}
                        from="notifications"
                    />
                ) : undefined,
        })) ?? null;

    // An answered request leaves the list (it's done), so the result is
    // announced for the page and focus moves to its heading.
    const name =
        rows?.find((r) => r.actorUid === result.uid)?.actor?.name ?? '';
    return (
        <NotificationsPage
            items={items}
            more={more}
            focusKey={result.at}
            notice={result.done ? t(`done.${result.done}`) : undefined}
            error={
                result.error ? t(`errors.${result.error}`, { name }) : undefined
            }
        />
    );
}
