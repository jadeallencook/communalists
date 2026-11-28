'use client';

import { ArrowLeftIcon, DownloadIcon, UploadIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Button } from '@/components/atoms/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import {
    ImportRowCard,
    type ImportRowCardProps,
} from '@/components/organisms/import-row-card';
import { Link } from '@/i18n/navigation';
import { organizationPath } from '@/lib/paths';

export type AdminImportRow = Omit<
    ImportRowCardProps,
    'expanded' | 'onExpandedChange' | 'onEdit' | 'onRemove' | 'onRestore'
>;

export interface AdminImportOutcome {
    line: number;
    name: string;
    status: 'created' | 'skipped' | 'failed';
    handle?: string;
}

export interface AdminImportPageProps {
    /** In the app: reads the file in the browser, then checks it on the server. */
    fileAction: (formData: FormData) => void;
    /** Reading or checking. */
    busy?: boolean;
    /** Already translated. */
    error?: string;
    /** The file name being reviewed. */
    fileName?: string;
    /** Every row of the file, removed ones included (shown with Undo). */
    rows?: AdminImportRow[];
    ignoredColumns?: string[];
    expandedLines?: number[];
    onExpandedChange: (line: number, expanded: boolean) => void;
    onEdit: (line: number) => void;
    onRemove: (line: number) => void;
    onRestore: (line: number) => void;
    onDownload: () => void;
    onImport: () => void;
    importing?: boolean;
    /** The row being edited, with the form (in the app, the create form filled in). */
    editing?: { line: number; name: string; form: ReactNode };
    onEditClose: () => void;
    /** After adding: what happened to each row sent. */
    outcomes?: AdminImportOutcome[];
    /** Already translated: "Removed …", "Saved …". Read out by screen readers. */
    announcement?: string;
    /** Changes when a new file is reviewed or rows are added, so focus moves to the result. */
    resultKey?: number;
    /** Where the list of organizations already on Communalists downloads from. */
    existingHref: string;
}

/**
 * /admin/import, for super users: read a CSV, review every organization (its
 * profile, what to fix and why), edit or remove rows, then add the ready ones
 * as unclaimed organizations. Nothing is added until the confirmation.
 */
export function AdminImportPage({
    fileAction,
    busy = false,
    error,
    fileName,
    rows,
    ignoredColumns = [],
    expandedLines = [],
    onExpandedChange,
    onEdit,
    onRemove,
    onRestore,
    onDownload,
    onImport,
    importing = false,
    editing,
    onEditClose,
    outcomes,
    announcement,
    resultKey,
    existingHref,
}: AdminImportPageProps) {
    const t = useTranslations('Admin.import');
    const resultRef = useRef<HTMLHeadingElement>(null);
    // Kept after the dialog closes, so focus can go back to that row's Edit.
    const editedLine = useRef<number | null>(null);
    const editingLine = editing?.line;
    useEffect(() => {
        if (editingLine !== undefined) editedLine.current = editingLine;
    }, [editingLine]);
    useEffect(() => {
        if (resultKey) resultRef.current?.focus();
    }, [resultKey]);

    const kept = (rows ?? []).filter((r) => !r.removed);
    const ready = kept.filter((r) => r.problems.length === 0).length;
    const counts = {
        ready,
        attention: kept.length - ready,
        removed: (rows ?? []).length - kept.length,
    };
    const created = (outcomes ?? []).filter((o) => o.status === 'created');
    const failed = (outcomes ?? []).filter((o) => o.status === 'failed').length;

    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
            <header className="flex flex-col gap-3">
                <Link
                    href="/admin"
                    className="inline-flex w-fit items-center gap-1 text-sm underline underline-offset-4"
                >
                    <ArrowLeftIcon aria-hidden className="size-4" />
                    {t('back')}
                </Link>
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                    {t('title')}
                </h1>
                <p className="text-pretty text-muted-foreground">
                    {t('intro')}
                </p>
            </header>

            <section
                aria-labelledby="import-existing"
                className="flex flex-col gap-3 rounded-lg border p-4"
            >
                <h2
                    id="import-existing"
                    className="font-heading text-lg font-semibold"
                >
                    {t('existingTitle')}
                </h2>
                <p className="text-sm text-pretty text-muted-foreground">
                    {t('existingHint')}
                </p>
                <Button asChild variant="outline" className="w-fit">
                    {/* A plain link: a download, never prefetched. */}
                    <a href={existingHref} download>
                        <DownloadIcon aria-hidden />
                        {t('existingDownload')}
                    </a>
                </Button>
            </section>

            <form
                action={fileAction}
                className="flex flex-col gap-3 rounded-lg border p-4"
            >
                <Label htmlFor="import-file">{t('fileLabel')}</Label>
                <p
                    id="import-file-hint"
                    className="text-sm text-muted-foreground"
                >
                    {t('fileHint')}
                </p>
                <Input
                    id="import-file"
                    name="file"
                    type="file"
                    accept=".csv,text/csv"
                    required
                    aria-describedby={
                        error
                            ? 'import-file-hint import-error'
                            : 'import-file-hint'
                    }
                    aria-invalid={error ? true : undefined}
                    className="h-auto py-2"
                />
                <Button
                    type="submit"
                    variant="outline"
                    disabled={busy}
                    className="w-fit"
                >
                    {busy ? t('reviewing') : t('review')}
                </Button>
            </form>

            {error && (
                <p
                    id="import-error"
                    role="alert"
                    className="rounded-lg border border-destructive p-3 text-sm text-destructive"
                >
                    {error}
                </p>
            )}

            <p role="status" className="sr-only">
                {announcement}
            </p>

            {outcomes && (
                <section
                    aria-labelledby="import-added"
                    className="flex flex-col gap-3 rounded-lg border p-4"
                >
                    <h2
                        id="import-added"
                        ref={resultRef}
                        tabIndex={-1}
                        className="font-heading text-xl font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring"
                    >
                        {t('importedTitle')}
                    </h2>
                    <p>
                        {t('importedSummary', {
                            created: created.length,
                            skipped: outcomes.length - created.length - failed,
                            failed,
                        })}
                    </p>
                    {created.length > 0 && (
                        <ul className="flex flex-col gap-1 text-sm">
                            {created.map((o) => (
                                <li key={o.line}>
                                    {o.handle ? (
                                        <Link
                                            href={organizationPath(o.handle)}
                                            className="break-words underline underline-offset-4"
                                        >
                                            {o.name}
                                        </Link>
                                    ) : (
                                        o.name
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                    {kept.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                            {t('leftToReview')}
                        </p>
                    )}
                </section>
            )}

            {rows && (
                <section
                    aria-labelledby="import-review"
                    className="flex flex-col gap-4"
                >
                    <h2
                        id="import-review"
                        ref={outcomes ? undefined : resultRef}
                        tabIndex={-1}
                        className="font-heading text-xl font-semibold break-words outline-none focus-visible:ring-3 focus-visible:ring-ring"
                    >
                        {fileName
                            ? t('reviewTitleFile', { file: fileName })
                            : t('reviewTitle')}
                    </h2>
                    {ignoredColumns.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                            {t('ignoredColumns', {
                                columns: ignoredColumns.join(', '),
                            })}
                        </p>
                    )}
                    <ActionBar
                        id="top"
                        counts={counts}
                        onDownload={onDownload}
                        onImport={onImport}
                        importing={importing}
                    />
                    {kept.length === 0 && rows.length > 0 && (
                        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                            {t('allRemoved')}
                        </p>
                    )}
                    <ol className="flex flex-col gap-3">
                        {rows.map((row) => (
                            <li key={row.line}>
                                <ImportRowCard
                                    {...row}
                                    expanded={expandedLines.includes(row.line)}
                                    onExpandedChange={(next) =>
                                        onExpandedChange(row.line, next)
                                    }
                                    onEdit={() => onEdit(row.line)}
                                    onRemove={() => onRemove(row.line)}
                                    onRestore={() => onRestore(row.line)}
                                />
                            </li>
                        ))}
                    </ol>
                    {rows.length > 3 && (
                        <ActionBar
                            id="bottom"
                            counts={counts}
                            onDownload={onDownload}
                            onImport={onImport}
                            importing={importing}
                        />
                    )}
                </section>
            )}

            <Dialog
                open={Boolean(editing)}
                onOpenChange={(open) => {
                    if (!open) onEditClose();
                }}
            >
                <DialogContent
                    className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"
                    onCloseAutoFocus={(event) => {
                        // Opened from a row's Edit button: go back to it.
                        const edit = editedLine.current
                            ? document.getElementById(
                                  `import-row-${editedLine.current}-edit`
                              )
                            : null;
                        if (edit) {
                            event.preventDefault();
                            edit.focus();
                        }
                    }}
                >
                    <DialogHeader>
                        <DialogTitle className="break-words">
                            {t('editTitle', { name: editing?.name ?? '' })}
                        </DialogTitle>
                        <DialogDescription>{t('editHint')}</DialogDescription>
                    </DialogHeader>
                    {editing?.form}
                </DialogContent>
            </Dialog>
        </section>
    );
}

/**
 * The counts and the two actions. Shown above the list and again below it,
 * rather than stuck to the screen, so it never covers a focused control.
 */
function ActionBar({
    id,
    counts,
    onDownload,
    onImport,
    importing,
}: {
    id: string;
    counts: { ready: number; attention: number; removed: number };
    onDownload: () => void;
    onImport: () => void;
    importing: boolean;
}) {
    const t = useTranslations('Admin.import');
    const [confirming, setConfirming] = useState(false);
    const summaryId = `import-summary-${id}`;
    return (
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 md:flex-row md:items-center md:justify-between">
            <p id={summaryId} className="text-pretty">
                {t('counts', counts)}
            </p>
            <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={onDownload}>
                    <DownloadIcon aria-hidden />
                    {t('download')}
                </Button>
                <Dialog open={confirming} onOpenChange={setConfirming}>
                    <Button
                        type="button"
                        disabled={counts.ready === 0 || importing}
                        aria-describedby={summaryId}
                        onClick={() => setConfirming(true)}
                    >
                        <UploadIcon aria-hidden />
                        {importing
                            ? t('adding')
                            : t('add', { count: counts.ready })}
                    </Button>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {t('confirmTitle', { count: counts.ready })}
                            </DialogTitle>
                            <DialogDescription>
                                {t('confirmBody', {
                                    count: counts.ready,
                                    skipped: counts.attention,
                                })}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    {t('notYet')}
                                </Button>
                            </DialogClose>
                            <Button
                                type="button"
                                onClick={() => {
                                    setConfirming(false);
                                    onImport();
                                }}
                            >
                                {t('confirm', { count: counts.ready })}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
