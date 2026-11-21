import { describe, expect, it } from 'vitest';

import { signUpSchema } from './sign-up';

const valid = {
    name: 'Ada Lovelace',
    email: 'Ada@Example.com ',
    password: 'correct horse',
    confirmPassword: 'correct horse',
    country: 'US',
    placeId: '5392171',
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
        const result = signUpSchema.parse(valid);
        expect(result.email).toBe('ada@example.com');
        expect(result.name).toBe('Ada Lovelace');
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
            errorsFor({
                name: '  ',
                email: 'nope',
                password: 'short',
                confirmPassword: 'short',
                country: 'US',
                placeId: '',
            })
        ).toEqual({
            name: 'required',
            email: 'invalidEmail',
            password: 'passwordTooShort',
            placeId: 'placeRequired',
        });
    });

    it('flags an empty email as required, not invalid', () => {
        expect(errorsFor({ ...valid, email: '' }).email).toBe('required');
    });

    it('enforces maximum lengths', () => {
        expect(errorsFor({ ...valid, name: 'x'.repeat(81) }).name).toBe(
            'tooLong'
        );
        const long = 'x'.repeat(129);
        expect(
            errorsFor({ ...valid, password: long, confirmPassword: long })
                .password
        ).toBe('passwordTooLong');
    });

    it('requires a city picked from the list (a numeric place id)', () => {
        expect(errorsFor({ ...valid, placeId: '' }).placeId).toBe(
            'placeRequired'
        );
        expect(errorsFor({ ...valid, placeId: 'San Jose' }).placeId).toBe(
            'placeRequired'
        );
    });

    it('rejects countries without a place list', () => {
        expect(errorsFor({ ...valid, country: 'FR' }).country).toBe(
            'placeRequired'
        );
    });

    it('requires the password typed twice, matching exactly', () => {
        expect(errorsFor({ ...valid, confirmPassword: '' })).toEqual({
            confirmPassword: 'required',
        });
        expect(
            errorsFor({ ...valid, confirmPassword: 'correct horse ' })
        ).toEqual({ confirmPassword: 'passwordMismatch' });
    });

    it('reports a mismatch alongside other field errors', () => {
        expect(
            errorsFor({ ...valid, name: '', confirmPassword: 'nope' })
        ).toEqual({ name: 'required', confirmPassword: 'passwordMismatch' });
    });

    it("doesn't pile a mismatch onto a password that's already invalid", () => {
        expect(
            errorsFor({ ...valid, password: 'short', confirmPassword: 'x' })
        ).toEqual({ password: 'passwordTooShort' });
    });
});
