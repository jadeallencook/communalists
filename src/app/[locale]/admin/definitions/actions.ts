'use server';

import { refresh, updateTag } from 'next/cache';
import { hasLocale } from 'next-intl';

import type { DefinitionFormState } from '@/components/organisms/definition-form';
import { isPlatformAdmin } from '@/lib/auth/platform-admin';
import { getSessionUser } from '@/lib/auth/session';
import {
    definitionFromForm,
    definitionInputSchema,
    fieldForIssue,
    type DefinitionErrorKey,
} from '@/lib/definitions';
import {
    DEFINITIONS_TAG,
    definitionTag,
    saveDefinition,
} from '@/lib/definitions/store';
import { ADMIN_LOG_TAG } from '@/lib/organizations/claim-store';
import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

// A super user adds or edits a dictionary word.
// Design: documentation/features/19-dictionary.md.

const text = (formData: FormData, key: string) => {
    const value = formData.get(key);
    return typeof value === 'string' ? value : '';
};

export async function saveDefinitionAction(
    _prev: DefinitionFormState,
    formData: FormData
): Promise<DefinitionFormState> {
    const requested = text(formData, 'locale');
    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;
    const at = Date.now();
    const user = await getSessionUser();
    if (!user) return redirect({ href: '/sign-in', locale });

    const mode = text(formData, 'mode') === 'edit' ? 'edit' : 'create';
    const values = definitionFromForm(
        (name) => text(formData, name),
        (name) =>
            formData
                .getAll(name)
                .filter((v): v is string => typeof v === 'string')
    );
    // The page is hidden from everyone else, but actions can be called directly.
    if (!isPlatformAdmin(user.uid))
        return { formError: 'notAllowed', values, at };

    const parsed = definitionInputSchema.safeParse(values);
    if (!parsed.success) {
        const fieldErrors: DefinitionFormState['fieldErrors'] = {};
        for (const issue of parsed.error.issues) {
            const field = fieldForIssue(issue.path);
            fieldErrors[field] ??= issue.message as DefinitionErrorKey;
        }
        return { fieldErrors, values, at };
    }

    let result;
    try {
        result = await saveDefinition(user.uid, mode, parsed.data);
    } catch (error) {
        console.error('[definitions] save failed', (error as Error).message);
        return { formError: 'generic', values, at };
    }
    if (!result.ok) {
        return result.error === 'slugTaken'
            ? { fieldErrors: {}, formError: 'slugTaken', values, at }
            : { formError: 'notFound', values, at };
    }

    const { slug } = parsed.data;
    updateTag(DEFINITIONS_TAG);
    updateTag(definitionTag(slug));
    updateTag(ADMIN_LOG_TAG);
    refresh();
    // Opened from the word's page: go back there, where "Saved" is shown.
    if (mode === 'edit' && text(formData, 'returnTo') === 'page')
        return redirect({
            href: { pathname: `/dictionary/${slug}`, query: { saved: '1' } },
            locale,
        });
    return redirect({
        href: { pathname: '/admin/definitions', query: { saved: slug } },
        locale,
    });
}
