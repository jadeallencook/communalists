import { describe, expect, it } from 'vitest';

import { forgotPasswordOutcome, forgotPasswordSchema } from './forgot-password';

describe('forgotPasswordSchema', () => {
    it('normalizes the email', () => {
        expect(
            forgotPasswordSchema.parse({ email: ' Ada@Example.com' })
        ).toEqual({ email: 'ada@example.com' });
    });

    it('returns translation keys', () => {
        const issue = (email: string) =>
            forgotPasswordSchema.safeParse({ email }).error?.issues[0]?.message;
        expect(issue('')).toBe('required');
        expect(issue('nope')).toBe('invalidEmail');
    });
});

describe('forgotPasswordOutcome', () => {
    it('treats an unknown or disabled email like a sent one', () => {
        expect(forgotPasswordOutcome('EMAIL_NOT_FOUND')).toBe('sent');
        expect(forgotPasswordOutcome('USER_DISABLED')).toBe('sent');
    });

    it('maps throttling and unknown errors', () => {
        expect(forgotPasswordOutcome('RESET_PASSWORD_EXCEED_LIMIT')).toBe(
            'tooManyAttempts'
        );
        expect(forgotPasswordOutcome('TOO_MANY_ATTEMPTS_TRY_LATER')).toBe(
            'tooManyAttempts'
        );
        expect(forgotPasswordOutcome('500')).toBe('generic');
    });
});
