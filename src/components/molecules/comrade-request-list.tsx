'use client';

import { UsersIcon } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/atoms/button';
import { Avatar } from '@/components/molecules/avatar';
import { Link } from '@/i18n/navigation';
import { track } from '@/lib/analytics';
import { profilePath } from '@/lib/paths';

export interface ComradeRequestItem {
    uid: string;
    name: string;
    username: string;
    /** Their small photo, only if this viewer may see it. */
    photo?: string;
    /** When they asked (epoch ms). */
    at: number;
}

/** Where a list of requests is shown, for analytics. */
export type ComradeRequestPlace = 'dashboard' | 'notifications';

export interface ComradeRespondFormProps {
    uid: string;
    name: string;
    /** This page's path, to come back to after signing in. */
    next: string;
    locale: string;
    /** comradeAction. Reads `uid` and the pressed button's `intent`. */
    formAction: (formData: FormData) => void;
    pending?: boolean;
    from: ComradeRequestPlace;
}

/**
 * Accept and Decline for one request, as one form: the pressed button sends
 * its `intent`. Each button names the person for screen readers, since a
 * list has many.
 */
export function ComradeRespondForm({
    uid,
    name,
    next,
    locale,
    formAction,
    pending = false,
    from,
}: ComradeRespondFormProps) {
    const t = useTranslations('Comrades');
    const busy = {
        'aria-disabled': pending,
        onClick: (e: React.MouseEvent) => {
            if (pending) e.preventDefault();
        },
        className: 'aria-disabled:opacity-50',
    };
    return (
        <form action={formAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="uid" value={uid} />
            <input type="hidden" name="next" value={next} />
            <input type="hidden" name="locale" value={locale} />
            <Button
                type="submit"
                name="intent"
                value="accept"
                size="sm"
                {...busy}
                {...track('comrade-accept', { from })}
            >
                {t('accept')}
                <span className="sr-only">: {name}</span>
            </Button>
            <Button
                type="submit"
                name="intent"
                value="decline"
                size="sm"
                variant="outline"
                {...busy}
                {...track('comrade-decline', { from })}
            >
                {t('decline')}
                <span className="sr-only">: {name}</span>
            </Button>
        </form>
    );
}

export interface ComradeRequestListProps extends Omit<
    ComradeRespondFormProps,
    'uid' | 'name'
> {
    /** Requests waiting for this person's answer, newest first; null if they couldn't load. */
    requests: ComradeRequestItem[] | null;
    /** Already translated confirmation of the last answer. */
    notice?: string;
    /** Already translated. */
    error?: string;
    /** Changes after each answer: focus moves to the heading (the row is gone). */
    focusKey?: number;
}

/**
 * "Comrade requests" on the dashboard: who wants to be your comrade, with
 * Accept and Decline. Shows nothing when there are none and nothing was
 * just answered. No logic.
 */
export function ComradeRequestList({
    requests,
    notice,
    error,
    focusKey,
    ...form
}: ComradeRequestListProps) {
    const t = useTranslations('Comrades');
    const format = useFormatter();
    const headingRef = useRef<HTMLHeadingElement>(null);
    useEffect(() => {
        if (focusKey) headingRef.current?.focus();
    }, [focusKey]);
    if (requests && requests.length === 0 && !notice && !error) return null;

    return (
        <section
            aria-labelledby="comrade-requests-title"
            className="flex flex-col gap-3 rounded-lg border p-4"
        >
            <h2
                ref={headingRef}
                id="comrade-requests-title"
                tabIndex={-1}
                className="flex items-center gap-2 font-heading text-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <UsersIcon aria-hidden className="size-4" />
                {t('requestsTitle')}
            </h2>
            {requests === null ? (
                <p className="text-sm text-muted-foreground">
                    {t('requestsFailed')}
                </p>
            ) : (
                requests.length > 0 && (
                    <>
                        <p className="text-sm text-muted-foreground">
                            {t('requestsCount', { count: requests.length })}
                        </p>
                        <ul className="flex flex-col gap-2">
                            {requests.map((r) => (
                                <li
                                    key={r.uid}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <Avatar
                                            name={r.name}
                                            photo={r.photo}
                                            size={40}
                                        />
                                        <div className="flex min-w-0 flex-col text-sm">
                                            <Link
                                                href={profilePath(r.username)}
                                                className="font-medium break-words underline-offset-4 hover:underline"
                                            >
                                                {r.name}
                                            </Link>
                                            <span className="text-muted-foreground">
                                                {t('requestedAt', {
                                                    when: format.dateTime(
                                                        new Date(r.at),
                                                        {
                                                            dateStyle: 'medium',
                                                        }
                                                    ),
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <ComradeRespondForm
                                        {...form}
                                        uid={r.uid}
                                        name={r.name}
                                    />
                                </li>
                            ))}
                        </ul>
                    </>
                )
            )}
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
        </section>
    );
}
