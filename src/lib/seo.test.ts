import { describe, expect, it } from 'vitest';

import {
    DESCRIPTION_MAX,
    jsonLdString,
    keywordList,
    localizedAlternates,
    localizedSitemapEntries,
    snippet,
} from './seo';

describe('localizedAlternates', () => {
    it('links every language and a locale-less x-default', () => {
        expect(localizedAlternates('/dictionary/mutual-aid', 'es')).toEqual({
            canonical: '/es/dictionary/mutual-aid',
            languages: {
                en: '/en/dictionary/mutual-aid',
                es: '/es/dictionary/mutual-aid',
                vi: '/vi/dictionary/mutual-aid',
                zh: '/zh/dictionary/mutual-aid',
                'x-default': '/dictionary/mutual-aid',
            },
        });
    });

    it('handles the home page without a trailing slash', () => {
        const { canonical, languages } = localizedAlternates('/', 'en');
        expect(canonical).toBe('/en');
        expect(languages.vi).toBe('/vi');
        expect(languages['x-default']).toBe('/');
    });
});

describe('snippet', () => {
    it('keeps short text, collapsing whitespace', () => {
        expect(snippet('  Hot meals\n\nevery   Sunday. ')).toBe(
            'Hot meals every Sunday.'
        );
    });

    it('cuts long text at a word with an ellipsis', () => {
        const long = 'We share food, rides and tools with neighbors. '.repeat(
            10
        );
        const out = snippet(long);
        expect(out.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
        expect(out.endsWith('…')).toBe(true);
        expect(out).not.toMatch(/[ ,.]…$/);
        expect(long.startsWith(out.slice(0, -1))).toBe(true);
    });

    it('cuts text without spaces by length', () => {
        const out = snippet('互助'.repeat(200));
        expect(out).toHaveLength(DESCRIPTION_MAX);
        expect(out.endsWith('…')).toBe(true);
    });
});

describe('keywordList', () => {
    it('merges comma lists and arrays without duplicates or blanks', () => {
        expect(
            keywordList('mutual aid, community , ', ['Mutual Aid', 'Food'], [])
        ).toEqual(['mutual aid', 'community', 'Food']);
    });

    it('skips missing groups', () => {
        expect(keywordList(undefined, null, 'a')).toEqual(['a']);
    });
});

describe('jsonLdString', () => {
    it('escapes < so text cannot close the script tag', () => {
        const out = jsonLdString({ name: '</script><script>alert(1)' });
        expect(out).not.toContain('<');
        expect(JSON.parse(out).name).toBe('</script><script>alert(1)');
    });
});

describe('localizedSitemapEntries', () => {
    it('lists the address once per language with absolute alternates', () => {
        const entries = localizedSitemapEntries(
            'https://communalists.com',
            '/organization/sbma',
            Date.UTC(2026, 10, 1)
        );
        expect(entries.map((e) => e.url)).toEqual([
            'https://communalists.com/en/organization/sbma',
            'https://communalists.com/es/organization/sbma',
            'https://communalists.com/vi/organization/sbma',
            'https://communalists.com/zh/organization/sbma',
        ]);
        expect(entries[0].alternates.languages['x-default']).toBe(
            'https://communalists.com/organization/sbma'
        );
        expect(entries[2].lastModified?.toISOString()).toBe(
            '2026-11-01T00:00:00.000Z'
        );
    });
});
