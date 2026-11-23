import { describe, expect, it } from 'vitest';

import { accountSetupSchema } from './account-setup';

const valid = {
    name: '  Ada Lovelace ',
    username: ' Ada-Lovelace ',
    locale: 'es',
    country: 'US',
    placeId: '5392171',
};

const errorsFor = (input: Record<string, string>) => {
    const result = accountSetupSchema.safeParse(input);
    if (result.success) return {};
    return Object.fromEntries(
        result.error.issues.map((issue) => [issue.path[0], issue.message])
    );
};

describe('accountSetupSchema', () => {
    it('accepts a full answer and trims the name', () => {
        expect(accountSetupSchema.parse(valid)).toEqual({
            ...valid,
            name: 'Ada Lovelace',
            username: 'ada-lovelace',
        });
    });

    it('returns translation keys', () => {
        expect(
            errorsFor({
                name: ' ',
                username: '',
                locale: 'fr',
                country: 'US',
                placeId: '',
            })
        ).toEqual({
            name: 'required',
            username: 'required',
            locale: 'languageRequired',
            placeId: 'placeRequired',
        });
        expect(errorsFor({ ...valid, name: 'x'.repeat(81) }).name).toBe(
            'tooLong'
        );
    });

    it('checks the username with the same rules as group handles', () => {
        expect(errorsFor({ ...valid, username: 'ab' }).username).toBe(
            'usernameTooShort'
        );
        expect(errorsFor({ ...valid, username: 'ada_l' }).username).toBe(
            'usernameFormat'
        );
        expect(errorsFor({ ...valid, username: 'comrade' }).username).toBe(
            'usernameReserved'
        );
    });

    it('requires a city picked from the list, in a supported country', () => {
        expect(errorsFor({ ...valid, placeId: 'San Jose' }).placeId).toBe(
            'placeRequired'
        );
        expect(errorsFor({ ...valid, country: 'FR' }).country).toBe(
            'placeRequired'
        );
    });
});
