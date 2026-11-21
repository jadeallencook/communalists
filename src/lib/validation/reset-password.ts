import { z } from 'zod';

import {
    confirmPasswordField,
    newPasswordField,
    passwordsMatch,
} from './password';

// Messages are translation keys under ResetPassword.errors in messages/*.json.
export type ResetPasswordErrorKey =
    | 'required'
    | 'passwordTooShort'
    | 'passwordTooLong'
    | 'passwordMismatch'
    | 'generic';

export const resetPasswordSchema = z
    .object({
        // The one-time code from the emailed link, sent back as a hidden field.
        oobCode: z.string().min(1),
        password: newPasswordField,
        confirmPassword: confirmPasswordField,
    })
    .refine(...passwordsMatch);

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordField = 'password' | 'confirmPassword';

export interface ResetPasswordState {
    fieldErrors?: Partial<Record<ResetPasswordField, ResetPasswordErrorKey>>;
    formError?: ResetPasswordErrorKey;
    /** The code expired or was used while the form was open. */
    linkExpired?: boolean;
}

/** Why an emailed link can't be used: expired/already used, or not a link we handle. */
export type LinkProblem = 'expired' | 'invalid';

/** Maps a Firebase Auth REST error for an oobCode to what the page shows. */
export function linkProblemFor(code: string): LinkProblem | 'generic' {
    switch (code) {
        // Firebase reports a used code as INVALID_OOB_CODE. Clicking an old
        // email twice is the usual cause, so it reads as "expired".
        case 'EXPIRED_OOB_CODE':
        case 'INVALID_OOB_CODE':
            return 'expired';
        case 'MISSING_OOB_CODE':
            return 'invalid';
        default:
            return 'generic';
    }
}
