'use server';

import { refresh, updateTag } from 'next/cache';
import { hasLocale } from 'next-intl';

import { getSessionUser } from '@/lib/auth/session';
import {
    DIRECTORY_TAG,
    handleTag,
    membershipsTag,
    orgMembersTag,
    orgTag,
    updateOrganization,
} from '@/lib/organizations';
import { getPlace, toGeneralArea } from '@/lib/places';
import { getUserProfileFresh } from '@/lib/users';
import {
    organizationFormValues,
    organizationSchema,
    type CreateOrganizationState,
    type OrganizationErrorKey,
    type OrganizationField,
} from '@/lib/validation/organization';
import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

/**
 * Saves the edit form. Owners and moderators may edit; only owners may change
 * the handle (once every 30 days). Every rule is checked again on fresh data
 * inside updateOrganization.
 */
export async function updateOrganizationAction(
    _previous: CreateOrganizationState,
    formData: FormData
): Promise<CreateOrganizationState> {
    const requested = formData.get('uiLocale');
    const locale =
        typeof requested === 'string' && hasLocale(routing.locales, requested)
            ? requested
            : routing.defaultLocale;
    const orgId = formData.get('orgId');

    const user = await getSessionUser();
    if (!user) return redirect({ href: '/sign-in', locale });
    if (typeof orgId !== 'string' || !orgId) return { formError: 'generic' };

    const raw = organizationFormValues(formData);
    const values = { ...raw };
    const parsed = organizationSchema.safeParse(raw);
    if (!parsed.success) {
        const fieldErrors: CreateOrganizationState['fieldErrors'] = {};
        for (const issue of parsed.error.issues) {
            const field = issue.path[0] as OrganizationField;
            fieldErrors[field] ??= issue.message as OrganizationErrorKey;
        }
        return { fieldErrors, values };
    }
    const input = parsed.data;
    const place = getPlace(input.country, input.placeId);
    if (!place) return { fieldErrors: { placeId: 'placeNotFound' }, values };

    let result;
    try {
        const profile = await getUserProfileFresh(user.uid);
        result = await updateOrganization(
            orgId,
            user.uid,
            profile?.displayName ?? '',
            input,
            toGeneralArea(place)
        );
    } catch (error) {
        console.error('[org] update failed', (error as Error).message); // never log PII
        return { formError: 'generic', values };
    }
    if (!result.ok) {
        if (result.error === 'handleTaken' || result.error === 'handleCooldown')
            return { fieldErrors: { handle: result.error }, values };
        return {
            formError: result.error === 'notAllowed' ? 'notAllowed' : 'generic',
            values,
        };
    }

    // The page, its old and new addresses, listings, member lists, and every
    // member's dashboard (their copy of the name, handle and focus areas).
    updateTag(orgTag(orgId));
    updateTag(handleTag(result.handle));
    updateTag(handleTag(result.previousHandle));
    updateTag(orgMembersTag(orgId));
    updateTag(DIRECTORY_TAG);
    for (const uid of result.copyHolders) updateTag(membershipsTag(uid));
    refresh();
    redirect({ href: `/org/${result.handle}`, locale });
    return {};
}
