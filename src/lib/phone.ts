// Public phone numbers (an organization's line). Pure: no React, Next or
// Firebase, so a future mobile app can reuse it. Parsing and formatting use
// libphonenumber-js, because phone formats were a buggy area before
// (documentation/technical/tech-debt.md).
//
// Stored form: E.164, plus `;ext=N` when there's an extension
// ("+14082936111", "+14082936111;ext=2"). One string, so edits compare
// simply and the same number typed two ways is the same value.

import {
    parsePhoneNumberFromString,
    type CountryCode as PhoneCountry,
} from 'libphonenumber-js';

import { PHONE_INPUT_MAX } from './organizations/options';

/**
 * What was typed, as the stored form. `undefined` for empty, `null` when it
 * isn't a valid number. `country` is used for numbers typed without a
 * country code.
 */
export function normalizePhone(
    raw: string,
    country: PhoneCountry
): string | undefined | null {
    const text = raw.trim();
    if (!text) return undefined;
    if (text.length > PHONE_INPUT_MAX) return null;
    const number = parsePhoneNumberFromString(text, country);
    if (!number?.isValid()) return null;
    return number.ext ? `${number.number};ext=${number.ext}` : number.number;
}

/**
 * A stored number for people: national format for viewers in its country
 * ("(408) 293-6111 ext. 2"), international otherwise, and a `tel:` link.
 * Null for anything that doesn't parse (say, a hand-edited document).
 */
export function phoneForDisplay(
    stored: string | undefined,
    viewerCountry: PhoneCountry = 'US'
): { text: string; href: string } | null {
    if (!stored) return null;
    const [e164, ext] = stored.split(';ext=');
    const number = parsePhoneNumberFromString(e164);
    if (!number?.isValid()) return null;
    if (ext) number.setExt(ext);
    const text =
        number.country === viewerCountry
            ? number.formatNational()
            : number.formatInternational();
    return { text, href: number.getURI() };
}
