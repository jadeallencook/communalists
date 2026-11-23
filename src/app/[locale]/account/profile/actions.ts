'use server';

import { updateTag } from 'next/cache';

import { getSessionUser } from '@/lib/auth/session';
import { getProfileGroups } from '@/lib/organizations';
import { saveProfileSettings, userTag } from '@/lib/users';
import {
    profileFormValues,
    profileSettingsSchema,
    toProfileSettings,
    type ProfileErrorKey,
    type ProfileSettingsField,
    type ProfileSettingsState,
} from '@/lib/validation/profile';

/** Saves what the signed-in person shares on their profile. */
export async function saveProfileSettingsAction(
    _previous: ProfileSettingsState,
    formData: FormData
): Promise<ProfileSettingsState> {
    const at = Date.now();
    const user = await getSessionUser();
    if (!user) return { formError: 'generic', at };

    const parsed = profileSettingsSchema.safeParse(profileFormValues(formData));
    if (!parsed.success) {
        const fieldErrors: ProfileSettingsState['fieldErrors'] = {};
        for (const issue of parsed.error.issues) {
            const field = issue.path[0] as ProfileSettingsField;
            fieldErrors[field] ??= issue.message as ProfileErrorKey;
        }
        return { fieldErrors, at };
    }
    try {
        const myGroups = (await getProfileGroups(user.uid)).map((g) => g.orgId);
        await saveProfileSettings(
            user.uid,
            toProfileSettings(parsed.data, myGroups)
        );
    } catch (error) {
        console.error(
            '[profile] settings save failed',
            (error as Error).message
        ); // never log PII
        return { formError: 'generic', at };
    }
    // The profile page, previews and anything else showing this person.
    updateTag(userTag(user.uid));
    return { saved: true, at };
}
