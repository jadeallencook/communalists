'use client';

import {
    ChevronDownIcon,
    ChevronUpIcon,
    CircleAlertIcon,
    CircleCheckIcon,
    PencilIcon,
    Trash2Icon,
    Undo2Icon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/atoms/button';
import {
    OrganizationProfile,
    type OrganizationProfileProps,
} from '@/components/organisms/organization-profile';
import { Link } from '@/i18n/navigation';
import type { ImportProblem } from '@/lib/organizations/import';
import { organizationPath } from '@/lib/paths';

export interface ImportRowCardProps {
    /** The row's line in the file; also its id. */
    line: number;
    name: string;
    placeLabel: string;
    handle: string;
    problems: ImportProblem[];
    verification: string;
    notes: string;
    sources: string[];
    /** The public profile as far as the row can be read. */
    preview: Omit<
        OrganizationProfileProps,
        'memberCount' | 'unclaimed' | 'headingLevel'
    >;
    /** Changed in the browser since the file was read. */
    edited?: boolean;
    expanded: boolean;
    onExpandedChange: (expanded: boolean) => void;
    onEdit: () => void;
    onRemove: () => void;
    /** Taken out of the import; shown as one line with Undo. */
    removed?: boolean;
    onRestore: () => void;
}

const removeClass =
    'border-destructive/60 text-destructive hover:bg-destructive/10 hover:text-destructive';

/**
 * One organization from an import file: whether it's ready, what to fix and
 * why, its profile as it will appear, and the research behind it.
 */
export function ImportRowCard({
    line,
    name,
    placeLabel,
    handle,
    problems,
    verification,
    notes,
    sources,
    preview,
    edited = false,
    expanded,
    onExpandedChange,
    onEdit,
    onRemove,
    removed = false,
    onRestore,
}: ImportRowCardProps) {
    const t = useTranslations('Admin.import');
    const label = name || t('noName');
    const ready = problems.length === 0;
    const detailsId = `import-row-${line}-details`;

    // Removing or restoring swaps the buttons; keep focus on the one that undoes it.
    const restoreRef = useRef<HTMLButtonElement>(null);
    const removeRef = useRef<HTMLButtonElement>(null);
    const wasRemoved = useRef(removed);
    useEffect(() => {
        if (wasRemoved.current === removed) return;
        wasRemoved.current = removed;
        (removed ? restoreRef : removeRef).current?.focus();
    }, [removed]);

    if (removed) {
        return (
            <div className="flex flex-col gap-2 rounded-lg border border-dashed p-3 text-sm md:flex-row md:items-center md:justify-between">
                <p className="break-words text-muted-foreground">
                    {t('removedRow', { name: label, line })}
                </p>
                <Button
                    ref={restoreRef}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRestore}
                    aria-label={t('restoreFor', { name: label })}
                    className="w-fit"
                >
                    <Undo2Icon aria-hidden />
                    {t('restore')}
                </Button>
            </div>
        );
    }

    return (
        <article
            aria-labelledby={`import-row-${line}-name`}
            className="flex flex-col gap-3 rounded-lg border p-4 text-sm"
        >
            <header className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between md:gap-3">
                <h3
                    id={`import-row-${line}-name`}
                    className="font-heading text-base font-semibold break-words"
                >
                    {label}
                </h3>
                <span
                    className={
                        ready
                            ? 'inline-flex shrink-0 items-center gap-1'
                            : 'inline-flex shrink-0 items-center gap-1 text-destructive'
                    }
                >
                    {ready ? (
                        <CircleCheckIcon aria-hidden className="size-4" />
                    ) : (
                        <CircleAlertIcon aria-hidden className="size-4" />
                    )}
                    {ready
                        ? t('ready')
                        : t('needsAttention', { count: problems.length })}
                </span>
            </header>
            <p className="break-words text-muted-foreground">
                {t('rowDetail', {
                    line,
                    place: placeLabel || '—',
                    handle: handle || '—',
                })}
                {edited && ` · ${t('edited')}`}
                {verification && ` · ${t('verification', { verification })}`}
            </p>

            {problems.length > 0 && (
                <section
                    aria-label={t('problemsFor', { name: label })}
                    className="flex flex-col gap-3 rounded-md border border-destructive/50 p-3"
                >
                    <ul className="flex flex-col gap-3">
                        {problems.map((p) => (
                            <li
                                key={`${p.column}-${p.key}`}
                                className="flex flex-col gap-1"
                            >
                                <p className="font-medium text-destructive">
                                    {t(`columns.${p.column}`)}{' '}
                                    <span className="text-xs font-normal text-muted-foreground">
                                        (
                                        <code className="font-mono">
                                            {p.column}
                                        </code>
                                        )
                                    </span>
                                </p>
                                <p className="text-pretty">
                                    {t(`problems.${p.key}`, {
                                        otherLine: p.otherLine ?? 0,
                                    })}
                                </p>
                                {p.value && (
                                    <p className="break-words text-muted-foreground">
                                        {t('inFile')}{' '}
                                        <code className="rounded bg-muted px-1 font-mono text-xs text-foreground">
                                            {p.value}
                                        </code>
                                    </p>
                                )}
                                {p.match && (
                                    <p className="break-words">
                                        {t('alreadyListed')}{' '}
                                        <Link
                                            href={organizationPath(
                                                p.match.handle
                                            )}
                                            className="font-medium underline underline-offset-4"
                                        >
                                            {p.match.name}
                                        </Link>
                                        {` · ${p.match.place} · ${organizationPath(p.match.handle)}`}
                                        {p.match.unclaimed &&
                                            ` · ${t('matchUnclaimed')}`}
                                    </p>
                                )}
                                <p className="text-pretty text-muted-foreground">
                                    {t(`fixes.${p.key}`)}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-expanded={expanded}
                    aria-controls={detailsId}
                    aria-label={t(
                        expanded ? 'hideDetailsFor' : 'showDetailsFor',
                        {
                            name: label,
                        }
                    )}
                    onClick={() => onExpandedChange(!expanded)}
                >
                    {expanded ? (
                        <ChevronUpIcon aria-hidden />
                    ) : (
                        <ChevronDownIcon aria-hidden />
                    )}
                    {expanded ? t('hideDetails') : t('showDetails')}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    id={`import-row-${line}-edit`}
                    onClick={onEdit}
                    aria-label={t('editFor', { name: label })}
                >
                    <PencilIcon aria-hidden />
                    {t('edit')}
                </Button>
                <Button
                    ref={removeRef}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRemove}
                    aria-label={t('removeFor', { name: label })}
                    className={removeClass}
                >
                    <Trash2Icon aria-hidden />
                    {t('remove')}
                </Button>
            </div>

            {expanded && (
                <div
                    id={detailsId}
                    className="flex flex-col gap-4 border-t pt-4"
                >
                    <p className="text-muted-foreground">{t('previewHint')}</p>
                    <OrganizationProfile
                        {...preview}
                        memberCount={0}
                        unclaimed
                        headingLevel={4}
                    />
                    {(notes || sources.length > 0) && (
                        <section className="flex flex-col gap-2 rounded-md bg-muted/50 p-3">
                            <h4 className="font-medium">
                                {t('researchNotes')}
                            </h4>
                            {notes && (
                                <p className="text-pretty break-words whitespace-pre-line">
                                    {notes}
                                </p>
                            )}
                            {sources.length > 0 && (
                                <ul className="flex flex-col gap-1">
                                    {sources.map((url) => (
                                        <li key={url} className="break-all">
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline underline-offset-4"
                                            >
                                                {url}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    )}
                </div>
            )}
        </article>
    );
}
