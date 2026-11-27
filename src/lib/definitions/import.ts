// Adding dictionary words from a CSV (/admin/definitions/import). Pure: reading
// the file and checking each row. The database part is importDefinitions in
// ./store.ts. Design: documentation/features/19-dictionary.md → "Importing
// from a CSV".

import { parseCsv, toCsv } from '@/lib/csv';

import {
    definitionInputSchema,
    DEFINITION_LOCALES,
    fieldForIssue,
    type DefinitionEntry,
    type DefinitionErrorKey,
    type DefinitionField,
    type DefinitionInput,
} from './index';

const ENTRY_KEYS = ['word', 'definition', 'details'] as const;

/** Columns, in the template's order. `related` lists slugs separated by `;`. */
export const DEFINITION_CSV_COLUMNS = [
    'slug',
    'related',
    ...DEFINITION_LOCALES.flatMap((locale) =>
        ENTRY_KEYS.map((key) => `${locale}_${key}`)
    ),
] as const;

/** A file without these can't be checked: `related` and the details are optional. */
export const REQUIRED_DEFINITION_COLUMNS: readonly string[] =
    DEFINITION_CSV_COLUMNS.filter(
        (c) => c !== 'related' && !c.endsWith('_details')
    );

/** A person reviews every row. */
export const DEFINITIONS_IMPORT_MAX_ROWS = 200;
/** Well under the server action body limit (1 MB). */
export const DEFINITIONS_IMPORT_MAX_BYTES = 500_000;

export type DefinitionsFileProblem =
    'empty' | 'tooBig' | 'tooManyRows' | 'missingColumns';

export interface DefinitionCsvRow {
    /** The row's line in the file (the header is line 1). */
    line: number;
    values: Record<string, string>;
}

/** Splits the file into rows keyed by column. Unknown columns are reported, not read. */
export function readDefinitionsFile(
    text: string
):
    | { ok: true; rows: DefinitionCsvRow[]; ignoredColumns: string[] }
    | { ok: false; problem: DefinitionsFileProblem; columns?: string[] } {
    if (text.length > DEFINITIONS_IMPORT_MAX_BYTES)
        return { ok: false, problem: 'tooBig' };
    const [header, ...body] = parseCsv(text);
    if (!header || body.length === 0) return { ok: false, problem: 'empty' };
    if (body.length > DEFINITIONS_IMPORT_MAX_ROWS)
        return { ok: false, problem: 'tooManyRows' };
    const names = header.map((h) => h.trim());
    const missing = REQUIRED_DEFINITION_COLUMNS.filter(
        (c) => !names.includes(c)
    );
    if (missing.length > 0)
        return { ok: false, problem: 'missingColumns', columns: missing };
    const known = new Set<string>(DEFINITION_CSV_COLUMNS);
    const rows = body.map((cells, i) => {
        const values: Record<string, string> = {};
        names.forEach((name, j) => {
            if (known.has(name)) values[name] = cells[j] ?? '';
        });
        return { line: i + 2, values };
    });
    return {
        ok: true,
        rows,
        ignoredColumns: names.filter((n) => !known.has(n)),
    };
}

/** A row's cells in the form's shape, for the shared schema. */
export function definitionFromCsv(values: Record<string, string>) {
    const text = {} as Record<
        (typeof DEFINITION_LOCALES)[number],
        DefinitionEntry
    >;
    for (const locale of DEFINITION_LOCALES)
        text[locale] = {
            word: values[`${locale}_word`] ?? '',
            definition: values[`${locale}_definition`] ?? '',
            details: (values[`${locale}_details`] ?? '').replace(/\r\n/g, '\n'),
        };
    return {
        slug: (values.slug ?? '').trim().toLowerCase(),
        text,
        related: (values.related ?? '')
            .split(';')
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean),
    };
}

/** The column a form field comes from: `es.word` → `es_word`. */
export const columnOf = (field: DefinitionField) => field.replace('.', '_');

export type DefinitionImportProblemKey =
    | DefinitionErrorKey
    /** The same slug on an earlier row. */
    | 'slugRepeated'
    /** A related slug that's neither in the dictionary nor in the file. */
    | 'relatedUnknown';

export interface DefinitionImportProblem {
    field: DefinitionField;
    key: DefinitionImportProblemKey;
    /** What the file says, for slugs (the unknown related ones only). */
    value?: string;
}

/** `exists`: already in the dictionary, so it's skipped (never overwritten). */
export type DefinitionImportStatus = 'ready' | 'exists' | 'problems';

export interface CheckedDefinitionRow {
    line: number;
    slug: string;
    /** The English word, or the slug when there isn't one. */
    word: string;
    status: DefinitionImportStatus;
    problems: DefinitionImportProblem[];
    /** Set only when the row is ready. */
    input?: DefinitionInput;
}

/**
 * Checks every row against the shared schema, the other rows (repeated
 * slugs) and the dictionary (`existing` slugs, read fresh). A related slug
 * must be a word already, or in the file.
 */
export function checkDefinitionRows(
    rows: readonly DefinitionCsvRow[],
    existing: ReadonlySet<string>
): CheckedDefinitionRow[] {
    const values = rows.map((row) => definitionFromCsv(row.values));
    const known = new Set([...existing, ...values.map((v) => v.slug)]);
    const seen = new Set<string>();
    return rows.map((row, i) => {
        const raw = values[i];
        const problems: DefinitionImportProblem[] = [];
        const parsed = definitionInputSchema.safeParse(raw);
        if (!parsed.success)
            for (const issue of parsed.error.issues) {
                const field = fieldForIssue(issue.path);
                if (!problems.some((p) => p.field === field))
                    problems.push({
                        field,
                        key: issue.message as DefinitionErrorKey,
                    });
            }
        if (raw.slug && seen.has(raw.slug))
            problems.push({ field: 'slug', key: 'slugRepeated' });
        seen.add(raw.slug);
        const unknown = raw.related.filter((s) => !known.has(s));
        if (unknown.length && !problems.some((p) => p.field === 'related'))
            problems.push({
                field: 'related',
                key: 'relatedUnknown',
                value: unknown.join(';'),
            });

        const word = raw.text.en.word.trim() || raw.slug;
        const base = { line: row.line, slug: raw.slug, word, problems };
        if (existing.has(raw.slug)) return { ...base, status: 'exists' };
        if (problems.length || !parsed.success)
            return { ...base, status: 'problems' };
        return { ...base, status: 'ready', input: parsed.data };
    });
}

/** The header-only template, for the "Download the template" link. */
export function definitionsTemplateCsv(): string {
    return toCsv(DEFINITION_CSV_COLUMNS, []);
}
