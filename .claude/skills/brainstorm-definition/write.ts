// Writes an agreed definition to research/definitions/updates/{slug}.csv, the
// one-word file /admin/definitions/upload takes. Checks it with the app's own
// rules first (the form's schema), then reads the written file back the way
// the upload does, so a file this writes is one the upload accepts.
//
//   pnpm exec tsx .claude/skills/brainstorm-definition/write.ts draft.json
//
// draft.json: { "slug": "...", "text": { "en": { "word", "definition",
// "details" }, "es": {…}, "vi": {…}, "zh": {…} } }. Related words aren't
// written: the upload never changes them.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { toCsv } from '../../../src/lib/csv';
import {
    DEFINITION_LOCALES,
    definitionInputSchema,
    fieldForIssue,
    limitFor,
} from '../../../src/lib/definitions/index';
import { DEFINITION_CSV_COLUMNS } from '../../../src/lib/definitions/import';
import {
    checkDefinitionUpdate,
    readDefinitionUpdateFile,
} from '../../../src/lib/definitions/update';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const draftPath = process.argv[2];
if (!draftPath) {
    console.error('Usage: write.ts draft.json');
    process.exit(1);
}

const draft = JSON.parse(readFileSync(draftPath, 'utf8'));
const parsed = definitionInputSchema.safeParse({ ...draft, related: [] });
if (!parsed.success) {
    console.error('Not written. Fix these first:');
    for (const issue of parsed.error.issues) {
        const field = fieldForIssue(issue.path);
        console.error(
            `  ${field}: ${issue.message} (limit ${limitFor(field)})`
        );
    }
    process.exit(1);
}
const { slug, text } = parsed.data;

const columns = DEFINITION_CSV_COLUMNS.filter((c) => c !== 'related');
const cell = (column: string) => {
    if (column === 'slug') return slug;
    const [locale, key] = column.split('_') as [
        (typeof DEFINITION_LOCALES)[number],
        'word' | 'definition' | 'details',
    ];
    return text[locale][key];
};
const csv = toCsv(columns, [columns.map(cell)]);

// Read it back as the upload will. Against no stored word it can only be
// notFound; anything else means the file wouldn't be accepted.
const read = readDefinitionUpdateFile(csv);
if (!read.ok || checkDefinitionUpdate(read.row, null).status !== 'notFound') {
    console.error('Not written: the upload would not read this file back.');
    process.exit(1);
}

const out = join(root, 'research/definitions/updates', `${slug}.csv`);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, csv);
console.log(`Wrote ${relative(root, out)}`);
for (const locale of DEFINITION_LOCALES) {
    const entry = text[locale];
    console.log(
        `  ${locale}: word ${entry.word.length}/${limitFor(`${locale}.word`)}, definition ${entry.definition.length}/${limitFor(`${locale}.definition`)}, details ${entry.details.length}/${limitFor(`${locale}.details`)}`
    );
}
