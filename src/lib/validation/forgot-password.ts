import { z } from 'zod';

// Messages are translation keys under ForgotPassword.errors in messages/*.json.
export type ForgotPasswordErrorKey =
    'required' | 'invalidEmail' | 'tooManyAttempts' | 'generic';

export const forgotPasswordSchema = z.object({
    email: z
        .string({ error: 'required' })
        .trim()
        .toLowerCase()
        .min(1, { error: 'required' })
        .pipe(z.email({ error: 'invalidEmail' })),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ForgotPasswordField = keyof ForgotPasswordInput;

export interface ForgotPasswordState {
    fieldErrors?: Partial<Record<ForgotPasswordField, ForgotPasswordErrorKey>>;
    formError?: ForgotPasswordErrorKey;
    /** True once the request went through (or the email has no account; see below). */
    sent?: boolean;
    values?: Partial<ForgotPasswordInput>;
}

/**
 * What to show after Firebase answers a reset request. An unknown or disabled
 * email reads as "sent", exactly like a real one, so the page never reveals
 * who has an account.
 */
export function forgotPasswordOutcome(
    code: string
): 'sent' | ForgotPasswordErrorKey {
    switch (code) {
        case 'EMAIL_NOT_FOUND':
        case 'USER_DISABLED':
            return 'sent';
        case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        case 'RESET_PASSWORD_EXCEED_LIMIT':
            return 'tooManyAttempts';
        default:
            return 'generic';
    }
}
