'use client';

import {
    ArrowBigUpIcon,
    EyeIcon,
    EyeOffIcon,
    FlagIcon,
    MessageSquareReplyIcon,
    Trash2Icon,
} from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Button } from '@/components/atoms/button';
import { Avatar } from '@/components/molecules/avatar';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/atoms/dialog';
import { ChoiceGroup } from '@/components/molecules/choice-group';
import { Link } from '@/i18n/navigation';
import {
    paragraphsOf,
    REPORT_REASONS,
    type CommentAbilities,
    type CommentView,
    type ReportReason,
} from '@/lib/comments';
import { cn } from '@/lib/utils';

export interface CommentItemProps {
    comment: CommentView;
    /**
     * The comment's language, named in that language ("Español"), when it
     * isn't the reader's: shown beside the date.
     */
    languageName?: string;
    /** What the viewer may do (`commentAbilities`); the server checks again. */
    can: CommentAbilities;
    /** A request about this comment is on its way. */
    busy?: boolean;
    /** Changes when focus should move to this comment. */
    focusKey?: number;
    onVote: () => void;
    onReport: (reason: ReportReason) => void;
    onDelete: () => void;
    onHide: (hidden: boolean) => void;
    /** The organization's name, for "Reply from …" (organizations only). */
    organizationName?: string;
    /** The viewer writes the organization's replies (changes what deleting one says). */
    replier?: boolean;
    /** The reply form (a `CommentForm` for replies), while it's open under this comment. */
    replyForm?: ReactNode;
    /** Changes when focus should move to the reply, or back to the Reply button. */
    replyFocusKey?: number;
    replyButtonFocusKey?: number;
    onReplyOpen?: () => void;
    onReplyReport?: (reason: ReportReason) => void;
    onReplyDelete?: () => void;
    onReplyHide?: (hidden: boolean) => void;
}

/**
 * One comment: who wrote it and when, the text (in its own language), its up
 * votes, and what the viewer may do with it. Deleting and reporting ask first.
 */
export function CommentItem({
    comment,
    languageName,
    can,
    busy = false,
    focusKey,
    onVote,
    onReport,
    onDelete,
    onHide,
    organizationName = '',
    replier = false,
    replyForm,
    replyFocusKey,
    replyButtonFocusKey,
    onReplyOpen = () => {},
    onReplyReport = () => {},
    onReplyDelete = () => {},
    onReplyHide = () => {},
}: CommentItemProps) {
    const t = useTranslations('Discussion');
    const format = useFormatter();
    const ref = useRef<HTMLElement>(null);
    const replyRef = useRef<HTMLDivElement>(null);
    const replyButtonRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        if (focusKey) ref.current?.focus();
    }, [focusKey]);
    useEffect(() => {
        if (replyFocusKey) replyRef.current?.focus();
    }, [replyFocusKey]);
    useEffect(() => {
        if (replyButtonFocusKey) replyButtonRef.current?.focus();
    }, [replyButtonFocusKey]);

    const name = comment.author?.name ?? t('formerMember');
    const headingId = `comment-${comment.id}-by`;
    const date = new Date(comment.at);
    const { reply } = comment;
    const replyFrom =
        reply?.from === 'team'
            ? t('replyFromTeam')
            : t('replyFrom', { name: organizationName });

    return (
        <article
            ref={ref}
            id={`comment-${comment.id}`}
            tabIndex={-1}
            aria-labelledby={headingId}
            className="flex flex-col gap-2 rounded-lg border p-4 outline-none focus-visible:ring-3 focus-visible:ring-ring"
        >
            <header className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                <Avatar name={name} photo={comment.author?.photo} size={28} />
                <h3 id={headingId} className="font-medium break-words">
                    {comment.author?.username ? (
                        <Link
                            href={`/comrade/${comment.author.username}`}
                            className="underline underline-offset-4"
                        >
                            {name}
                        </Link>
                    ) : (
                        name
                    )}
                    {comment.mine && (
                        <span className="font-normal text-muted-foreground">
                            {' '}
                            {t('you')}
                        </span>
                    )}
                </h3>
                <time
                    dateTime={date.toISOString()}
                    className="text-muted-foreground"
                >
                    {format.dateTime(date, { dateStyle: 'medium' })}
                </time>
                {languageName && (
                    <span
                        lang={comment.lang}
                        className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-foreground"
                    >
                        {languageName}
                    </span>
                )}
            </header>

            {comment.hidden && (
                <p className="rounded-md bg-muted p-2 text-sm text-foreground">
                    {comment.text === null
                        ? t('hiddenText')
                        : t('hiddenModerator')}
                </p>
            )}
            {comment.text !== null && (
                <div
                    lang={comment.lang}
                    className={cn(
                        'flex flex-col gap-2 text-pretty break-words',
                        comment.hidden && 'text-muted-foreground'
                    )}
                >
                    {paragraphsOf(comment.text).map((paragraph, i) => (
                        <p key={i} className="whitespace-pre-line">
                            {paragraph}
                        </p>
                    ))}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
                {can.vote ? (
                    <Button
                        type="button"
                        variant={comment.voted ? 'default' : 'outline'}
                        size="sm"
                        aria-pressed={comment.voted}
                        aria-label={t('upVoteLabel', {
                            name,
                            count: comment.votes,
                        })}
                        // Not `disabled`: that would drop keyboard focus.
                        aria-disabled={busy || undefined}
                        onClick={() => !busy && onVote()}
                    >
                        <ArrowBigUpIcon aria-hidden />
                        {t('upVote')}
                        <span className="tabular-nums">
                            {format.number(comment.votes)}
                        </span>
                    </Button>
                ) : (
                    <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <ArrowBigUpIcon aria-hidden className="size-4" />
                        {t('votes', { count: comment.votes })}
                    </p>
                )}
                {can.reply && !replyForm && (
                    <Button
                        ref={replyButtonRef}
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label={t('replyLabel', {
                            name,
                            organization: organizationName,
                        })}
                        aria-disabled={busy || undefined}
                        onClick={() => !busy && onReplyOpen()}
                    >
                        <MessageSquareReplyIcon aria-hidden />
                        {t('reply')}
                    </Button>
                )}
                {can.report && (
                    <ReportDialog
                        label={t('reportLabel', { name })}
                        title={t('reportTitle')}
                        disabled={busy}
                        onReport={onReport}
                    />
                )}
                {(can.hide || can.unhide) && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label={t(can.hide ? 'hideLabel' : 'unhideLabel', {
                            name,
                        })}
                        aria-disabled={busy || undefined}
                        onClick={() => !busy && onHide(can.hide)}
                    >
                        {can.hide ? (
                            <EyeOffIcon aria-hidden />
                        ) : (
                            <EyeIcon aria-hidden />
                        )}
                        {t(can.hide ? 'hide' : 'unhide')}
                    </Button>
                )}
                {can.delete && (
                    <DeleteDialog
                        label={
                            comment.mine
                                ? t('deleteMineLabel')
                                : t('deleteLabel', { name })
                        }
                        title={
                            comment.mine
                                ? t('deleteTitleMine')
                                : t('deleteTitleOther', { name })
                        }
                        body={
                            comment.mine
                                ? t('deleteBodyMine')
                                : t('deleteBodyModerator')
                        }
                        disabled={busy}
                        onDelete={onDelete}
                    />
                )}
            </div>

            {replyForm && (
                <div className="mt-1 border-l-4 border-primary/40 pl-4">
                    {replyForm}
                </div>
            )}

            {reply && (
                <div
                    ref={replyRef}
                    tabIndex={-1}
                    className="mt-1 flex flex-col gap-2 rounded-r-lg border-l-4 border-primary/60 bg-muted/40 py-3 pr-3 pl-4 outline-none focus-visible:ring-3 focus-visible:ring-ring"
                >
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
                        {/* A heading, so screen reader users can jump to replies. */}
                        <h4 className="font-medium break-words">{replyFrom}</h4>
                        <time
                            dateTime={new Date(reply.at).toISOString()}
                            className="text-muted-foreground"
                        >
                            {format.dateTime(new Date(reply.at), {
                                dateStyle: 'medium',
                            })}
                        </time>
                    </div>
                    {reply.hidden && (
                        <p className="rounded-md bg-muted p-2 text-sm text-foreground">
                            {reply.text === null
                                ? t('replyHiddenText')
                                : t('replyHiddenModerator')}
                        </p>
                    )}
                    {reply.text !== null && (
                        <div
                            lang={reply.lang}
                            className={cn(
                                'flex flex-col gap-2 text-pretty break-words',
                                reply.hidden && 'text-muted-foreground'
                            )}
                        >
                            {paragraphsOf(reply.text).map((paragraph, i) => (
                                <p key={i} className="whitespace-pre-line">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    )}
                    {(can.replyReport ||
                        can.replyHide ||
                        can.replyUnhide ||
                        can.replyDelete) && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            {can.replyReport && (
                                <ReportDialog
                                    label={t('reportReplyLabel', { name })}
                                    title={t('reportReplyTitle')}
                                    disabled={busy}
                                    onReport={onReplyReport}
                                />
                            )}
                            {(can.replyHide || can.replyUnhide) && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    aria-label={t(
                                        can.replyHide
                                            ? 'hideReplyLabel'
                                            : 'unhideReplyLabel',
                                        { name }
                                    )}
                                    aria-disabled={busy || undefined}
                                    onClick={() =>
                                        !busy && onReplyHide(can.replyHide)
                                    }
                                >
                                    {can.replyHide ? (
                                        <EyeOffIcon aria-hidden />
                                    ) : (
                                        <EyeIcon aria-hidden />
                                    )}
                                    {t(can.replyHide ? 'hide' : 'unhide')}
                                </Button>
                            )}
                            {can.replyDelete && (
                                <DeleteDialog
                                    label={t('deleteReplyLabel', { name })}
                                    title={t('deleteReplyTitle')}
                                    body={
                                        replier
                                            ? t('deleteReplyBody')
                                            : t('deleteReplyBodyModerator')
                                    }
                                    disabled={busy}
                                    onDelete={onReplyDelete}
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}

function ReportDialog({
    label,
    title,
    disabled,
    onReport,
}: {
    /** Names what's reported: "Report the comment by Maya Thompson". */
    label: string;
    title: string;
    disabled: boolean;
    onReport: (reason: ReportReason) => void;
}) {
    const t = useTranslations('Discussion');
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<ReportReason | ''>('');
    const [missing, setMissing] = useState(false);
    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (next && disabled) return;
                setOpen(next);
                if (!next) {
                    setReason('');
                    setMissing(false);
                }
            }}
        >
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={label}
                    aria-disabled={disabled || undefined}
                >
                    <FlagIcon aria-hidden />
                    {t('report')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form
                    noValidate
                    className="contents"
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (!reason) return setMissing(true);
                        onReport(reason);
                        setOpen(false);
                        setReason('');
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{t('reportBody')}</DialogDescription>
                    </DialogHeader>
                    <ChoiceGroup
                        name="reason"
                        kind="radio"
                        legend={t('reportReason')}
                        value={reason}
                        onChange={(value) => {
                            setReason(value as ReportReason);
                            setMissing(false);
                        }}
                        options={REPORT_REASONS.map((value) => ({
                            value,
                            label: t(`reasons.${value}`),
                        }))}
                        error={missing ? t('reportReasonMissing') : undefined}
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                {t('cancel')}
                            </Button>
                        </DialogClose>
                        <Button type="submit">{t('reportSend')}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DeleteDialog({
    label,
    title,
    body,
    disabled,
    onDelete,
}: {
    label: string;
    title: string;
    body: string;
    disabled: boolean;
    onDelete: () => void;
}) {
    const t = useTranslations('Discussion');
    const [open, setOpen] = useState(false);
    return (
        <Dialog
            open={open}
            onOpenChange={(next) => setOpen(next && disabled ? false : next)}
        >
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={label}
                    aria-disabled={disabled || undefined}
                    className="border-destructive/60 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                    <Trash2Icon aria-hidden />
                    {t('delete')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{body}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            {t('cancel')}
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                            setOpen(false);
                            onDelete();
                        }}
                    >
                        {t('deleteConfirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
