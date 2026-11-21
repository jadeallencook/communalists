import { z } from 'zod';

// Messages are translation keys under SignIn.errors in messages/*.json.
export type SignInErrorKey =
    | 'required'
    | 'invalidEmail'
    | 'invalidCredentials'
    | 'tooManyAttempts'
    | 'generic';

export const signInSchema = z.object({
    email: z
        .string({ error: 'required' })
        .trim()
        .toLowerCase()
        .min(1, { error: 'required' })
        .pipe(z.email({ error: 'invalidEmail' })),
    // Only "required": length rules belong to sign-up. Checking them here
    // would lock out anyone whose password predates a rule change.
    password: z.string({ error: 'required' }).min(1, { error: 'required' }),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignInField = keyof SignInInput;

export interface SignInState {
    fieldErrors?: Partial<Record<SignInField, SignInErrorKey>>;
    formError?: SignInErrorKey;
    // Echoed back so the form keeps the email. Never includes the password.
    values?: Partial<Pick<SignInInput, 'email'>>;
}

/**
 * Maps a Firebase Auth REST error code to what the form shows. Wrong email and
 * wrong password read the same, so the form never reveals who has an account.
 */
export function signInErrorFor(code: string): SignInErrorKey {
    switch (code) {
        case 'INVALID_LOGIN_CREDENTIALS':
        case 'EMAIL_NOT_FOUND':
        case 'INVALID_PASSWORD':
        case 'INVALID_EMAIL':
        case 'USER_DISABLED':
            return 'invalidCredentials';
        case 'TOO_MANY_ATTEMPTS_TRY_LATER':
            return 'tooManyAttempts';
        default:
            return 'generic';
    }
}
