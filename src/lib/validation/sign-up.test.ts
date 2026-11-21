import { describe, expect, it } from 'vitest';

import { signUpSchema } from './sign-up';

const valid = {
    name: 'Ada Lovelace',
    email: 'Ada@Example.com ',
    password: 'correct horse',
    location: 'San Jose, CA',
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
            signUpSchema.parse({ ...valid, password: ' pad  me ' }).password
        ).toBe(' pad  me ');
    });

    it('returns translation keys, one per field', () => {
        expect(
            errorsFor({
                name: '  ',
                email: 'nope',
                password: 'short',
                location: '',
            })
        ).toEqual({
            name: 'required',
            email: 'invalidEmail',
            password: 'passwordTooShort',
            location: 'required',
        });
    });

    it('flags an empty email as required, not invalid', () => {
        expect(errorsFor({ ...valid, email: '' }).email).toBe('required');
    });

    it('enforces maximum lengths', () => {
        expect(errorsFor({ ...valid, name: 'x'.repeat(81) }).name).toBe(
            'tooLong'
        );
        expect(
            errorsFor({ ...valid, password: 'x'.repeat(129) }).password
        ).toBe('passwordTooLong');
    });
});
