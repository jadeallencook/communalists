import { describe, expect, it } from 'vitest';

import { signUpSchema } from './sign-up';

const valid = {
    email: 'Ada@Example.com ',
    password: 'correct horse',
    confirmPassword: 'correct horse',
};

const errorsFor = (input: Record<string, string>) => {
    const result = signUpSchema.safeParse(input);
    if (result.success) return {};
    return Object.fromEntries(
        result.error.issues.map((issue) => [issue.path[0], issue.message])
    );
};

describe('signUpSchema', () => {
    it('accepts a valid sign-up and normalizes the email', () => {
        expect(signUpSchema.parse(valid).email).toBe('ada@example.com');
    });

    it('keeps spaces in passwords', () => {
        expect(
            signUpSchema.parse({
                ...valid,
                password: ' pad  me ',
                confirmPassword: ' pad  me ',
            }).password
        ).toBe(' pad  me ');
    });

    it('returns translation keys, one per field', () => {
        expect(
            errorsFor({ email: 'nope', password: 'short', confirmPassword: '' })
        ).toEqual({
            email: 'invalidEmail',
            password: 'passwordTooShort',
            confirmPassword: 'required',
        });
    });

    it('flags an empty email as required, not invalid', () => {
        expect(errorsFor({ ...valid, email: '' }).email).toBe('required');
    });

    it('enforces the maximum password length', () => {
        const long = 'x'.repeat(129);
        expect(
            errorsFor({ ...valid, password: long, confirmPassword: long })
                .password
        ).toBe('passwordTooLong');
    });

    it('requires the password typed twice, matching exactly', () => {
        expect(
            errorsFor({ ...valid, confirmPassword: 'correct horse ' })
        ).toEqual({ confirmPassword: 'passwordMismatch' });
    });

    it('reports a mismatch alongside other field errors', () => {
        expect(
            errorsFor({ ...valid, email: '', confirmPassword: 'nope' })
        ).toEqual({ email: 'required', confirmPassword: 'passwordMismatch' });
    });

    it("doesn't pile a mismatch onto a password that's already invalid", () => {
        expect(
            errorsFor({ ...valid, password: 'short', confirmPassword: 'x' })
        ).toEqual({ password: 'passwordTooShort' });
    });

    it('ignores profile fields (they belong to account setup)', () => {
        expect(
            signUpSchema.parse({ ...valid, name: 'Ada' })
        ).not.toHaveProperty('name');
    });
});
