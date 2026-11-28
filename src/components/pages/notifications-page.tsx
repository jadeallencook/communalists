'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import { Skeleton } from '@/components/atoms/skeleton';
import {
    NotificationList,
    type NotificationListProps,
} from '@/components/organisms/notification-list';

export interface NotificationsPageProps extends NotificationListProps {
    /** Already translated result of answering a request. */
    notice?: string;
    /** Already translated. */
    error?: string;
    /** Changes after each answer: focus moves to the heading (the row is gone). */
    focusKey?: number;
}

/** /notifications: the signed-in person's inbox, newest first. */
export function NotificationsPage({
    notice,
    error,
    focusKey,
    ...list
}: NotificationsPageProps) {
    const t = useTranslations('Notifications');
    const headingRef = useRef<HTMLHeadingElement>(null);
    useEffect(() => {
        if (focusKey) headingRef.current?.focus();
    }, [focusKey]);
    return (
        <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
            <h1
                ref={headingRef}
                tabIndex={-1}
                className="font-heading text-3xl font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                {t('title')}
            </h1>
            <p
                role="status"
                className="text-sm text-muted-foreground empty:hidden"
            >
                {notice}
            </p>
            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {error}
                </p>
            )}
            <NotificationList {...list} />
        </section>
    );
}

/** Shown while the inbox loads. */
export function NotificationsPageLoading() {
    return (
        <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
            <Skeleton className="h-9 w-48" />
            {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
            ))}
        </section>
    );
}
