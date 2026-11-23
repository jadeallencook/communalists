import 'server-only';

import { updateTag } from 'next/cache';
import { hasLocale } from 'next-intl';

import { orgMembersTag, syncMemberCopy } from '@/lib/organizations';
import { getPlace, toGeneralArea } from '@/lib/places';
import { saveUserProfile, userTag, usernameTag } from '@/lib/users';
import {
    accountSetupSchema,
    type AccountSetupErrorKey,
    type AccountSetupField,
    type AccountSetupState,
} from '@/lib/validation/account-setup';
import { routing } from '@/i18n/routing';

// Shared by account setup and account settings: both submit the same profile
// form (name, preferred language, city) and save it the same way.

const text = (value: FormDataEntryValue | null) =>
    typeof value === 'string' ? value : '';

/** The UI locale the form was sent from (not the preferred-language answer). */
export function uiLocaleFrom(formData: FormData) {
    const requested = text(formData.get('uiLocale'));
    return hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;
}

/** Validates and saves the profile form for `uid`. Null on success, else the state to show. */
export async function saveProfileForm(
    uid: string,
    formData: FormData
): Promise<AccountSetupState | null> {
    const raw = {
        name: text(formData.get('name')),
        username: text(formData.get('username')),
        locale: text(formData.get('locale')),
        country: text(formData.get('country')),
        placeId: text(formData.get('placeId')),
    };
    const values = {
        name: raw.name,
        locale: raw.locale as never,
        username: raw.username,
    };

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

    let result;
    try {
        result = await saveUserProfile(uid, {
            displayName: input.name,
            username: input.username,
            locale: input.locale,
            location: toGeneralArea(place),
        });
    } catch (error) {
        console.error('[profile] save failed', (error as Error).message); // never log PII
        return { formError: 'generic', values };
    }
    if (!result.ok) return { fieldErrors: { username: result.error }, values };
    if (result.usernameChanged) {
        updateTag(usernameTag(input.username));
        if (result.previousUsername)
            updateTag(usernameTag(result.previousUsername));
    }
    // Clear this user's cached profile everywhere it's shown. Only valid in
    // server actions, which is where this runs.
    updateTag(userTag(uid));
    // Member lists show a copy of the name and username; bring those up to
    // date. A failure here leaves an old copy on a list, so it doesn't fail
    // the save (lists also repair missing copies themselves).
    try {
        const orgIds = await syncMemberCopy(uid, {
            displayName: input.name,
            username: input.username,
        });
        for (const orgId of orgIds) updateTag(orgMembersTag(orgId));
    } catch (error) {
        console.error(
            '[profile] member name sync failed',
            (error as Error).message
        );
    }
    return null;
}
