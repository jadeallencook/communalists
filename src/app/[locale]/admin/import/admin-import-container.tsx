'use client';

import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import {
    AdminImportPage,
    type AdminImportOutcome,
    type AdminImportRow,
} from '@/components/pages/admin-import-page';
import {
    keepDatabaseProblems,
    readImportFile,
    toCsv,
    type ImportRow,
    type ImportValues,
} from '@/lib/organizations/import';

import {
    importOrganizationsAction,
    reviewImportAction,
    type ReviewedRow,
} from './actions';
import { ImportRowEditor } from './import-row-editor';

interface Row {
    line: number;
    values: ImportValues;
    removed: boolean;
    edited: boolean;
}

interface Review {
    fileName: string;
    ignoredColumns: string[];
    rows: Row[];
    /** The latest check of each row (removed rows keep their last one). */
    checked: Map<number, ReviewedRow>;
}

const toImportRows = (rows: Row[]): ImportRow[] =>
    rows
        .filter((r) => !r.removed)
        .map(({ line, values }) => ({ line, values }));

/**
 * The import review: reads the file in the browser, has the server check it,
 * and keeps the edits and removals here until the super user adds the rows.
 * Nothing is stored between visits; Download CSV keeps the reviewed list.
 */
export function AdminImportContainer() {
    const t = useTranslations('Admin.import');
    const [review, setReview] = useState<Review | null>(null);
    const [error, setError] = useState<string>();
    const [expanded, setExpanded] = useState<number[]>([]);
    const [editingLine, setEditingLine] = useState<number | null>(null);
    const [outcomes, setOutcomes] = useState<AdminImportOutcome[]>();
    const [announcement, setAnnouncement] = useState('');
    const [resultKey, setResultKey] = useState<number>();
    const [busy, startBusy] = useTransition();
    const [importing, startImporting] = useTransition();

    const actionError = (key: 'notAllowed' | 'generic') =>
        setError(t(`fileErrors.${key}`, { columns: '' }));

    /**
     * Checks the kept rows again, the database only for `databaseLines`, and
     * merges the results into the latest state (rows may have changed since).
     */
    async function recheck(rows: Row[], databaseLines: number[]) {
        const kept = toImportRows(rows);
        if (kept.length === 0) return [];
        const result = await reviewImportAction(kept, databaseLines);
        if ('error' in result) {
            actionError(result.error);
            return null;
        }
        setReview((prev) => {
            if (!prev) return prev;
            const merged = keepDatabaseProblems(
                result.rows,
                [...prev.checked.values()],
                new Set(databaseLines)
            );
            const checked = new Map(prev.checked);
            for (const row of merged) checked.set(row.line, row);
            return { ...prev, checked };
        });
        return result.rows;
    }

    function fileAction(formData: FormData) {
        const file = formData.get('file');
        startBusy(async () => {
            setError(undefined);
            if (!(file instanceof File) || file.size === 0) {
                setError(t('fileErrors.noFile', { columns: '' }));
                return;
            }
            const read = readImportFile(await file.text());
            if (!read.ok) {
                setError(
                    t(`fileErrors.${read.problem}`, {
                        columns: (read.columns ?? []).join(', '),
                    })
                );
                return;
            }
            const result = await reviewImportAction(read.rows);
            if ('error' in result) return actionError(result.error);
            setReview({
                fileName: file.name,
                ignoredColumns: read.ignoredColumns,
                rows: read.rows.map((r) => ({
                    ...r,
                    removed: false,
                    edited: false,
                })),
                checked: new Map(result.rows.map((r) => [r.line, r])),
            });
            setExpanded([]);
            setOutcomes(undefined);
            setResultKey(Date.now());
        });
    }

    function setRemoved(line: number, removed: boolean) {
        if (!review) return;
        const name = review.checked.get(line)?.name ?? '';
        const rows = review.rows.map((r) =>
            r.line === line ? { ...r, removed } : r
        );
        // Show it right away; then re-check repeats within the file (no reads).
        setReview((prev) => prev && { ...prev, rows });
        setAnnouncement(
            t(removed ? 'announceRemoved' : 'announceRestored', { name })
        );
        startBusy(async () => {
            await recheck(rows, []);
        });
    }

    function save(line: number, values: ImportValues) {
        if (!review) return;
        const rows = review.rows.map((r) =>
            r.line === line ? { ...r, values, edited: true } : r
        );
        setReview((prev) => prev && { ...prev, rows });
        setEditingLine(null);
        startBusy(async () => {
            const checked = await recheck(rows, [line]);
            const row = checked?.find((r) => r.line === line);
            if (!row) return;
            setAnnouncement(
                row.problems.length === 0
                    ? t('announceSaved', { name: row.name })
                    : t('announceSavedProblems', {
                          name: row.name,
                          count: row.problems.length,
                      })
            );
        });
    }

    function download() {
        if (!review) return;
        const csv = toCsv(
            review.rows.filter((r) => !r.removed).map((r) => r.values)
        );
        const url = URL.createObjectURL(
            new Blob([csv], { type: 'text/csv;charset=utf-8' })
        );
        const a = document.createElement('a');
        a.href = url;
        a.download = review.fileName.replace(/(\.csv)?$/i, '-reviewed.csv');
        a.click();
        URL.revokeObjectURL(url);
        setAnnouncement(t('announceDownloaded', { file: a.download }));
    }

    function addReady() {
        if (!review) return;
        startImporting(async () => {
            const result = await importOrganizationsAction(
                toImportRows(review.rows)
            );
            if ('error' in result) return actionError(result.error);
            const added = new Set(
                result.outcomes
                    .filter((o) => o.status === 'created')
                    .map((o) => o.line)
            );
            const checked = new Map(review.checked);
            for (const row of result.rows) checked.set(row.line, row);
            // Added rows leave the review; the rest stay to be fixed.
            setReview({
                ...review,
                rows: review.rows.filter((r) => !added.has(r.line)),
                checked,
            });
            setOutcomes(result.outcomes);
            setResultKey(Date.now());
        });
    }

    const rows: AdminImportRow[] | undefined = review?.rows.flatMap((r) => {
        const c = review.checked.get(r.line);
        if (!c) return [];
        return [
            {
                line: r.line,
                name: c.name,
                placeLabel: c.placeLabel,
                handle: c.handle,
                problems: c.problems,
                verification: c.verification,
                notes: c.notes,
                sources: c.sources,
                preview: c.preview,
                edited: r.edited,
                removed: r.removed,
            },
        ];
    });

    const editingRow = review?.rows.find((r) => r.line === editingLine);
    const editingChecked =
        editingLine !== null ? review?.checked.get(editingLine) : undefined;
    const placeKnown = !editingChecked?.problems.some(
        (p) => p.column === 'placeId' || p.column === 'country'
    );

    return (
        <AdminImportPage
            existingHref="/api/admin/organizations"
            fileAction={fileAction}
            busy={busy}
            error={error}
            fileName={review?.fileName}
            rows={rows}
            ignoredColumns={review?.ignoredColumns}
            expandedLines={expanded}
            onExpandedChange={(line, open) =>
                setExpanded((lines) =>
                    open ? [...lines, line] : lines.filter((l) => l !== line)
                )
            }
            onEdit={setEditingLine}
            onRemove={(line) => setRemoved(line, true)}
            onRestore={(line) => setRemoved(line, false)}
            onDownload={download}
            onImport={addReady}
            importing={importing}
            editing={
                editingRow && editingChecked
                    ? {
                          line: editingRow.line,
                          name: editingChecked.name,
                          form: (
                              <ImportRowEditor
                                  key={editingRow.line}
                                  values={editingRow.values}
                                  placeLabel={
                                      placeKnown
                                          ? editingChecked.placeLabel
                                          : undefined
                                  }
                                  problems={editingChecked.problems}
                                  onSave={(values) =>
                                      save(editingRow.line, values)
                                  }
                              />
                          ),
                      }
                    : undefined
            }
            onEditClose={() => setEditingLine(null)}
            outcomes={outcomes}
            announcement={announcement}
            resultKey={resultKey}
        />
    );
}
