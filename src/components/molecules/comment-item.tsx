'use client';

import {
    ArrowBigUpIcon,
    EyeIcon,
    EyeOffIcon,
    FlagIcon,
    Trash2Icon,
} from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/atoms/button';
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
    type CommentView,
    type ReportReason,
} from '@/lib/comments';
import { cn } from '@/lib/utils';

export interface CommentItemProps {
    comment: CommentView;
    /** What the viewer may do (`commentAbilities`); the server checks again. */
    can: {
        vote: boolean;
        report: boolean;
        delete: boolean;
        hide: boolean;
        unhide: boolean;
    };
    /** A request about this comment is on its way. */
    busy?: boolean;
    /** Changes when focus should move to this comment. */
    focusKey?: number;
    onVote: () => void;
    onReport: (reason: ReportReason) => void;
    onDelete: () => void;
    onHide: (hidden: boolean) => void;
}

/**
 * One comment: who wrote it and when, the text (in its own language), its up
 * votes, and what the viewer may do with it. Deleting and reporting ask first.
 */
export function CommentItem({
    comment,
    can,
    busy = false,
    focusKey,
    onVote,
    onReport,
    onDelete,
    onHide,
}: CommentItemProps) {
    const t = useTranslations('Discussion');
    const format = useFormatter();
    const ref = useRef<HTMLElement>(null);
    useEffect(() => {
        if (focusKey) ref.current?.focus();
    }, [focusKey]);

    const name = comment.author?.name ?? t('formerMember');
    const headingId = `comment-${comment.id}-by`;
    const date = new Date(comment.at);

    return (
        <article
            ref={ref}
            id={`comment-${comment.id}`}
            tabIndex={-1}
            aria-labelledby={headingId}
            className="flex flex-col gap-2 rounded-lg border p-4 outline-none focus-visible:ring-3 focus-visible:ring-ring"
        >
            <header className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
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
                {can.report && (
                    <ReportDialog
                        name={name}
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
                        name={name}
                        mine={comment.mine}
                        disabled={busy}
                        onDelete={onDelete}
                    />
                )}
            </div>
        </article>
    );
}

function ReportDialog({
    name,
    disabled,
    onReport,
}: {
    name: string;
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
                    aria-label={t('reportLabel', { name })}
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
                        <DialogTitle>{t('reportTitle')}</DialogTitle>
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
    name,
    mine,
    disabled,
    onDelete,
}: {
    name: string;
    mine: boolean;
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
                    aria-label={
                        mine ? t('deleteMineLabel') : t('deleteLabel', { name })
                    }
                    aria-disabled={disabled || undefined}
                    className="border-destructive/60 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                    <Trash2Icon aria-hidden />
                    {t('delete')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {mine
                            ? t('deleteTitleMine')
                            : t('deleteTitleOther', { name })}
                    </DialogTitle>
                    <DialogDescription>
                        {mine ? t('deleteBodyMine') : t('deleteBodyModerator')}
                    </DialogDescription>
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
