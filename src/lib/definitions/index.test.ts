import { describe, expect, it } from 'vitest';

import { routing } from '@/i18n/routing';

import {
    closestWords,
    editDistance,
    searchWords,
    changedFields,
    cleanRelated,
    DEFINITION_LOCALES,
    definitionFromForm,
    definitionInputSchema,
    fieldForIssue,
    isLetter,
    neighborLetters,
    knownResources,
    letterOf,
    localize,
    paragraphs,
    previewsFor,
    readDefinition,
    slugProblem,
    sortByWord,
} from './index';

const entry = (word: string, definition = `${word} means something.`) => ({
    word,
    definition,
    details: '',
});
const input = {
    slug: 'mutual-aid',
    text: {
        en: entry('Mutual aid'),
        es: entry('Ayuda mutua'),
        vi: entry('Tương trợ'),
        zh: entry('互助'),
    },
    related: ['solidarity'],
};

describe('locales', () => {
    it('matches the UI locales', () => {
        expect([...DEFINITION_LOCALES]).toEqual([...routing.locales]);
    });
});

describe('slugProblem', () => {
    it.each(['mutual-aid', 'free-fridge', 'covid-19', 'ab'])(
        'accepts %s',
        (slug) => expect(slugProblem(slug)).toBeNull()
    );
    it.each([
        ['', 'slugRequired'],
        ['a', 'slugFormat'],
        ['Mutual-Aid', 'slugFormat'],
        ['mutual aid', 'slugFormat'],
        ['mutual--aid', 'slugFormat'],
        ['-aid', 'slugFormat'],
        ['aid-', 'slugFormat'],
        ['ayuda_mutua', 'slugFormat'],
        ['ayúda', 'slugFormat'],
        ['a'.repeat(61), 'slugFormat'],
        ['new', 'slugReserved'],
        ['import', 'slugReserved'],
        ['upload', 'slugReserved'],
    ])('rejects %j (%s)', (slug, problem) =>
        expect(slugProblem(slug)).toBe(problem)
    );
});

describe('definitionInputSchema', () => {
    it('accepts a word in every language', () => {
        const parsed = definitionInputSchema.parse(input);
        expect(parsed.text.zh.word).toBe('互助');
    });

    it('trims text', () => {
        const parsed = definitionInputSchema.parse({
            ...input,
            text: { ...input.text, en: entry('  Mutual aid  ') },
        });
        expect(parsed.text.en.word).toBe('Mutual aid');
    });

    it('needs every language, and names the field', () => {
        const result = definitionInputSchema.safeParse({
            ...input,
            text: { ...input.text, vi: { word: ' ', definition: '' } },
        });
        expect(result.success).toBe(false);
        const issues = result.error!.issues.map((issue) => [
            fieldForIssue(issue.path),
            issue.message,
        ]);
        expect(issues).toEqual([
            ['vi.word', 'wordRequired'],
            ['vi.definition', 'definitionRequired'],
        ]);
    });

    it('limits lengths', () => {
        const result = definitionInputSchema.safeParse({
            ...input,
            text: {
                ...input.text,
                es: {
                    word: 'w'.repeat(81),
                    definition: 'd'.repeat(301),
                    details: 'x'.repeat(5001),
                },
            },
            related: Array.from({ length: 11 }, (_, i) => `word-${i}`),
        });
        const messages = result.error!.issues.map((i) => i.message);
        expect(messages).toEqual(
            expect.arrayContaining([
                'wordTooLong',
                'definitionTooLong',
                'detailsTooLong',
                'relatedTooMany',
            ])
        );
    });

    it('reports a bad slug on the slug field', () => {
        const result = definitionInputSchema.safeParse({
            ...input,
            slug: 'Mutual Aid',
        });
        const [issue] = result.error!.issues;
        expect(fieldForIssue(issue.path)).toBe('slug');
        expect(issue.message).toBe('slugFormat');
    });
});

describe('definitionFromForm', () => {
    it('reads the form fields and lowercases the slug', () => {
        const form = new Map([
            ['slug', 'Mutual-Aid'],
            ['en.word', 'Mutual aid'],
            ['zh.definition', '互相帮助'],
        ]);
        const values = definitionFromForm(
            (name) => form.get(name) ?? '',
            () => ['solidarity', 'organizer']
        );
        expect(values.slug).toBe('mutual-aid');
        expect(values.text.en.word).toBe('Mutual aid');
        expect(values.text.zh.definition).toBe('互相帮助');
        expect(values.text.es).toEqual({
            word: '',
            definition: '',
            details: '',
        });
        expect(values.related).toEqual(['solidarity', 'organizer']);
    });
});

describe('cleanRelated', () => {
    it('keeps real other words, once, in order', () => {
        expect(
            cleanRelated(
                'mutual-aid',
                ['solidarity', 'mutual-aid', 'gone', 'solidarity', 'organizer'],
                new Set(['mutual-aid', 'solidarity', 'organizer'])
            )
        ).toEqual(['solidarity', 'organizer']);
    });
});

describe('readDefinition', () => {
    it('fills in defaults for missing fields', () => {
        const definition = readDefinition('solidarity', {
            text: { en: { word: 'Solidarity', definition: 'Standing with.' } },
        });
        expect(definition.text.en).toEqual({
            word: 'Solidarity',
            definition: 'Standing with.',
            details: '',
        });
        expect(definition.text.zh.word).toBe('');
        expect(definition.related).toEqual([]);
        expect(definition.resources).toEqual([]);
    });

    it('drops bad related slugs', () => {
        expect(
            readDefinition('a-word', { related: ['ok-slug', 'Bad Slug', 3] })
                .related
        ).toEqual(['ok-slug']);
    });
});

describe('knownResources', () => {
    it('keeps known types and leaves out unknown or broken ones', () => {
        const resources = knownResources([
            {
                id: '1',
                type: 'book',
                title: 'Mutual Aid',
                url: 'https://example.com/book',
                by: 'Someone',
            },
            {
                id: '2',
                type: 'podcast',
                title: 'Later',
                url: 'https://example.com',
            },
            {
                id: '3',
                type: 'link',
                title: 'Bad',
                url: 'javascript:alert(1)',
            },
            { id: '4', type: 'video' },
            'nonsense',
        ]);
        expect(resources.map((r) => r.id)).toEqual(['1']);
    });

    it('reads anything that isn’t a list as none', () => {
        expect(knownResources(undefined)).toEqual([]);
        expect(knownResources({ id: 1 })).toEqual([]);
    });
});

describe('localize', () => {
    const definition = readDefinition('mutual-aid', {
        text: {
            en: {
                word: 'Mutual aid',
                definition: 'Neighbors helping.',
                details: 'One.\n\nTwo.',
            },
            es: { word: 'Ayuda mutua', definition: 'Vecinos.' },
            vi: { word: 'Tương trợ', definition: '' },
        },
    });

    it('uses the locale’s text', () => {
        const text = localize(definition, 'es');
        expect(text).toMatchObject({
            word: 'Ayuda mutua',
            definition: 'Vecinos.',
            lang: 'es',
            details: [],
        });
    });

    it('falls back to English when the word or definition is blank', () => {
        for (const locale of ['vi', 'zh', 'fr']) {
            expect(localize(definition, locale)).toMatchObject({
                word: 'Mutual aid',
                definition: 'Neighbors helping.',
                details: ['One.', 'Two.'],
                lang: 'en',
            });
        }
    });

    it('shows the slug when there is no word at all', () => {
        expect(localize(readDefinition('orphan', {}), 'en').word).toBe(
            'orphan'
        );
    });
});

describe('paragraphs', () => {
    it('splits on blank lines and keeps single line breaks', () => {
        expect(paragraphs('One\nline.\n\n  \nTwo.\n\n')).toEqual([
            'One\nline.',
            'Two.',
        ]);
        expect(paragraphs('')).toEqual([]);
    });
});

describe('sortByWord', () => {
    it('sorts by the word, ignoring case and accents', () => {
        const words = [
            { word: 'solidarity' },
            { word: 'Ayuda mutua' },
            { word: 'Ésta' },
            { word: 'bloque' },
        ];
        expect(sortByWord(words, 'es').map((w) => w.word)).toEqual([
            'Ayuda mutua',
            'bloque',
            'Ésta',
            'solidarity',
        ]);
    });
});

describe('changedFields', () => {
    it('lists what a save changes', () => {
        const before = readDefinition('mutual-aid', {
            ...input,
            related: ['solidarity'],
        });
        expect(
            changedFields(before, definitionInputSchema.parse(input))
        ).toEqual([]);
        const after = definitionInputSchema.parse({
            ...input,
            text: {
                ...input.text,
                es: { ...input.text.es, word: 'Apoyo mutuo' },
            },
            related: [],
        });
        expect(changedFields(before, after)).toEqual(['es.word', 'related']);
    });
});

describe('previewsFor', () => {
    it('gives each word its short definition in the locale, by slug', () => {
        const words = [
            readDefinition('mutual-aid', {
                text: {
                    en: {
                        word: 'Mutual Aid',
                        definition: 'Helping.',
                        details: 'More.',
                    },
                    es: { word: 'Ayuda mutua', definition: 'Ayudar.' },
                },
            }),
            readDefinition('empty', {}),
        ];
        expect(previewsFor(words, 'es')).toEqual({
            'mutual-aid': {
                word: 'Ayuda mutua',
                definition: 'Ayudar.',
                lang: 'es',
            },
        });
        expect(previewsFor(words, 'zh')['mutual-aid'].lang).toBe('en');
    });
});

describe('letterOf', () => {
    it.each([
        ['Mutual Aid', 'en', 'm'],
        ['Ayuda mutua', 'es', 'a'],
        ['Árbol', 'es', 'a'],
        ['Ñandú', 'es', 'n'],
        ['Đoàn kết', 'vi', 'd'],
        ['Ưu tiên', 'vi', 'u'],
        ['Tương trợ', 'vi', 't'],
        ['互助', 'zh', 'h'],
        ['民主社会主义', 'zh', 'm'],
        ['爱心箱', 'zh', 'a'],
        ['了解你的权利', 'zh', 'l'],
        ['“不买东西”小组', 'zh', 'b'],
        ['"Quoted" word', 'en', 'q'],
    ])('%s (%s) → %s', (word, locale, letter) => {
        expect(letterOf(word, locale, 'x-slug')).toBe(letter);
    });

    it('falls back to the slug when the word has no letter to use', () => {
        expect(letterOf('123', 'en', 'covid-19')).toBe('c');
        expect(letterOf('', 'en', 'empty')).toBe('e');
    });
});

describe('isLetter', () => {
    it('is true for one lowercase letter only', () => {
        expect(['a', 'z'].every(isLetter)).toBe(true);
        expect(['A', 'ab', '1', '', 'mutual-aid'].some(isLetter)).toBe(false);
    });
});

describe('neighborLetters', () => {
    const letters = ['a', 'b', 'c', 'd', 'e'].map((letter, i) => ({
        letter,
        count: [2, 0, 1, 0, 3][i],
    }));
    it('skips letters with no words', () => {
        expect(neighborLetters(letters, 'c')).toEqual({
            previous: 'a',
            next: 'e',
        });
        expect(neighborLetters(letters, 'b')).toEqual({
            previous: 'a',
            next: 'c',
        });
    });
    it("doesn't wrap at either end", () => {
        expect(neighborLetters(letters, 'a')).toEqual({
            previous: undefined,
            next: 'c',
        });
        expect(neighborLetters(letters, 'e')).toEqual({
            previous: 'c',
            next: undefined,
        });
    });
    it('has nothing for an unknown letter', () => {
        expect(neighborLetters(letters, 'z')).toEqual({});
    });
});

describe('searchWords', () => {
    const words = [
        { slug: 'food-pantry', word: 'Food Pantry' },
        { slug: 'free-fridge', word: 'Free Fridge' },
        { slug: 'mutual-aid', word: 'Mutual Aid' },
        { slug: 'mutual-aid-network', word: 'Mutual Aid Network' },
        { slug: 'repair-cafe', word: 'Repair Café' },
        { slug: 'tuong-tro', word: 'Đoàn kết' },
        { slug: 'aid-station', word: 'Aid Station' },
    ];
    const slugs = (query: string, limit?: number) =>
        searchWords(words, query, limit).map((w) => w.slug);

    it('finds nothing for empty text', () => {
        expect(slugs('')).toEqual([]);
        expect(slugs('   ')).toEqual([]);
    });
    it('ignores case and accents', () => {
        expect(slugs('CAFE')).toEqual(['repair-cafe']);
        expect(slugs('doan')).toEqual(['tuong-tro']);
    });
    it('puts words that start with the text first, then later words, then anywhere', () => {
        expect(slugs('aid')).toEqual([
            'aid-station',
            'mutual-aid',
            'mutual-aid-network',
        ]);
        expect(slugs('ridge')).toEqual(['free-fridge']);
    });
    it('matches the address, with spaces as hyphens', () => {
        expect(slugs('mutual aid n')).toEqual(['mutual-aid-network']);
        expect(slugs('food-p')).toEqual(['food-pantry']);
    });
    it('stops at the limit', () => {
        expect(slugs('f', 1)).toEqual(['food-pantry']);
    });
});

describe('closestWords', () => {
    const words = [
        { slug: 'mutual-aid', word: 'Mutual Aid' },
        { slug: 'mutual-aid-network', word: 'Mutual Aid Network' },
        { slug: 'solidarity', word: 'Solidarity' },
        { slug: 'repair-cafe', word: 'Repair Café' },
        { slug: 'free-fridge', word: 'Free Fridge' },
    ];
    const slugs = (address: string, limit?: number) =>
        closestWords(words, address, limit).map((w) => w.slug);

    it('finds words the address starts or is part of', () => {
        expect(slugs('mutual')).toEqual(['mutual-aid', 'mutual-aid-network']);
        expect(slugs('fridge')).toEqual(['free-fridge']);
    });

    it('finds close spellings, ignoring accents', () => {
        expect(slugs('mutal-aid')).toContain('mutual-aid');
        expect(slugs('solidarty')).toEqual(['solidarity']);
        expect(slugs('repair-cafe')).toEqual(['repair-cafe']);
    });

    it('suggests nothing for unrelated addresses', () => {
        expect(slugs('unknown')).toEqual([]);
        expect(slugs('')).toEqual([]);
    });

    it('keeps to the limit', () => {
        expect(slugs('mutual', 1)).toEqual(['mutual-aid']);
    });

    it('counts single-letter edits', () => {
        expect(editDistance('kitten', 'sitting')).toBe(3);
        expect(editDistance('same', 'same')).toBe(0);
        expect(editDistance('', 'abc')).toBe(3);
    });
});
