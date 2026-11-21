import { describe, expect, it } from 'vitest';

import { routing } from '@/i18n/routing';

import en from './en.json';
import es from './es.json';
import vi from './vi.json';
import zh from './zh.json';

// The prototype fell back to '' for missing translations, which hid bugs like
// a blank "confirm password" label. Here a missing or empty key fails CI.
const catalogs: Record<string, unknown> = { en, es, vi, zh };

function flatten(value: unknown, prefix = ''): Record<string, unknown> {
    if (value === null || typeof value !== 'object') return { [prefix]: value };
    return Object.entries(value).reduce<Record<string, unknown>>(
        (acc, [key, child]) => ({
            ...acc,
            ...flatten(child, prefix ? `${prefix}.${key}` : key),
        }),
        {}
    );
}

const englishKeys = Object.keys(flatten(en)).sort();

describe('message catalogs', () => {
    it('has a catalog for every configured locale', () => {
        expect(Object.keys(catalogs).sort()).toEqual(
            [...routing.locales].sort()
        );
    });

    it.each(routing.locales)('%s has exactly the English keys', (locale) => {
        expect(Object.keys(flatten(catalogs[locale])).sort()).toEqual(
            englishKeys
        );
    });

    it.each(routing.locales)('%s has no empty strings', (locale) => {
        const empty = Object.entries(flatten(catalogs[locale]))
            .filter(([, text]) => typeof text !== 'string' || !text.trim())
            .map(([key]) => key);
        expect(empty).toEqual([]);
    });
});
