'use server';

import { safeNextPath } from '@/lib/account-setup';
import { getSessionUser } from '@/lib/auth/session';
import type { AccountSetupState } from '@/lib/validation/account-setup';
import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

import { saveProfileForm, uiLocaleFrom } from '../save-profile';

export async function saveAccountSetup(
    _previous: AccountSetupState,
    formData: FormData
): Promise<AccountSetupState> {
    const uiLocale = uiLocaleFrom(formData);
    const user = await getSessionUser();
    if (!user) return redirect({ href: '/sign-in', locale: uiLocale });

    const problem = await saveProfileForm(user.uid, formData);
    if (problem) return problem;

    redirect({
        href: safeNextPath(formData.get('next'), routing.locales),
        locale: uiLocale,
    });
    return {};
}
