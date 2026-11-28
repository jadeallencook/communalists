'use client';

import { MessageSquareIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, type ReactNode } from 'react';

import { Button } from '@/components/atoms/button';
import { Skeleton } from '@/components/atoms/skeleton';
import { CommentItem } from '@/components/molecules/comment-item';
import { Link } from '@/i18n/navigation';
import { localeNames, type Locale } from '@/i18n/routing';
import {
    commentAbilities,
    DISCUSSION_ANCHOR,
    type CommentCounts,
    type CommentLang,
    type CommentLanguageFilter,
    type CommentSort,
    type CommentView,
    type ReportReason,
} from '@/lib/comments';

export type DiscussionViewer =
    /** Signed out: invited to sign up. */
    | { status: 'signedOut'; signUpHref: string; signInHref: string }
    /** Signed in, but account setup isn't finished (no name or username yet). */
    | { status: 'setupNeeded'; setupHref: string }
    | {
          status: 'ready';
          moderator: boolean;
          /** Writes the organization's replies: its owners and moderators (super users on an unclaimed page). */
          replier?: boolean;
      };

export interface DiscussionProps {
    viewer: DiscussionViewer;
    /** What it's under, which changes the intro and the empty message. */
    about?: 'definition' | 'organization';
    /** The organization's name, for its replies ("Reply from …"). */
    organizationName?: string;
    /** How many comments, in all and per language. */
    counts: CommentCounts;
    comments: CommentView[];
    sort: CommentSort;
    onSortChange: (sort: CommentSort) => void;
    /** The reader's language (the UI's): offered beside "All languages". */
    readerLanguage: CommentLang;
    /** Which comments are shown: the reader's language, or all. */
    language: CommentLanguageFilter;
    /** `focusFirst`: the button pressed goes away, so focus the first comment shown. */
    onLanguageChange: (
        language: CommentLanguageFilter,
        focusFirst?: boolean
    ) => void;
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
    /** Move focus to this comment (or its reply, or its Reply button), or (with no id) to the notice. */
    focus?: {
        id: string | null;
        at: number;
        part?: 'reply' | 'replyButton';
    } | null;
    /** The comment whose reply form is open, and the form (`CommentForm` with `reply`). */
    replyingTo?: string | null;
    replyForm?: ReactNode;
    onReplyOpen?: (id: string) => void;
    onReplyReport?: (id: string, reason: ReportReason) => void;
    onReplyDelete?: (id: string) => void;
    onReplyHide?: (id: string, hidden: boolean) => void;
    /** Extra attributes for the sign-up and sign-in links (analytics). */
    joinProps?: {
        signUp?: Record<string, string>;
        signIn?: Record<string, string>;
    };
}

/**
 * The discussion on a word's or an organization's page: anyone can read it;
 * signed-in people comment, up vote and report; super users hide and
 * delete. On organizations, its owners and moderators add one reply per
 * comment. One flat list, Top or Newest, in one language or all. Results
 * are announced, and focus follows what was acted on.
 */
export function Discussion({
    viewer,
    about = 'definition',
    organizationName,
    counts,
    comments,
    sort,
    onSortChange,
    readerLanguage,
    language,
    onLanguageChange,
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
    replyingTo = null,
    replyForm,
    onReplyOpen,
    onReplyReport,
    onReplyDelete,
    onReplyHide,
}: DiscussionProps) {
    const t = useTranslations('Discussion');
    const noticeRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (focus && focus.id === null) noticeRef.current?.focus();
    }, [focus]);

    const moderator = viewer.status === 'ready' && viewer.moderator;
    const replier = viewer.status === 'ready' && viewer.replier === true;
    const copy = about === 'organization' ? 'organization.' : '';
    const focusOn = (id: string, part?: 'reply' | 'replyButton') =>
        focus?.id === id && focus.part === part ? focus.at : undefined;

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
                        {t('count', { count: counts.all })}
                    </span>
                </h2>
                <p className="text-pretty text-muted-foreground">
                    {t(`${copy}intro`)}
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

            {counts.all > 0 && (
                <div className="flex flex-col gap-2">
                    <ChoiceRow
                        label={t('languageLabel')}
                        options={(
                            [readerLanguage, 'all'] as CommentLanguageFilter[]
                        ).map((option) => ({
                            value: option,
                            text:
                                option === 'all'
                                    ? t('languageAll', { count: counts.all })
                                    : t('languageOne', {
                                          language: localeNames[option],
                                          count: counts[option],
                                      }),
                            lang: option === 'all' ? undefined : option,
                        }))}
                        value={language}
                        loading={loading !== null}
                        onChange={onLanguageChange}
                    />
                    <ChoiceRow
                        label={t('sortLabel')}
                        options={(['top', 'newest'] as const).map((option) => ({
                            value: option,
                            text: t(
                                option === 'top' ? 'sortTop' : 'sortNewest'
                            ),
                        }))}
                        value={sort}
                        loading={loading !== null}
                        onChange={onSortChange}
                    />
                </div>
            )}

            {loading === 'sort' ? (
                <DiscussionListLoading />
            ) : comments.length === 0 ? (
                language !== 'all' && counts.all > 0 ? (
                    // None in their language, but some in others: say so.
                    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-4 text-sm">
                        <p className="text-muted-foreground">
                            {t('emptyLanguage', {
                                language: localeNames[language as Locale],
                            })}
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onLanguageChange('all', true)}
                        >
                            {t('seeOtherLanguages', { count: counts.all })}
                        </Button>
                    </div>
                ) : (
                    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        {t(`${copy}empty`)}
                    </p>
                )
            ) : (
                <ol
                    aria-labelledby="discussion-title"
                    className="flex flex-col gap-3"
                >
                    {comments.map((comment) => (
                        <li key={comment.id}>
                            <CommentItem
                                comment={comment}
                                languageName={
                                    comment.lang === readerLanguage
                                        ? undefined
                                        : localeNames[comment.lang]
                                }
                                can={commentAbilities(comment, {
                                    signedIn: viewer.status === 'ready',
                                    moderator,
                                    replier,
                                })}
                                busy={busy.has(comment.id)}
                                focusKey={focusOn(comment.id)}
                                replyFocusKey={focusOn(comment.id, 'reply')}
                                replyButtonFocusKey={focusOn(
                                    comment.id,
                                    'replyButton'
                                )}
                                organizationName={organizationName}
                                replier={replier}
                                replyForm={
                                    replyingTo === comment.id
                                        ? replyForm
                                        : undefined
                                }
                                onReplyOpen={() => onReplyOpen?.(comment.id)}
                                onReplyReport={(reason) =>
                                    onReplyReport?.(comment.id, reason)
                                }
                                onReplyDelete={() =>
                                    onReplyDelete?.(comment.id)
                                }
                                onReplyHide={(hidden) =>
                                    onReplyHide?.(comment.id, hidden)
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

/**
 * A labelled row of toggle buttons, one pressed (the language, the order).
 * Buttons aren't `disabled` while loading, which would drop focus; the hook
 * ignores presses then.
 */
function ChoiceRow<T extends string>({
    label,
    options,
    value,
    loading,
    onChange,
}: {
    label: string;
    options: { value: T; text: string; lang?: string }[];
    value: T;
    loading: boolean;
    onChange: (value: T) => void;
}) {
    return (
        <div
            role="group"
            aria-label={label}
            className="flex flex-wrap items-center gap-2"
        >
            <span aria-hidden className="text-sm text-muted-foreground">
                {label}
            </span>
            {options.map((option) => (
                <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    lang={option.lang}
                    variant={value === option.value ? 'default' : 'outline'}
                    aria-pressed={value === option.value}
                    aria-disabled={loading || undefined}
                    onClick={() => onChange(option.value)}
                >
                    {option.text}
                </Button>
            ))}
        </div>
    );
}

/**
 * When the comments can't load (the server logs why): the section and its
 * heading stay, with a short note, and the rest of the page is unaffected.
 */
export function DiscussionUnavailable() {
    const t = useTranslations('Discussion');
    return (
        <section
            id={DISCUSSION_ANCHOR}
            aria-labelledby="discussion-title"
            className="flex scroll-mt-20 flex-col gap-4 border-t pt-8"
        >
            <h2
                id="discussion-title"
                className="font-heading text-2xl font-semibold"
            >
                {t('title')}
            </h2>
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                {t('unavailable')}
            </p>
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
