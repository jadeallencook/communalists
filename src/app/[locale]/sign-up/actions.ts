'use server';

import { headers } from 'next/headers';
import { hasLocale } from 'next-intl';

import { signInWithPassword } from '@/lib/auth/password-sign-in';
import { startSession } from '@/lib/auth/session';
import { getAdminAuth } from '@/lib/firebase/admin';
import { geocodeArea } from '@/lib/geo/geocode';
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
        location: text(formData.get('location')),
    };
    const values = { name: raw.name, email: raw.email, location: raw.location };

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

    // Geocode before creating the account, so a bad location never leaves a
    // half-created user behind.
    let area;
    try {
        // Vercel adds the visitor's country (ISO code) to every request.
        const country =
            (await headers()).get('x-vercel-ip-country') ?? undefined;
        area = await geocodeArea(input.location, locale, country);
    } catch (error) {
        console.error('[sign-up] geocoder failed', (error as Error).message);
        return { formError: 'generic', values };
    }
    if (!area) return { fieldErrors: { location: 'locationNotFound' }, values };

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
