'use client';

import { MessageSquareIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, type ReactNode } from 'react';

import { Button } from '@/components/atoms/button';
import { Skeleton } from '@/components/atoms/skeleton';
import { CommentItem } from '@/components/molecules/comment-item';
import { Link } from '@/i18n/navigation';
import {
    commentAbilities,
    DISCUSSION_ANCHOR,
    type CommentSort,
    type CommentView,
    type ReportReason,
} from '@/lib/comments';

export type DiscussionViewer =
    /** Signed out: invited to sign up. */
    | { status: 'signedOut'; signUpHref: string; signInHref: string }
    /** Signed in, but account setup isn't finished (no name or username yet). */
    | { status: 'setupNeeded'; setupHref: string }
    | { status: 'ready'; moderator: boolean };

export interface DiscussionProps {
    viewer: DiscussionViewer;
    count: number;
    comments: CommentView[];
    sort: CommentSort;
    onSortChange: (sort: CommentSort) => void;
    hasMore: boolean;
    onLoadMore: () => void;
    loading?: 'sort' | 'more' | null;
    /** Loading more failed: the button offers to try again. */
    loadFailed?: boolean;
    /** The comment form (`CommentForm`), for viewers who can post. */
    form?: ReactNode;
    /** Comments with a request on its way. */
    busy?: ReadonlySet<string>;
    onVote: (id: string) => void;
    onReport: (id: string, reason: ReportReason) => void;
    onDelete: (id: string) => void;
    onHide: (id: string, hidden: boolean) => void;
    /** Already translated: the latest result or problem. */
    notice?: { tone: 'status' | 'alert'; text: string; at: number } | null;
    /** Move focus to this comment, or (with no id) to the notice. */
    focus?: { id: string | null; at: number } | null;
    /** Extra attributes for the sign-up and sign-in links (analytics). */
    joinProps?: {
        signUp?: Record<string, string>;
        signIn?: Record<string, string>;
    };
}

/**
 * The discussion on a word's page: anyone can read it; signed-in people
 * comment, up vote and report; super users hide and delete. One flat list,
 * Top or Newest. Results are announced, and focus follows what was acted on.
 */
export function Discussion({
    viewer,
    count,
    comments,
    sort,
    onSortChange,
    hasMore,
    onLoadMore,
    loading = null,
    loadFailed = false,
    form,
    busy = new Set(),
    onVote,
    onReport,
    onDelete,
    onHide,
    notice,
    focus,
    joinProps,
}: DiscussionProps) {
    const t = useTranslations('Discussion');
    const noticeRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (focus && focus.id === null) noticeRef.current?.focus();
    }, [focus]);

    const moderator = viewer.status === 'ready' && viewer.moderator;

    return (
        <section
            id={DISCUSSION_ANCHOR}
            aria-labelledby="discussion-title"
            className="flex scroll-mt-20 flex-col gap-4 border-t pt-8"
        >
            <div className="flex flex-col gap-1">
                <h2
                    id="discussion-title"
                    className="font-heading text-2xl font-semibold"
                >
                    {t('title')}{' '}
                    <span className="ml-1 text-base font-normal text-muted-foreground">
                        {t('count', { count })}
                    </span>
                </h2>
                <p className="text-pretty text-muted-foreground">
                    {t('intro')}
                </p>
            </div>

            {viewer.status === 'signedOut' && (
                <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-4">
                    <p className="flex items-start gap-2 font-medium">
                        <MessageSquareIcon
                            aria-hidden
                            className="mt-0.5 size-5 shrink-0"
                        />
                        {t('joinTitle')}
                    </p>
                    <p className="text-sm text-pretty">{t('joinBody')}</p>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild>
                            <Link
                                href={viewer.signUpHref}
                                {...joinProps?.signUp}
                            >
                                {t('signUp')}
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link
                                href={viewer.signInHref}
                                {...joinProps?.signIn}
                            >
                                {t('signIn')}
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
            {viewer.status === 'setupNeeded' && (
                <div className="flex flex-col items-start gap-3 rounded-lg border bg-muted/40 p-4">
                    <p className="text-sm text-pretty">{t('setupBody')}</p>
                    <Button asChild>
                        <Link href={viewer.setupHref}>{t('setup')}</Link>
                    </Button>
                </div>
            )}
            {viewer.status === 'ready' && form}

            <div
                ref={noticeRef}
                tabIndex={-1}
                className="outline-none focus-visible:ring-3 focus-visible:ring-ring"
            >
                {/* Two regions, always present, so changes are announced. */}
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

            {(count > 0 || comments.length > 0) && (
                <div
                    role="group"
                    aria-label={t('sortLabel')}
                    className="flex flex-wrap items-center gap-2"
                >
                    <span aria-hidden className="text-sm text-muted-foreground">
                        {t('sortLabel')}
                    </span>
                    {(['top', 'newest'] as const).map((option) => (
                        <Button
                            key={option}
                            type="button"
                            size="sm"
                            variant={sort === option ? 'default' : 'outline'}
                            aria-pressed={sort === option}
                            // Not `disabled`, which would drop focus; the
                            // hook ignores presses while loading.
                            aria-disabled={loading !== null || undefined}
                            onClick={() => onSortChange(option)}
                        >
                            {t(option === 'top' ? 'sortTop' : 'sortNewest')}
                        </Button>
                    ))}
                </div>
            )}

            {loading === 'sort' ? (
                <DiscussionListLoading />
            ) : comments.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    {t('empty')}
                </p>
            ) : (
                <ol
                    aria-labelledby="discussion-title"
                    className="flex flex-col gap-3"
                >
                    {comments.map((comment) => (
                        <li key={comment.id}>
                            <CommentItem
                                comment={comment}
                                can={commentAbilities(comment, {
                                    signedIn: viewer.status === 'ready',
                                    moderator,
                                })}
                                busy={busy.has(comment.id)}
                                focusKey={
                                    focus?.id === comment.id
                                        ? focus.at
                                        : undefined
                                }
                                onVote={() => onVote(comment.id)}
                                onReport={(reason) =>
                                    onReport(comment.id, reason)
                                }
                                onDelete={() => onDelete(comment.id)}
                                onHide={(hidden) => onHide(comment.id, hidden)}
                            />
                        </li>
                    ))}
                </ol>
            )}

            {hasMore && loading !== 'sort' && (
                <Button
                    type="button"
                    variant="outline"
                    className="self-start"
                    aria-disabled={loading === 'more' || undefined}
                    onClick={onLoadMore}
                >
                    {loading === 'more'
                        ? t('loadingMore')
                        : loadFailed
                          ? t('tryAgain')
                          : t('showMore')}
                </Button>
            )}
        </section>
    );
}

/** While comments load. Pulses only when motion is allowed. */
export function DiscussionListLoading() {
    return (
        <div className="flex flex-col gap-3" aria-hidden>
            {[0, 1, 2].map((i) => (
                <Skeleton
                    key={i}
                    className="h-24 w-full motion-reduce:animate-none"
                />
            ))}
        </div>
    );
}
