'use server';

import { hasLocale } from 'next-intl';

import { DEFAULT_NEXT_PATH } from '@/lib/account-setup';
import { IdentityToolkitError } from '@/lib/auth/identity-toolkit';
import { confirmPasswordReset } from '@/lib/auth/password-reset';
import { signInWithPassword } from '@/lib/auth/password-sign-in';
import { revokeAllSessions, startSession } from '@/lib/auth/session';
import { getAdminAuth } from '@/lib/firebase/admin';
import {
    linkProblemFor,
    resetPasswordSchema,
    type ResetPasswordErrorKey,
    type ResetPasswordField,
    type ResetPasswordState,
} from '@/lib/validation/reset-password';
import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const text = (value: FormDataEntryValue | null) =>
    typeof value === 'string' ? value : '';

export async function resetPassword(
    _previous: ResetPasswordState,
    formData: FormData
): Promise<ResetPasswordState> {
    // Server actions can't read the [locale] root param, so the form sends it.
    const requestedLocale = text(formData.get('locale'));
    const locale = hasLocale(routing.locales, requestedLocale)
        ? requestedLocale
        : routing.defaultLocale;

    const parsed = resetPasswordSchema.safeParse({
        oobCode: text(formData.get('oobCode')),
        password: text(formData.get('password')),
        confirmPassword: text(formData.get('confirmPassword')),
    });
    if (!parsed.success) {
        const fieldErrors: ResetPasswordState['fieldErrors'] = {};
        for (const issue of parsed.error.issues) {
            const field = issue.path[0];
            if (field === 'oobCode') return { linkExpired: true };
            fieldErrors[field as ResetPasswordField] ??=
                issue.message as ResetPasswordErrorKey;
        }
        return { fieldErrors };
    }
    const { oobCode, password } = parsed.data;

    let email: string;
    try {
        email = await confirmPasswordReset(oobCode, password);
    } catch (error) {
        const code =
            error instanceof IdentityToolkitError ? error.code : 'unknown';
        if (linkProblemFor(code) !== 'generic') return { linkExpired: true };
        console.error('[reset-password] reset failed', code);
        return { formError: 'generic' };
    }

    // The password is changed. From here on, any failure just sends the
    // person to sign in with it.
    try {
        // Sign out every existing session first: a reset often means someone
        // else may have the account, or it's open on a shared computer.
        const { uid } = await getAdminAuth().getUserByEmail(email);
        await revokeAllSessions(uid);
        await startSession(await signInWithPassword(email, password));
    } catch (error) {
        console.error(
            '[reset-password] post-reset sign-in failed',
            (error as Error).message
        );
        redirect({ href: '/sign-in', locale });
    }

    redirect({ href: DEFAULT_NEXT_PATH, locale });
    return {};
}
