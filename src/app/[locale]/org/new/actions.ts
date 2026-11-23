'use server';

import { updateTag } from 'next/cache';
import { hasLocale } from 'next-intl';

import { isSetupComplete } from '@/lib/account-setup';
import { getSessionUser } from '@/lib/auth/session';
import {
    createOrganization,
    DIRECTORY_TAG,
    handleTag,
    membershipsTag,
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

export async function createOrganizationAction(
    _previous: CreateOrganizationState,
    formData: FormData
): Promise<CreateOrganizationState> {
    const requested = formData.get('uiLocale');
    const locale =
        typeof requested === 'string' && hasLocale(routing.locales, requested)
            ? requested
            : routing.defaultLocale;

    const user = await getSessionUser();
    if (!user) return redirect({ href: '/sign-in', locale });
    // Creating needs a finished account (name and city).
    const profile = await getUserProfileFresh(user.uid);
    if (!isSetupComplete(profile)) {
        return redirect({
            href: { pathname: '/account/setup', query: { next: '/org/new' } },
            locale,
        });
    }

    const raw = organizationFormValues(formData);
    const values = { ...raw, radiusMiles: raw.radiusMiles };

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
        result = await createOrganization(
            user.uid,
            // Both set: isSetupComplete checked them.
            {
                displayName: profile?.displayName ?? '',
                username: profile?.username,
            },
            input,
            toGeneralArea(place)
        );
    } catch (error) {
        console.error('[org] create failed', (error as Error).message); // never log PII
        return { formError: 'generic', values };
    }
    if (!result.ok) {
        return result.error === 'handleTaken'
            ? { fieldErrors: { handle: 'handleTaken' }, values }
            : { formError: 'ownedLimit', values };
    }

    // The dashboard lists it, the handle now resolves, and /find shows it.
    updateTag(membershipsTag(user.uid));
    updateTag(handleTag(result.handle));
    updateTag(DIRECTORY_TAG);
    redirect({ href: `/org/${result.handle}`, locale });
    return {};
}
