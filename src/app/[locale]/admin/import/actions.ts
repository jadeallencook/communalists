'use server';

import { refresh, updateTag } from 'next/cache';
import { z } from 'zod';

import { isPlatformAdmin } from '@/lib/auth/platform-admin';
import { getSessionUser } from '@/lib/auth/session';
import { DIRECTORY_TAG, handleTag } from '@/lib/organizations';
import { ADMIN_LOG_TAG } from '@/lib/organizations/claim-store';
import {
    IMPORT_COLUMNS,
    IMPORT_MAX_CELL,
    IMPORT_MAX_ROWS,
    type CheckedRow,
    type ImportRow,
} from '@/lib/organizations/import';
import {
    checkImport,
    runImport,
    type ImportOutcome,
} from '@/lib/organizations/import-store';

// /admin/import (features/18). The page parses the file in the browser and
// sends rows; everything is checked again here, and again before adding.

/** A checked row as the page shows it (the parsed input stays on the server). */
export type ReviewedRow = Omit<CheckedRow, 'input'>;

export type ImportActionError = 'notAllowed' | 'generic';

const cell = z.string().max(IMPORT_MAX_CELL);
const rowsSchema = z
    .array(
        z.object({
            line: z.number().int().min(2).max(1_000_000),
            values: z.partialRecord(z.enum(IMPORT_COLUMNS), cell),
        })
    )
    .min(1)
    .max(IMPORT_MAX_ROWS)
    .refine((rows) => new Set(rows.map((r) => r.line)).size === rows.length);

async function superUser() {
    const user = await getSessionUser();
    // The page is hidden from everyone else, but actions can be called directly.
    return user && isPlatformAdmin(user.uid) ? user : null;
}

const forPage = (rows: CheckedRow[]): ReviewedRow[] =>
    rows.map((row) => {
        const shown: Partial<CheckedRow> = { ...row };
        delete shown.input;
        return shown as ReviewedRow;
    });

/**
 * Checks rows. `databaseLines` limits the database checks (up to 4 reads a
 * row) to rows that changed; the others come back without them, and the page
 * keeps what it learned before (keepDatabaseProblems).
 */
export async function reviewImportAction(
    rows: ImportRow[],
    databaseLines?: number[]
): Promise<{ rows: ReviewedRow[] } | { error: ImportActionError }> {
    if (!(await superUser())) return { error: 'notAllowed' };
    const parsed = rowsSchema.safeParse(rows);
    const lines = z.array(z.number().int()).max(IMPORT_MAX_ROWS).optional();
    const only = lines.safeParse(databaseLines);
    if (!parsed.success || !only.success) return { error: 'generic' };
    try {
        const checked = await checkImport(
            parsed.data,
            only.data ? new Set(only.data) : undefined
        );
        return { rows: forPage(checked) };
    } catch (error) {
        console.error('[import] check failed', (error as Error).message); // never log PII
        return { error: 'generic' };
    }
}

/** Checks every row again on fresh data and adds the ready ones as unclaimed organizations. */
export async function importOrganizationsAction(
    rows: ImportRow[]
): Promise<
    | { rows: ReviewedRow[]; outcomes: ImportOutcome[] }
    | { error: ImportActionError }
> {
    const user = await superUser();
    if (!user) return { error: 'notAllowed' };
    const parsed = rowsSchema.safeParse(rows);
    if (!parsed.success) return { error: 'generic' };
    try {
        const result = await runImport(user.uid, parsed.data);
        const created = result.outcomes.filter((o) => o.status === 'created');
        if (created.length > 0) {
            for (const o of created) updateTag(handleTag(o.handle));
            updateTag(DIRECTORY_TAG);
            updateTag(ADMIN_LOG_TAG);
            refresh();
        }
        return { rows: forPage(result.rows), outcomes: result.outcomes };
    } catch (error) {
        console.error('[import] failed', (error as Error).message); // never log PII
        return { error: 'generic' };
    }
}
