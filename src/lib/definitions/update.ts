// Replacing one word's text from a file (/admin/definitions/upload). Pure:
// reading the file and comparing it with the word as stored. The database
// part is updateDefinitionText in ./store.ts. The file has the import's
// columns and one row; related words are never changed by it. Design:
// documentation/features/19-dictionary.md → "Updating a word from a file".

import {
    definitionInputSchema,
    DEFINITION_LOCALES,
    fieldForIssue,
    type Definition,
    type DefinitionEntry,
    type DefinitionErrorKey,
    type DefinitionField,
    type DefinitionInput,
    type DefinitionLocale,
} from './index';
import {
    definitionFromCsv,
    readDefinitionsFile,
    type DefinitionCsvRow,
    type DefinitionsFileProblem,
} from './import';

export type DefinitionUpdateFileProblem =
    | Exclude<DefinitionsFileProblem, 'tooManyRows'>
    /** More than one word in the file. */
    | 'notOneRow';

/** The file's one row, or why it can't be read. */
export function readDefinitionUpdateFile(text: string):
    | {
          ok: true;
          row: DefinitionCsvRow;
          slug: string;
          ignoredColumns: string[];
      }
    | { ok: false; problem: DefinitionUpdateFileProblem; columns?: string[] } {
    const read = readDefinitionsFile(text);
    if (!read.ok)
        return read.problem === 'tooManyRows'
            ? { ok: false, problem: 'notOneRow' }
            : { ok: false, problem: read.problem, columns: read.columns };
    if (read.rows.length !== 1) return { ok: false, problem: 'notOneRow' };
    const [row] = read.rows;
    return {
        ok: true,
        row,
        slug: definitionFromCsv(row.values).slug,
        ignoredColumns: read.ignoredColumns,
    };
}

type TextField = `${DefinitionLocale}.${keyof DefinitionEntry}`;

/** One field the upload changes, with its text now and after. */
export interface DefinitionChange {
    field: TextField;
    before: string;
    after: string;
}

/**
 * `ready`: changes to save. `unchanged`: the file matches the word.
 * `notFound`: no word has that slug (add it with the import instead).
 * `problems`: the file breaks the form's rules.
 */
export type DefinitionUpdateStatus =
    'ready' | 'unchanged' | 'notFound' | 'problems';

export interface CheckedDefinitionUpdate {
    slug: string;
    /** The English word as stored, else the file's, else the slug. */
    word: string;
    status: DefinitionUpdateStatus;
    problems: { field: DefinitionField; key: DefinitionErrorKey }[];
    changes: DefinitionChange[];
    /** The file has related words; they're left out. */
    relatedIgnored: boolean;
    /** Set only when ready. */
    text?: DefinitionInput['text'];
}

/**
 * Checks the row against the form's schema and compares it with the word as
 * stored (`current`, read fresh; null when there's no such word). Only the
 * text is compared and kept: related words stay as they are.
 */
export function checkDefinitionUpdate(
    row: DefinitionCsvRow,
    current: Definition | null
): CheckedDefinitionUpdate {
    const raw = definitionFromCsv(row.values);
    const parsed = definitionInputSchema.safeParse({ ...raw, related: [] });
    const problems: CheckedDefinitionUpdate['problems'] = [];
    if (!parsed.success)
        for (const issue of parsed.error.issues) {
            const field = fieldForIssue(issue.path);
            if (!problems.some((p) => p.field === field))
                problems.push({
                    field,
                    key: issue.message as DefinitionErrorKey,
                });
        }
    const base = {
        slug: raw.slug,
        word:
            current?.text.en.word.trim() || raw.text.en.word.trim() || raw.slug,
        problems,
        changes: [] as DefinitionChange[],
        relatedIgnored: raw.related.length > 0,
    };
    const slugBad = problems.some((p) => p.field === 'slug');
    if (!slugBad && !current) return { ...base, status: 'notFound' };
    if (!parsed.success || !current) return { ...base, status: 'problems' };

    const text = parsed.data.text;
    const changes: DefinitionChange[] = [];
    for (const locale of DEFINITION_LOCALES)
        for (const key of ['word', 'definition', 'details'] as const)
            if (current.text[locale][key] !== text[locale][key])
                changes.push({
                    field: `${locale}.${key}`,
                    before: current.text[locale][key],
                    after: text[locale][key],
                });
    return changes.length
        ? { ...base, changes, status: 'ready', text }
        : { ...base, status: 'unchanged' };
}
