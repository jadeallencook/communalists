'use server';

import { refresh, updateTag } from 'next/cache';
import { hasLocale } from 'next-intl';

import type {
    AddDefinitionsState,
    CheckDefinitionsState,
} from '@/components/pages/admin-definitions-import-page';
import { isPlatformAdmin } from '@/lib/auth/platform-admin';
import { getSessionUser } from '@/lib/auth/session';
import {
    checkDefinitionRows,
    DEFINITIONS_IMPORT_MAX_BYTES,
    readDefinitionsFile,
} from '@/lib/definitions/import';
import {
    DEFINITIONS_TAG,
    definitionTag,
    getDefinitionSlugsFresh,
    importDefinitions,
} from '@/lib/definitions/store';
import { ADMIN_LOG_TAG } from '@/lib/organizations/claim-store';
import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

// Adding dictionary words from a CSV: check the file, then add the ready rows.
// Design: documentation/features/19-dictionary.md → "Importing from a CSV".

const text = (formData: FormData, key: string) => {
    const value = formData.get(key);
    return typeof value === 'string' ? value : '';
};
const localeOf = (formData: FormData) => {
    const requested = text(formData, 'locale');
    return hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;
};

/** Signed-in super user's uid, or what to answer instead. */
async function superUser(formData: FormData) {
    const user = await getSessionUser();
    if (!user)
        return redirect({ href: '/sign-in', locale: localeOf(formData) });
    // The page is hidden from everyone else, but actions can be called directly.
    return isPlatformAdmin(user.uid) ? user.uid : null;
}

/** Reads the uploaded file and checks every row. Adds nothing. */
export async function checkDefinitionsAction(
    _prev: CheckDefinitionsState,
    formData: FormData
): Promise<CheckDefinitionsState> {
    const at = Date.now();
    if (!(await superUser(formData))) return { fileProblem: 'notAllowed', at };
    const file = formData.get('file');
    if (!(file instanceof File) || file.size === 0)
        return { fileProblem: 'noFile', at };
    if (file.size > DEFINITIONS_IMPORT_MAX_BYTES)
        return { fileProblem: 'tooBig', fileName: file.name, at };

    const content = await file.text();
    const read = readDefinitionsFile(content);
    if (!read.ok)
        return {
            fileProblem: read.problem,
            columns: read.columns,
            fileName: file.name,
            at,
        };
    try {
        const rows = checkDefinitionRows(
            read.rows,
            await getDefinitionSlugsFresh()
        );
        return {
            fileName: file.name,
            text: content,
            // The checked input stays on the server; Add checks again anyway.
            rows: rows.map((row) => ({ ...row, input: undefined })),
            ignoredColumns: read.ignoredColumns,
            at,
        };
    } catch (error) {
        console.error('[definitions] check failed', (error as Error).message);
        return { fileProblem: 'generic', fileName: file.name, at };
    }
}

/** Checks the file again on fresh data, then adds every ready row. */
export async function addDefinitionsAction(
    _prev: AddDefinitionsState,
    formData: FormData
): Promise<AddDefinitionsState> {
    const at = Date.now();
    const uid = await superUser(formData);
    if (!uid) return { error: 'notAllowed', at };
    const read = readDefinitionsFile(text(formData, 'text'));
    if (!read.ok) return { error: 'generic', at };

    let added: string[];
    try {
        const rows = checkDefinitionRows(
            read.rows,
            await getDefinitionSlugsFresh()
        );
        const inputs = rows.flatMap((row) => (row.input ? [row.input] : []));
        if (inputs.length === 0) return { error: 'nothingReady', at };
        ({ added } = await importDefinitions(uid, inputs));
    } catch (error) {
        // Most likely someone added one of the words meanwhile (create failed).
        console.error('[definitions] import failed', (error as Error).message);
        return { error: 'changed', at };
    }

    updateTag(DEFINITIONS_TAG);
    for (const slug of added) updateTag(definitionTag(slug));
    updateTag(ADMIN_LOG_TAG);
    refresh();
    return redirect({
        href: {
            pathname: '/admin/definitions',
            query: { imported: String(added.length) },
        },
        locale: localeOf(formData),
    });
}
