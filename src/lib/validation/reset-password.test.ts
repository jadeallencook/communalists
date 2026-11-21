import { describe, expect, it } from 'vitest';

import { linkProblemFor, resetPasswordSchema } from './reset-password';

const valid = {
    oobCode: 'abc123',
    password: 'new password',
    confirmPassword: 'new password',
};

const errorsFor = (input: Record<string, string>) => {
    const result = resetPasswordSchema.safeParse(input);
    if (result.success) return {};
    return Object.fromEntries(
        result.error.issues.map((issue) => [issue.path[0], issue.message])
    );
};

describe('resetPasswordSchema', () => {
    it('accepts a matching new password', () => {
        expect(resetPasswordSchema.parse(valid)).toEqual(valid);
    });

    it('uses the same rules as sign-up', () => {
        expect(
            errorsFor({ ...valid, password: 'short', confirmPassword: 'short' })
        ).toEqual({ password: 'passwordTooShort' });
        expect(errorsFor({ ...valid, confirmPassword: 'new passwor' })).toEqual(
            { confirmPassword: 'passwordMismatch' }
        );
        expect(errorsFor({ ...valid, confirmPassword: '' })).toEqual({
            confirmPassword: 'required',
        });
    });

    it('requires the code', () => {
        expect(errorsFor({ ...valid, oobCode: '' })).toHaveProperty('oobCode');
    });
});

describe('linkProblemFor', () => {
    it('treats expired and already-used codes the same', () => {
        expect(linkProblemFor('EXPIRED_OOB_CODE')).toBe('expired');
        expect(linkProblemFor('INVALID_OOB_CODE')).toBe('expired');
    });

    it('maps a missing code and unknown errors', () => {
        expect(linkProblemFor('MISSING_OOB_CODE')).toBe('invalid');
        expect(linkProblemFor('500')).toBe('generic');
    });
});
