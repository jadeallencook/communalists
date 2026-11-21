'use server';

import { hasLocale } from 'next-intl';

import { IdentityToolkitError } from '@/lib/auth/identity-toolkit';
import { sendPasswordResetEmail } from '@/lib/auth/password-reset';
import { getSiteUrl } from '@/lib/site';
import {
    forgotPasswordOutcome,
    forgotPasswordSchema,
    type ForgotPasswordErrorKey,
    type ForgotPasswordState,
} from '@/lib/validation/forgot-password';
import { routing } from '@/i18n/routing';

const text = (value: FormDataEntryValue | null) =>
    typeof value === 'string' ? value : '';

export async function requestPasswordReset(
    _previous: ForgotPasswordState,
    formData: FormData
): Promise<ForgotPasswordState> {
    // Server actions can't read the [locale] root param, so the form sends it.
    const requestedLocale = text(formData.get('locale'));
    const locale = hasLocale(routing.locales, requestedLocale)
        ? requestedLocale
        : routing.defaultLocale;

    const values = { email: text(formData.get('email')) };
    const parsed = forgotPasswordSchema.safeParse(values);
    if (!parsed.success) {
        const key = parsed.error.issues[0]?.message as ForgotPasswordErrorKey;
        return { fieldErrors: { email: key }, values };
    }

    try {
        await sendPasswordResetEmail(parsed.data.email, {
            locale,
            // Firebase's reset page links back here when the password is set.
            continueUrl: `${getSiteUrl()}/${locale}/sign-in`,
        });
    } catch (error) {
        const code =
            error instanceof IdentityToolkitError ? error.code : 'unknown';
        const outcome = forgotPasswordOutcome(code);
        if (outcome === 'sent') return { sent: true, values };
        if (outcome === 'generic') {
            // Never log the email.
            console.error('[forgot-password] failed', code);
        }
        return { formError: outcome, values };
    }
    return { sent: true, values };
}
