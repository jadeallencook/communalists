import { z } from 'zod';

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
    | 'generic';

export const accountSetupSchema = z.object({
    name: z
        .string({ error: 'required' })
        .trim()
        .min(1, { error: 'required' })
        .max(80, { error: 'tooLong' }),
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
    // Echoed back so the form keeps what was typed.
    values?: Partial<Pick<AccountSetupInput, 'name' | 'locale'>>;
}
