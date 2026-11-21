import { z } from 'zod';

import { isSupportedCountry } from '@/lib/places/types';

import {
    confirmPasswordField,
    newPasswordField,
    passwordsMatch,
} from './password';

// Messages are translation keys under SignUp.errors in messages/*.json, so
// the same schema works on the server and in every locale.
export type SignUpErrorKey =
    | 'required'
    | 'tooLong'
    | 'invalidEmail'
    | 'passwordTooShort'
    | 'passwordTooLong'
    | 'passwordMismatch'
    | 'emailInUse'
    | 'placeRequired'
    | 'placeNotFound'
    | 'generic';

const requiredText = (max: number) =>
    z
        .string({ error: 'required' })
        .trim()
        .min(1, { error: 'required' })
        .max(max, { error: 'tooLong' });

export const signUpSchema = z
    .object({
        name: requiredText(80),
        email: z
            .string({ error: 'required' })
            .trim()
            .toLowerCase()
            .min(1, { error: 'required' })
            .pipe(z.email({ error: 'invalidEmail' })),
        password: newPasswordField,
        country: z
            .string({ error: 'placeRequired' })
            .refine(isSupportedCountry, { error: 'placeRequired' }),
        // A GeoNames id chosen from the city picker. The server looks it up, so
        // the browser never supplies coordinates.
        placeId: z
            .string({ error: 'placeRequired' })
            .regex(/^\d{1,12}$/, { error: 'placeRequired' }),
        confirmPassword: confirmPasswordField,
    })
    .refine(...passwordsMatch);

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignUpField = keyof SignUpInput;

export interface SignUpState {
    fieldErrors?: Partial<Record<SignUpField, SignUpErrorKey>>;
    formError?: SignUpErrorKey;
    // Echoed back so the form keeps what was typed. Never includes the password.
    values?: Partial<Pick<SignUpInput, 'name' | 'email'>>;
}
