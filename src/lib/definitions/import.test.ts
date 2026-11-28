import { describe, expect, it } from 'vitest';

import { toCsv } from '@/lib/csv';

import {
    checkDefinitionRows,
    columnOf,
    DEFINITION_CSV_COLUMNS,
    DEFINITIONS_IMPORT_MAX_ROWS,
    definitionFromCsv,
    definitionsTemplateCsv,
    readDefinitionsFile,
} from './import';

type Row = Partial<Record<(typeof DEFINITION_CSV_COLUMNS)[number], string>>;

const word = (slug: string, en: string, extra: Row = {}): Row => ({
    slug,
    en_word: en,
    en_definition: `${en} means something.`,
    es_word: `${en} (es)`,
    es_definition: 'Algo.',
    vi_word: `${en} (vi)`,
    vi_definition: 'Một điều.',
    zh_word: `${en} (zh)`,
    zh_definition: '某事。',
    ...extra,
});

const file = (rows: Row[], columns = DEFINITION_CSV_COLUMNS) =>
    toCsv(
        columns,
        rows.map((row) => columns.map((c) => row[c as keyof Row] ?? ''))
    );

const read = (text: string) => {
    const result = readDefinitionsFile(text);
    if (!result.ok) throw new Error(result.problem);
    return result.rows;
};

describe('readDefinitionsFile', () => {
    it('reads rows by column, numbering lines after the header', () => {
        const rows = read(file([word('mutual-aid', 'Mutual aid')]));
        expect(rows).toHaveLength(1);
        expect(rows[0].line).toBe(2);
        expect(rows[0].values.en_word).toBe('Mutual aid');
    });

    it('refuses an empty file, too many rows, or missing columns', () => {
        expect(readDefinitionsFile('')).toMatchObject({ problem: 'empty' });
        expect(readDefinitionsFile(definitionsTemplateCsv())).toMatchObject({
            problem: 'empty',
        });
        const many = Array.from(
            { length: DEFINITIONS_IMPORT_MAX_ROWS + 1 },
            (_, i) => word(`word-${i}`, 'W')
        );
        expect(readDefinitionsFile(file(many))).toMatchObject({
            problem: 'tooManyRows',
        });
        expect(
            readDefinitionsFile('slug,en_word,en_definition\nx,X,Y')
        ).toMatchObject({
            problem: 'missingColumns',
            columns: expect.arrayContaining(['es_word', 'zh_definition']),
        });
        expect(readDefinitionsFile('x'.repeat(500_001))).toMatchObject({
            problem: 'tooBig',
        });
    });

    it('allows leaving out the optional columns, and reports unknown ones', () => {
        const columns = [
            ...DEFINITION_CSV_COLUMNS.filter(
                (c) => !c.endsWith('_details') && c !== 'related'
            ),
            'notes',
        ] as unknown as typeof DEFINITION_CSV_COLUMNS;
        const result = readDefinitionsFile(file([word('a-b', 'AB')], columns));
        expect(result).toMatchObject({ ok: true, ignoredColumns: ['notes'] });
    });
});

describe('definitionFromCsv', () => {
    it('lowercases slugs and splits related on semicolons', () => {
        const value = definitionFromCsv({
            ...word('Mutual-Aid', 'Mutual aid'),
            related: ' Solidarity ; organizer;; ',
            en_details: 'One.\r\n\r\nTwo.',
        });
        expect(value.slug).toBe('mutual-aid');
        expect(value.related).toEqual(['solidarity', 'organizer']);
        expect(value.text.en.details).toBe('One.\n\nTwo.');
    });
});

describe('checkDefinitionRows', () => {
    it('marks rows ready, already there, or with problems', () => {
        const rows = read(
            file([
                word('mutual-aid', 'Mutual aid', { related: 'solidarity' }),
                word('solidarity', 'Solidarity', { related: 'organizer' }),
                word('free-fridge', 'Free fridge', { vi_word: '' }),
            ])
        );
        const checked = checkDefinitionRows(
            rows,
            new Set(['solidarity', 'organizer'])
        );
        expect(checked.map((r) => [r.slug, r.status])).toEqual([
            ['mutual-aid', 'ready'],
            ['solidarity', 'exists'],
            ['free-fridge', 'problems'],
        ]);
        expect(checked[0].input?.related).toEqual(['solidarity']);
        expect(checked[1].input).toBeUndefined();
        expect(checked[2].problems).toEqual([
            { field: 'vi.word', key: 'wordRequired' },
        ]);
        expect(columnOf('vi.word')).toBe('vi_word');
    });

    it('lets related words point to other rows in the file', () => {
        const rows = read(
            file([
                word('mutual-aid', 'Mutual aid', { related: 'tenant-union' }),
                word('tenant-union', 'Tenant union'),
            ])
        );
        expect(
            checkDefinitionRows(rows, new Set()).map((r) => r.status)
        ).toEqual(['ready', 'ready']);
    });

    it('names related words that are nowhere', () => {
        const rows = read(
            file([word('mutual-aid', 'Mutual aid', { related: 'nope;gone' })])
        );
        expect(checkDefinitionRows(rows, new Set())[0]).toMatchObject({
            status: 'problems',
            problems: [
                { field: 'related', key: 'relatedUnknown', value: 'nope;gone' },
            ],
        });
    });

    it('flags a repeated slug on the later row only', () => {
        const rows = read(
            file([
                word('mutual-aid', 'Mutual aid'),
                word('mutual-aid', 'Again'),
            ])
        );
        const checked = checkDefinitionRows(rows, new Set());
        expect(checked[0].status).toBe('ready');
        expect(checked[1].problems).toEqual([
            { field: 'slug', key: 'slugRepeated' },
        ]);
    });

    it('reports a bad slug once, and uses it as the word when English is blank', () => {
        const rows = read(file([word('Bad Slug!', '', { en_definition: '' })]));
        const [row] = checkDefinitionRows(rows, new Set());
        expect(row.word).toBe('bad slug!');
        expect(row.problems.map((p) => [p.field, p.key])).toEqual([
            ['slug', 'slugFormat'],
            ['en.word', 'wordRequired'],
            ['en.definition', 'definitionRequired'],
        ]);
    });
});

describe('definitionsTemplateCsv', () => {
    it('is the header row only', () => {
        expect(definitionsTemplateCsv()).toBe(
            `${DEFINITION_CSV_COLUMNS.join(',')}\n`
        );
    });
});
