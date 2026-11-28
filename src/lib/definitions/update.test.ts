import { describe, expect, it } from 'vitest';

import { toCsv } from '@/lib/csv';

import { DEFINITION_CSV_COLUMNS } from './import';
import { readDefinition } from './index';
import { checkDefinitionUpdate, readDefinitionUpdateFile } from './update';

type Row = Partial<Record<(typeof DEFINITION_CSV_COLUMNS)[number], string>>;

const row = (extra: Row = {}): Row => ({
    slug: 'mutual-aid-network',
    en_word: 'Mutual Aid Network',
    en_definition: 'Neighbors who organize to meet each other’s needs.',
    en_details: 'First paragraph.\n\nSecond paragraph.',
    es_word: 'Red de ayuda mutua',
    es_definition: 'Vecinos que se organizan.',
    vi_word: 'Mạng lưới tương trợ',
    vi_definition: 'Hàng xóm cùng tổ chức.',
    zh_word: '互助网络',
    zh_definition: '邻居组织起来。',
    ...extra,
});

const file = (
    rows: Row[],
    columns: readonly string[] = DEFINITION_CSV_COLUMNS
) =>
    toCsv(
        columns,
        rows.map((r) => columns.map((c) => r[c as keyof Row] ?? ''))
    );

const stored = (extra: Row = {}) => {
    const r = row(extra);
    return readDefinition('mutual-aid-network', {
        text: Object.fromEntries(
            (['en', 'es', 'vi', 'zh'] as const).map((l) => [
                l,
                {
                    word: r[`${l}_word`],
                    definition: r[`${l}_definition`],
                    details: r[`${l}_details`] ?? '',
                },
            ])
        ),
        related: ['mutual-aid', 'solidarity'],
    });
};

const readOne = (text: string) => {
    const read = readDefinitionUpdateFile(text);
    if (!read.ok) throw new Error(read.problem);
    return read.row;
};

describe('readDefinitionUpdateFile', () => {
    it('reads the one row and its slug', () => {
        const read = readDefinitionUpdateFile(file([row()]));
        expect(read).toMatchObject({ ok: true, slug: 'mutual-aid-network' });
    });

    it('accepts a file without the related column', () => {
        const columns = DEFINITION_CSV_COLUMNS.filter((c) => c !== 'related');
        expect(readDefinitionUpdateFile(file([row()], columns)).ok).toBe(true);
    });

    it('refuses more than one row', () => {
        expect(readDefinitionUpdateFile(file([row(), row()]))).toEqual({
            ok: false,
            problem: 'notOneRow',
        });
    });

    it('refuses a file with no rows or missing columns', () => {
        expect(readDefinitionUpdateFile(file([]))).toMatchObject({
            problem: 'empty',
        });
        expect(
            readDefinitionUpdateFile(file([row()], ['slug', 'en_word']))
        ).toMatchObject({ problem: 'missingColumns' });
    });
});

describe('checkDefinitionUpdate', () => {
    it('lists each changed field with its text now and after', () => {
        const checked = checkDefinitionUpdate(
            readOne(file([row({ es_definition: 'Nuevo texto.' })])),
            stored()
        );
        expect(checked.status).toBe('ready');
        expect(checked.changes).toEqual([
            {
                field: 'es.definition',
                before: 'Vecinos que se organizan.',
                after: 'Nuevo texto.',
            },
        ]);
        expect(checked.text?.es.definition).toBe('Nuevo texto.');
    });

    it('never changes related words, and says when the file has some', () => {
        const checked = checkDefinitionUpdate(
            readOne(file([row({ related: 'charity;federation' })])),
            stored({ en_word: 'Old' })
        );
        expect(checked.status).toBe('ready');
        expect(checked.relatedIgnored).toBe(true);
        expect(checked.changes.map((c) => c.field)).toEqual(['en.word']);
        expect(checked).not.toHaveProperty('related');
    });

    it('ignores spaces the form would trim', () => {
        const checked = checkDefinitionUpdate(
            readOne(file([row({ en_word: '  Mutual Aid Network ' })])),
            stored()
        );
        expect(checked.status).toBe('unchanged');
    });

    it('keeps paragraph breaks and reads CRLF the same', () => {
        const checked = checkDefinitionUpdate(
            readOne(
                file([
                    row({
                        en_details: 'First paragraph.\r\n\r\nSecond paragraph.',
                    }),
                ])
            ),
            stored()
        );
        expect(checked.status).toBe('unchanged');
    });

    it('is notFound for a word that isn’t in the dictionary', () => {
        const checked = checkDefinitionUpdate(readOne(file([row()])), null);
        expect(checked.status).toBe('notFound');
        expect(checked.word).toBe('Mutual Aid Network');
    });

    it('lists problems with the form’s rules', () => {
        const checked = checkDefinitionUpdate(
            readOne(
                file([row({ vi_word: '', zh_definition: 'x'.repeat(301) })])
            ),
            stored()
        );
        expect(checked.status).toBe('problems');
        expect(checked.problems).toEqual([
            { field: 'vi.word', key: 'wordRequired' },
            { field: 'zh.definition', key: 'definitionTooLong' },
        ]);
    });

    it('reports a bad slug as a problem, not as a missing word', () => {
        const checked = checkDefinitionUpdate(
            readOne(file([row({ slug: 'Not A Slug' })])),
            null
        );
        expect(checked.status).toBe('problems');
        expect(checked.problems[0]).toEqual({
            field: 'slug',
            key: 'slugFormat',
        });
    });

    it('names the word as stored', () => {
        const checked = checkDefinitionUpdate(
            readOne(file([row({ en_word: 'New Name' })])),
            stored()
        );
        expect(checked.word).toBe('Mutual Aid Network');
    });
});
