import { z } from 'zod';

import { handleProblem, normalizeHandle } from '@/lib/organizations/handle';
import { isSupportedCountry } from '@/lib/places/types';
import { routing } from '@/i18n/routing';

// The /account/setup form: everything an account needs (see
// src/lib/account-setup.ts). Messages are keys under AccountSetup.errors.
export type AccountSetupErrorKey =
    | 'required'
    | 'tooLong'
    | 'languageRequired'
    | 'placeRequired'
    | 'placeNotFound'
    | 'usernameTooShort'
    | 'usernameTooLong'
    | 'usernameFormat'
    | 'usernameReserved'
    | 'usernameTaken'
    | 'usernameCooldown'
    | 'generic';

const usernameError = {
    tooShort: 'usernameTooShort',
    tooLong: 'usernameTooLong',
    format: 'usernameFormat',
    reserved: 'usernameReserved',
} as const;

export const accountSetupSchema = z.object({
    name: z
        .string({ error: 'required' })
        .trim()
        .min(1, { error: 'required' })
        .max(80, { error: 'tooLong' }),
    // The profile address (same rules as group handles). Uniqueness is
    // checked when it's claimed, in saveUserProfile.
    username: z
        .string({ error: 'required' })
        .transform(normalizeHandle)
        .superRefine((value, ctx) => {
            if (!value) {
                ctx.addIssue({ code: 'custom', message: 'required' });
                return;
            }
            const problem = handleProblem(value);
            if (problem)
                ctx.addIssue({
                    code: 'custom',
                    message: usernameError[problem],
                });
        }),
    // Preferred language for emails and notifications. Not the UI language,
    // which the visitor switches freely.
    locale: z.enum(routing.locales, { error: 'languageRequired' }),
    country: z
        .string({ error: 'placeRequired' })
        .refine(isSupportedCountry, { error: 'placeRequired' }),
    // A GeoNames id chosen from the city picker. The server looks it up, so
    // the browser never supplies coordinates.
    placeId: z
        .string({ error: 'placeRequired' })
        .regex(/^\d{1,12}$/, { error: 'placeRequired' }),
});

export type AccountSetupInput = z.infer<typeof accountSetupSchema>;
export type AccountSetupField = keyof AccountSetupInput;

export interface AccountSetupState {
    fieldErrors?: Partial<Record<AccountSetupField, AccountSetupErrorKey>>;
    formError?: AccountSetupErrorKey;
    /** Settings only: the last save worked. */
    saved?: boolean;
    // Echoed back so the form keeps what was typed.
    values?: Partial<Pick<AccountSetupInput, 'name' | 'locale' | 'username'>>;
}
