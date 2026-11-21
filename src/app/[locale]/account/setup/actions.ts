'use server';

import { hasLocale } from 'next-intl';

import { safeNextPath } from '@/lib/account-setup';
import { getSessionUser } from '@/lib/auth/session';
import { getPlace, toGeneralArea } from '@/lib/places';
import { saveUserProfile } from '@/lib/users';
import {
    accountSetupSchema,
    type AccountSetupErrorKey,
    type AccountSetupField,
    type AccountSetupState,
} from '@/lib/validation/account-setup';
import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const text = (value: FormDataEntryValue | null) =>
    typeof value === 'string' ? value : '';

export async function saveAccountSetup(
    _previous: AccountSetupState,
    formData: FormData
): Promise<AccountSetupState> {
    // `locale` is the preferred-language answer; the UI locale comes separately.
    const requestedUiLocale = text(formData.get('uiLocale'));
    const uiLocale = hasLocale(routing.locales, requestedUiLocale)
        ? requestedUiLocale
        : routing.defaultLocale;

    const user = await getSessionUser();
    if (!user) return redirect({ href: '/sign-in', locale: uiLocale });

    const raw = {
        name: text(formData.get('name')),
        locale: text(formData.get('locale')),
        country: text(formData.get('country')),
        placeId: text(formData.get('placeId')),
    };
    const values = { name: raw.name, locale: raw.locale as never };

    const parsed = accountSetupSchema.safeParse(raw);
    if (!parsed.success) {
        const fieldErrors: AccountSetupState['fieldErrors'] = {};
        for (const issue of parsed.error.issues) {
            const field = issue.path[0] as AccountSetupField;
            fieldErrors[field] ??= issue.message as AccountSetupErrorKey;
        }
        return { fieldErrors, values };
    }
    const input = parsed.data;

    // Look the place up on the server; never trust coordinates from the browser.
    const place = getPlace(input.country, input.placeId);
    if (!place) return { fieldErrors: { placeId: 'placeNotFound' }, values };

    try {
        await saveUserProfile(user.uid, {
            displayName: input.name,
            locale: input.locale,
            location: toGeneralArea(place),
        });
    } catch (error) {
        console.error('[account-setup] save failed', (error as Error).message); // never log PII
        return { formError: 'generic', values };
    }

    redirect({
        href: safeNextPath(formData.get('next'), routing.locales),
        locale: uiLocale,
    });
    return {};
}
