'use server';

import { updateTag } from 'next/cache';
import { hasLocale } from 'next-intl';

import type { ClaimFormState } from '@/components/organisms/claim-organization-form';
import { isSetupComplete } from '@/lib/account-setup';
import { getSessionUser } from '@/lib/auth/session';
import {
    cancelClaimRequest,
    CLAIMS_TAG,
    submitClaimRequest,
} from '@/lib/organizations/claim-store';
import {
    claimRequestSchema,
    type ClaimErrorKey,
    type ClaimField,
} from '@/lib/organizations/claims';
import { handleProblem } from '@/lib/organizations/handle';
import { getUserProfileFresh } from '@/lib/users';
import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

// Asking to claim (or take down) an unclaimed organization. Super users
// decide on /admin. Design: documentation/features/18-unclaimed-organizations.md.

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

export async function submitClaimAction(
    _prev: ClaimFormState,
    formData: FormData
): Promise<ClaimFormState> {
    const locale = localeOf(formData);
    const orgId = text(formData, 'orgId');
    const user = await getSessionUser();
    if (!user) return redirect({ href: '/sign-in', locale });

    const values = {
        intent: text(formData, 'intent'),
        role: text(formData, 'role'),
        message: text(formData, 'message'),
    };
    const parsed = claimRequestSchema.safeParse(values);
    if (!parsed.success) {
        const fieldErrors: ClaimFormState['fieldErrors'] = {};
        for (const issue of parsed.error.issues) {
            const field = issue.path[0] as ClaimField;
            fieldErrors[field] ??= issue.message as ClaimErrorKey;
        }
        return { fieldErrors, values };
    }
    if (!orgId || orgId.length > 128) return { formError: 'generic', values };

    // The team sees the name, so the account must be finished.
    const profile = await getUserProfileFresh(user.uid);
    if (!isSetupComplete(profile)) return { formError: 'generic', values };

    let result;
    try {
        result = await submitClaimRequest(
            orgId,
            user.uid,
            { displayName: profile!.displayName!, username: profile!.username },
            parsed.data
        );
    } catch (error) {
        console.error('[claim] submit failed', (error as Error).message); // never log PII
        return { formError: 'generic', values };
    }
    if (!result.ok) return { formError: result.error, values };

    updateTag(CLAIMS_TAG);
    // The page reads the request fresh, so it now shows it as sent.
    const handle = text(formData, 'handle');
    redirect({
        href: handleProblem(handle) ? '/dashboard' : `/org/${handle}/claim`,
        locale,
    });
    return {};
}

/** Withdraws the person's own pending request. */
export async function cancelClaimAction(formData: FormData) {
    const locale = localeOf(formData);
    const orgId = text(formData, 'orgId');
    const handle = text(formData, 'handle');
    const user = await getSessionUser();
    if (!user) return redirect({ href: '/sign-in', locale });
    if (orgId && orgId.length <= 128) {
        try {
            await cancelClaimRequest(orgId, user.uid);
            updateTag(CLAIMS_TAG);
        } catch (error) {
            console.error('[claim] cancel failed', (error as Error).message);
        }
    }
    redirect({
        href: handleProblem(handle) ? '/dashboard' : `/org/${handle}/claim`,
        locale,
    });
}
