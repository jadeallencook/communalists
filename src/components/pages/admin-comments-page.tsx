'use client';

import { ArrowLeftIcon, CheckIcon, EyeOffIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/atoms/button';
import { Skeleton } from '@/components/atoms/skeleton';
import { ReasonDialog } from '@/components/molecules/reason-dialog';
import { Link } from '@/i18n/navigation';
import { paragraphsOf, type ReportReason } from '@/lib/comments';

export interface AdminReportedComment {
    /** The report's id. */
    key: string;
    /**
     * An organization's reply rather than a comment: who it's shown as from
     * ("South Bay Mutual Aid", or the Communalists team), and whose comment
     * it answers. `author` and `votes` are left out for a reply.
     */
    reply?: { from: string; to: string };
    /** What the comment is on, in the UI language, and its page. */
    on: { label: string; href: string; lang: string };
    /** Null when the comment was deleted meanwhile (only Dismiss is offered). */
    text: string | null;
    lang: string;
    /** Null when the account is gone. */
    author: string | null;
    /** Already formatted. */
    postedOn?: string;
    votes: number;
    reports: number;
    reasons: { reason: ReportReason; count: number }[];
}

export interface AdminCommentsPageProps {
    items: AdminReportedComment[];
    busy?: ReadonlySet<string>;
    onHide: (key: string) => void;
    onDelete: (key: string) => void;
    onDismiss: (key: string) => void;
    /** Already translated: the latest result or problem. */
    notice?: { tone: 'status' | 'alert'; text: string; at: number } | null;
}

/**
 * /admin/comments, for super users: comments people reported, most reported
 * first. Hide or delete one that breaks the rules, or dismiss the report.
 * After each, the result is announced and takes focus (the row is gone).
 */
export function AdminCommentsPage({
    items,
    busy = new Set(),
    onHide,
    onDelete,
    onDismiss,
    notice,
}: AdminCommentsPageProps) {
    const t = useTranslations('AdminComments');
    const noticeRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (notice) noticeRef.current?.focus();
    }, [notice]);

    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
            <header className="flex flex-col gap-3">
                <Link
                    href="/admin"
                    className="inline-flex w-fit items-center gap-1 text-sm underline underline-offset-4"
                >
                    <ArrowLeftIcon aria-hidden className="size-4" />
                    {t('backToAdmin')}
                </Link>
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                    {t('title')}
                </h1>
                <p className="text-pretty text-muted-foreground">
                    {t('intro')}
                </p>
            </header>

            <div
                ref={noticeRef}
                tabIndex={-1}
                className="outline-none focus-visible:ring-3 focus-visible:ring-ring"
            >
                <p role="status" className="text-sm font-medium empty:hidden">
                    {notice?.tone === 'status' ? notice.text : null}
                </p>
                <p
                    role="alert"
                    className="text-sm font-medium text-destructive empty:hidden"
                >
                    {notice?.tone === 'alert' ? notice.text : null}
                </p>
            </div>

            <section
                aria-labelledby="reported-title"
                className="flex flex-col gap-3"
            >
                <h2
                    id="reported-title"
                    className="font-heading text-xl font-semibold"
                >
                    {t('listTitle')}{' '}
                    <span className="ml-1 text-base font-normal text-muted-foreground">
                        {items.length}
                    </span>
                </h2>
                {items.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        {t('empty')}
                    </p>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {items.map((item) => {
                            const author = item.author ?? t('formerMember');
                            const pending = busy.has(item.key);
                            const { reply } = item;
                            // What the buttons name: the reply's sender, or the comment's author.
                            const label = (
                                comment:
                                    | 'hideLabel'
                                    | 'deleteLabel'
                                    | 'deleteTitle'
                                    | 'dismissLabel'
                            ) =>
                                reply
                                    ? t(`${comment}Reply`, {
                                          from: reply.from,
                                          name: reply.to,
                                      })
                                    : t(comment, { name: author });
                            return (
                                <li
                                    key={item.key}
                                    className="flex flex-col gap-3 rounded-lg border p-4"
                                >
                                    <div className="flex flex-col gap-1 text-sm">
                                        <p>
                                            {t.rich('on', {
                                                word: () => (
                                                    <Link
                                                        href={item.on.href}
                                                        lang={
                                                            item.on.lang ||
                                                            undefined
                                                        }
                                                        className="font-medium underline underline-offset-4"
                                                    >
                                                        {item.on.label}
                                                    </Link>
                                                ),
                                            })}
                                        </p>
                                        {reply ? (
                                            <p className="text-muted-foreground">
                                                {t('replyByOn', {
                                                    from: reply.from,
                                                    name: reply.to,
                                                    date: item.postedOn ?? '',
                                                })}
                                            </p>
                                        ) : (
                                            <p className="text-muted-foreground">
                                                {t('byOn', {
                                                    name: author,
                                                    date: item.postedOn ?? '',
                                                })}{' '}
                                                ·{' '}
                                                {t('votes', {
                                                    count: item.votes,
                                                })}
                                            </p>
                                        )}
                                    </div>
                                    {item.text === null ? (
                                        <p className="rounded-md bg-muted p-2 text-sm text-foreground">
                                            {t(reply ? 'goneReply' : 'gone')}
                                        </p>
                                    ) : (
                                        <blockquote
                                            lang={item.lang}
                                            className="flex flex-col gap-2 border-l-4 pl-3 break-words"
                                        >
                                            {paragraphsOf(item.text).map(
                                                (paragraph, i) => (
                                                    <p
                                                        key={i}
                                                        className="whitespace-pre-line"
                                                    >
                                                        {paragraph}
                                                    </p>
                                                )
                                            )}
                                        </blockquote>
                                    )}
                                    <div className="text-sm">
                                        <p className="font-medium">
                                            {t('reports', {
                                                count: item.reports,
                                            })}
                                        </p>
                                        <ul className="flex flex-wrap gap-x-4 gap-y-1">
                                            {item.reasons.map(
                                                ({ reason, count }) => (
                                                    <li key={reason}>
                                                        {t('reasonCount', {
                                                            reason: t(
                                                                `reasons.${reason}`
                                                            ),
                                                            count,
                                                        })}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {item.text !== null && (
                                            <>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={pending}
                                                    aria-label={label(
                                                        'hideLabel'
                                                    )}
                                                    onClick={() =>
                                                        onHide(item.key)
                                                    }
                                                >
                                                    <EyeOffIcon aria-hidden />
                                                    {t('hide')}
                                                </Button>
                                                <ReasonDialog
                                                    withReason={false}
                                                    triggerLabel={t('delete')}
                                                    triggerAriaLabel={label(
                                                        'deleteLabel'
                                                    )}
                                                    title={label('deleteTitle')}
                                                    description={t(
                                                        reply
                                                            ? 'deleteBodyReply'
                                                            : 'deleteBody'
                                                    )}
                                                    confirmLabel={t('delete')}
                                                    fields={{ key: item.key }}
                                                    formAction={() =>
                                                        onDelete(item.key)
                                                    }
                                                    pending={pending}
                                                    maxLength={0}
                                                />
                                            </>
                                        )}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={pending}
                                            aria-label={label('dismissLabel')}
                                            onClick={() => onDismiss(item.key)}
                                        >
                                            <CheckIcon aria-hidden />
                                            {t('dismiss')}
                                        </Button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </section>
    );
}

export function AdminCommentsPageLoading() {
    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
        </section>
    );
}
