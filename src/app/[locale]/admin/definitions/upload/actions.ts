'use server';

import { refresh, updateTag } from 'next/cache';
import { hasLocale } from 'next-intl';

import type {
    CheckDefinitionUpdateState,
    SaveDefinitionUpdateState,
} from '@/components/pages/admin-definition-upload-page';
import { isPlatformAdmin } from '@/lib/auth/platform-admin';
import { getSessionUser } from '@/lib/auth/session';
import { DEFINITIONS_IMPORT_MAX_BYTES } from '@/lib/definitions/import';
import {
    DEFINITIONS_TAG,
    definitionTag,
    getDefinitionFresh,
    updateDefinitionText,
} from '@/lib/definitions/store';
import {
    checkDefinitionUpdate,
    readDefinitionUpdateFile,
} from '@/lib/definitions/update';
import { ADMIN_LOG_TAG } from '@/lib/organizations/claim-store';
import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

// Replacing one word's text from a file: check it and show the changes, then
// save. Related words are never changed. Design:
// documentation/features/19-dictionary.md → "Updating a word from a file".

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

/** Reads the uploaded file and compares it with the word. Saves nothing. */
export async function checkDefinitionUpdateAction(
    _prev: CheckDefinitionUpdateState,
    formData: FormData
): Promise<CheckDefinitionUpdateState> {
    const at = Date.now();
    if (!(await superUser(formData))) return { fileProblem: 'notAllowed', at };
    const file = formData.get('file');
    if (!(file instanceof File) || file.size === 0)
        return { fileProblem: 'noFile', at };
    if (file.size > DEFINITIONS_IMPORT_MAX_BYTES)
        return { fileProblem: 'tooBig', fileName: file.name, at };

    const content = await file.text();
    const read = readDefinitionUpdateFile(content);
    if (!read.ok)
        return {
            fileProblem: read.problem,
            columns: read.columns,
            fileName: file.name,
            at,
        };
    try {
        const current = read.slug ? await getDefinitionFresh(read.slug) : null;
        // The checked text stays on the server; Update checks again anyway.
        const checked = checkDefinitionUpdate(read.row, current);
        return {
            fileName: file.name,
            text: content,
            result: { ...checked, text: undefined },
            ignoredColumns: read.ignoredColumns,
            updatedAt: current?.updatedAt ?? null,
            at,
        };
    } catch (error) {
        console.error(
            '[definitions] upload check failed',
            (error as Error).message
        );
        return { fileProblem: 'generic', fileName: file.name, at };
    }
}

/**
 * Checks the file again on fresh data, then saves its text, unless the word
 * was saved by someone else after the check (`updatedAt` sent back).
 */
export async function saveDefinitionUpdateAction(
    _prev: SaveDefinitionUpdateState,
    formData: FormData
): Promise<SaveDefinitionUpdateState> {
    const at = Date.now();
    const uid = await superUser(formData);
    if (!uid) return { error: 'notAllowed', at };
    const read = readDefinitionUpdateFile(text(formData, 'text'));
    if (!read.ok) return { error: 'generic', at };
    const sent = text(formData, 'updatedAt');
    const expected = sent ? Number(sent) : null;

    try {
        const current = await getDefinitionFresh(read.slug);
        const checked = checkDefinitionUpdate(read.row, current);
        if (checked.status !== 'ready' || !checked.text)
            return { error: 'changed', at };
        const saved = await updateDefinitionText(
            uid,
            read.slug,
            checked.text,
            expected
        );
        if (!saved.ok) return { error: 'changed', at };
    } catch (error) {
        console.error(
            '[definitions] upload save failed',
            (error as Error).message
        );
        return { error: 'generic', at };
    }

    updateTag(DEFINITIONS_TAG);
    updateTag(definitionTag(read.slug));
    updateTag(ADMIN_LOG_TAG);
    refresh();
    return redirect({
        href: {
            pathname: `/dictionary/${read.slug}`,
            query: { saved: '1' },
        },
        locale: localeOf(formData),
    });
}
