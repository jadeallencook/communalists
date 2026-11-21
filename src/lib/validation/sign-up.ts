import { z } from 'zod';

import {
    confirmPasswordField,
    newPasswordField,
    passwordsMatch,
} from './password';

// Sign-up asks only for credentials. Name, language and city come next, on
// /account/setup, the same page any incomplete account is sent to
// (src/lib/account-setup.ts, decision #18).
//
// Messages are translation keys under SignUp.errors in messages/*.json, so
// the same schema works on the server and in every locale.
export type SignUpErrorKey =
    | 'required'
    | 'invalidEmail'
    | 'passwordTooShort'
    | 'passwordTooLong'
    | 'passwordMismatch'
    | 'emailInUse'
    | 'generic';

export const signUpSchema = z
    .object({
        email: z
            .string({ error: 'required' })
            .trim()
            .toLowerCase()
            .min(1, { error: 'required' })
            .pipe(z.email({ error: 'invalidEmail' })),
        password: newPasswordField,
        confirmPassword: confirmPasswordField,
    })
    .refine(...passwordsMatch);

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignUpField = keyof SignUpInput;

export interface SignUpState {
    fieldErrors?: Partial<Record<SignUpField, SignUpErrorKey>>;
    formError?: SignUpErrorKey;
    // Echoed back so the form keeps what was typed. Never includes the password.
    values?: Partial<Pick<SignUpInput, 'email'>>;
}
