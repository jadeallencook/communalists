import { describe, expect, it } from 'vitest';

import { signInErrorFor, signInSchema } from './sign-in';

const errorsFor = (input: Record<string, string>) => {
    const result = signInSchema.safeParse(input);
    if (result.success) return {};
    return Object.fromEntries(
        result.error.issues.map((issue) => [issue.path[0], issue.message])
    );
};

describe('signInSchema', () => {
    it('accepts a sign-in and normalizes the email', () => {
        expect(
            signInSchema.parse({ email: ' Ada@Example.com', password: 'x' })
        ).toEqual({ email: 'ada@example.com', password: 'x' });
    });

    it('returns translation keys', () => {
        expect(errorsFor({ email: '', password: '' })).toEqual({
            email: 'required',
            password: 'required',
        });
        expect(errorsFor({ email: 'nope', password: 'x' })).toEqual({
            email: 'invalidEmail',
        });
    });

    it('does not apply sign-up password rules', () => {
        expect(errorsFor({ email: 'a@b.co', password: 'short' })).toEqual({});
    });
});

describe('signInErrorFor', () => {
    it('gives wrong email and wrong password the same message', () => {
        for (const code of [
            'INVALID_LOGIN_CREDENTIALS',
            'EMAIL_NOT_FOUND',
            'INVALID_PASSWORD',
            'USER_DISABLED',
        ]) {
            expect(signInErrorFor(code)).toBe('invalidCredentials');
        }
    });

    it('maps throttling and unknown errors', () => {
        expect(signInErrorFor('TOO_MANY_ATTEMPTS_TRY_LATER')).toBe(
            'tooManyAttempts'
        );
        expect(signInErrorFor('500')).toBe('generic');
    });
});
