'use server';

import { hasLocale } from 'next-intl';

import { signInWithPassword } from '@/lib/auth/password-sign-in';
import { startSession } from '@/lib/auth/session';
import { getAdminAuth } from '@/lib/firebase/admin';
import { getPlace, toGeneralArea } from '@/lib/places';
import { createUserProfile } from '@/lib/users';
import {
    signUpSchema,
    type SignUpErrorKey,
    type SignUpField,
    type SignUpState,
} from '@/lib/validation/sign-up';
import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const text = (value: FormDataEntryValue | null) =>
    typeof value === 'string' ? value : '';

export async function signUp(
    _previous: SignUpState,
    formData: FormData
): Promise<SignUpState> {
    // Server actions can't read the [locale] root param, so the form sends it.
    const requestedLocale = text(formData.get('locale'));
    const locale = hasLocale(routing.locales, requestedLocale)
        ? requestedLocale
        : routing.defaultLocale;

    const raw = {
        name: text(formData.get('name')),
        email: text(formData.get('email')),
        password: text(formData.get('password')),
        confirmPassword: text(formData.get('confirmPassword')),
        country: text(formData.get('country')),
        placeId: text(formData.get('placeId')),
    };
    const values = { name: raw.name, email: raw.email };

    const parsed = signUpSchema.safeParse(raw);
    if (!parsed.success) {
        const fieldErrors: SignUpState['fieldErrors'] = {};
        for (const issue of parsed.error.issues) {
            const field = issue.path[0] as SignUpField;
            fieldErrors[field] ??= issue.message as SignUpErrorKey;
        }
        return { fieldErrors, values };
    }
    const input = parsed.data;

    // Look the place up on the server (never trust coordinates from the
    // browser), before the account exists so a bad id leaves nothing behind.
    const place = getPlace(input.country, input.placeId);
    if (!place) return { fieldErrors: { placeId: 'placeNotFound' }, values };
    const area = toGeneralArea(place);

    let uid: string;
    try {
        ({ uid } = await getAdminAuth().createUser({
            email: input.email,
            password: input.password,
            displayName: input.name,
        }));
    } catch (error) {
        const code = (error as { code?: string }).code;
        if (code === 'auth/email-already-exists') {
            return { fieldErrors: { email: 'emailInUse' }, values };
        }
        if (code === 'auth/invalid-password') {
            return { fieldErrors: { password: 'passwordTooShort' }, values };
        }
        console.error('[sign-up] createUser failed', code); // never log PII
        return { formError: 'generic', values };
    }

    try {
        await createUserProfile(uid, {
            displayName: input.name,
            location: area,
            locale,
        });
        await startSession(
            await signInWithPassword(input.email, input.password)
        );
    } catch (error) {
        console.error(
            '[sign-up] finishing sign-up failed',
            (error as Error).message
        );
        // Roll back so the person can retry with the same email.
        await getAdminAuth()
            .deleteUser(uid)
            .catch(() => undefined);
        return { formError: 'generic', values };
    }

    redirect({ href: '/welcome', locale });
    return {};
}
