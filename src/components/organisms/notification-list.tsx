import { useFormatter, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Avatar } from '@/components/molecules/avatar';
import { Link } from '@/i18n/navigation';
import type { NotificationKind } from '@/lib/notifications';
import { profilePath } from '@/lib/paths';

/** One notification, ready to show. Add a kind in src/lib/notifications first. */
export interface NotificationItem {
    id: string;
    kind: NotificationKind;
    /** Who did it, as this viewer may see them; missing if the account is gone. */
    actor?: { name: string; username: string; photo?: string };
    at: number;
    /** New since they last opened this page. */
    unread: boolean;
    /** For a comrade request still waiting: Accept and Decline. */
    actions?: ReactNode;
}

export interface NotificationListProps {
    /** Newest first; null if they couldn't load. */
    items: NotificationItem[] | null;
    /** Whether older ones exist beyond those shown. */
    more?: boolean;
}

/**
 * The inbox on /notifications: each notification with who and when, new
 * ones marked (in words, not only colour). Rows can carry their own actions,
 * like answering a comrade request. No logic.
 */
export function NotificationList({
    items,
    more = false,
}: NotificationListProps) {
    const t = useTranslations('Notifications');
    const format = useFormatter();
    if (items === null)
        return (
            <p
                role="alert"
                className="rounded-lg border border-dashed p-4 text-sm"
            >
                {t('loadFailed')}
            </p>
        );
    if (items.length === 0)
        return (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                {t('empty')}
            </p>
        );
    return (
        <div className="flex flex-col gap-3">
            <ul className="flex flex-col gap-2">
                {items.map((item) => {
                    const name = item.actor?.name ?? t('someone');
                    const date = new Date(item.at);
                    return (
                        <li
                            key={item.id}
                            className={
                                'flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between' +
                                (item.unread
                                    ? ' border-primary bg-primary/5'
                                    : '')
                            }
                        >
                            <div className="flex min-w-0 items-start gap-3">
                                <Avatar
                                    name={name}
                                    photo={item.actor?.photo}
                                    size={40}
                                />
                                <div className="flex min-w-0 flex-col gap-0.5 text-sm">
                                    <p className="break-words">
                                        {item.unread && (
                                            <span className="me-2 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                                                {t('new')}
                                            </span>
                                        )}
                                        {t.rich(`kinds.${item.kind}`, {
                                            name,
                                            person: (chunks) =>
                                                item.actor ? (
                                                    <Link
                                                        href={profilePath(
                                                            item.actor.username
                                                        )}
                                                        className="font-medium underline underline-offset-4 hover:decoration-2"
                                                    >
                                                        {chunks}
                                                    </Link>
                                                ) : (
                                                    <span className="font-medium">
                                                        {chunks}
                                                    </span>
                                                ),
                                        })}
                                    </p>
                                    <time
                                        dateTime={date.toISOString()}
                                        className="text-muted-foreground"
                                    >
                                        {format.dateTime(date, {
                                            dateStyle: 'medium',
                                        })}
                                    </time>
                                </div>
                            </div>
                            {item.actions}
                        </li>
                    );
                })}
            </ul>
            {more && (
                <p className="text-sm text-muted-foreground">
                    {t('olderHidden')}
                </p>
            )}
        </div>
    );
}
