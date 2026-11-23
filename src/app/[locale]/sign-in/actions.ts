'use server';

import { hasLocale } from 'next-intl';

import { DEFAULT_NEXT_PATH } from '@/lib/account-setup';
import { IdentityToolkitError } from '@/lib/auth/identity-toolkit';
import { signInWithPassword } from '@/lib/auth/password-sign-in';
import { startSession } from '@/lib/auth/session';
import {
    signInErrorFor,
    signInSchema,
    type SignInErrorKey,
    type SignInField,
    type SignInState,
} from '@/lib/validation/sign-in';
import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const text = (value: FormDataEntryValue | null) =>
    typeof value === 'string' ? value : '';

export async function signIn(
    _previous: SignInState,
    formData: FormData
): Promise<SignInState> {
    // Server actions can't read the [locale] root param, so the form sends it.
    const requestedLocale = text(formData.get('locale'));
    const locale = hasLocale(routing.locales, requestedLocale)
        ? requestedLocale
        : routing.defaultLocale;

    const raw = {
        email: text(formData.get('email')),
        password: text(formData.get('password')),
    };
    const values = { email: raw.email };

    const parsed = signInSchema.safeParse(raw);
    if (!parsed.success) {
        const fieldErrors: SignInState['fieldErrors'] = {};
        for (const issue of parsed.error.issues) {
            const field = issue.path[0] as SignInField;
            fieldErrors[field] ??= issue.message as SignInErrorKey;
        }
        return { fieldErrors, values };
    }

    try {
        await startSession(
            await signInWithPassword(parsed.data.email, parsed.data.password)
        );
    } catch (error) {
        const code =
            error instanceof IdentityToolkitError ? error.code : 'unknown';
        const formError = signInErrorFor(code);
        // Expected failures (wrong password) aren't worth logging. Never log PII.
        if (formError === 'generic') {
            console.error('[sign-in] failed', code, (error as Error).message);
        }
        return { formError, values };
    }

    redirect({ href: DEFAULT_NEXT_PATH, locale });
    return {};
}
