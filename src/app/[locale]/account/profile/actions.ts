'use server';

import { updateTag } from 'next/cache';

import { getSessionUser } from '@/lib/auth/session';
import { getProfileGroups } from '@/lib/organizations';
import { rotateUserPhoto } from '@/app/actions/rotate-user-photo';
import { syncMemberCopies } from '@/app/actions/sync-member-copies';
import { isStricter } from '@/lib/profiles';
import { getUserProfileFresh, saveProfileSettings, userTag } from '@/lib/users';
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
        const [myGroups, before] = await Promise.all([
            getProfileGroups(user.uid),
            getUserProfileFresh(user.uid),
        ]);
        const settings = toProfileSettings(
            parsed.data,
            myGroups.map((g) => g.orgId)
        );
        // Sharing with fewer people: move the photo to a new link first and
        // delete the old files, so copies of the old link (saved while they
        // could see it) stop working. If this fails nothing is saved, and
        // saving again retries.
        if (
            before?.photo &&
            isStricter(before.profile.visibility, settings.visibility)
        )
            await rotateUserPhoto(user.uid, before.photo);
        await saveProfileSettings(user.uid, settings);
    } catch (error) {
        console.error(
            '[profile] settings save failed',
            (error as Error).message
        ); // never log PII
        return { formError: 'generic', at };
    }
    // The profile page, previews and anything else showing this person.
    updateTag(userTag(user.uid));
    // Member lists decide who sees the photo from the copied visibility.
    await syncMemberCopies(user.uid);
    return { saved: true, at };
}
