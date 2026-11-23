'use server';

import { refresh } from 'next/cache';
import { getSessionUser } from '@/lib/auth/session';
import type { AccountSetupState } from '@/lib/validation/account-setup';
import { redirect } from '@/i18n/navigation';

import { saveProfileForm, uiLocaleFrom } from '../save-profile';

export async function saveAccountSettings(
    _previous: AccountSetupState,
    formData: FormData
): Promise<AccountSetupState> {
    const user = await getSessionUser();
    if (!user)
        return redirect({ href: '/sign-in', locale: uiLocaleFrom(formData) });

    const problem = await saveProfileForm(user.uid, formData);
    if (problem) return problem;

    // Re-render the page and layout so the header shows the new name now,
    // not after the next navigation. A returned state alone doesn't.
    refresh();

    // Stay on the page and confirm. Keep what was submitted in the form.
    return {
        saved: true,
        values: {
            name: String(formData.get('name') ?? '').trim(),
            locale: String(formData.get('locale') ?? '') as never,
        },
    };
}
