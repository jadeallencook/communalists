// Runs the import's own row checks on a CSV, offline, before a super user
// uploads it to /admin/import: the same code (src/lib/organizations/import.ts)
// and the same English messages the review page shows.
//   pnpm exec tsx --conditions=react-server .claude/skills/find-organizations/check.ts research/organizations/san-jose/organizations.csv
// Exits 1 when any row has a problem. Only the database checks are left for
// Review file: a handle already taken, and the same name or website as an
// organization on Communalists (known.ts catches most of those earlier).

import { readFileSync } from 'node:fs';

import { checkImportFile } from '@/lib/organizations/import';
import { getPlace } from '@/lib/places';
import { isSupportedCountry } from '@/lib/places/types';

import en from '../../../messages/en.json';

const file = process.argv[2];
if (!file) {
    console.error('Usage: check.ts <organizations.csv>');
    process.exit(1);
}

const t = en.Admin.import;
const fill = (message: string, values: Record<string, unknown>) =>
    message.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));

const result = checkImportFile(readFileSync(file, 'utf8'), (country, id) =>
    isSupportedCountry(country) ? (getPlace(country, id) ?? null) : null
);
if (!result.ok) {
    console.log(
        `FILE  ${fill(t.fileErrors[result.problem], { columns: result.columns?.join(', ') })}`
    );
    process.exit(1);
}
if (result.ignoredColumns.length)
    console.log(
        `Ignored columns (not imported): ${result.ignoredColumns.join(', ')}\n`
    );

let withProblems = 0;
for (const row of result.rows) {
    if (row.problems.length === 0) {
        console.log(
            `OK    line ${row.line}  ${row.name}  (/org/${row.handle})`
        );
        continue;
    }
    withProblems += 1;
    console.log(`FIX   line ${row.line}  ${row.name || t.noName}`);
    for (const p of row.problems) {
        const values = { otherLine: p.otherLine };
        const column = t.columns[p.column as keyof typeof t.columns];
        const problem = fill(t.problems[p.key], values);
        const fix = t.fixes[p.key as keyof typeof t.fixes];
        console.log(
            `      ${p.column} (${column}): ${problem}` +
                (p.value ? `\n        file says: ${p.value}` : '') +
                (fix ? `\n        fix: ${fill(fix, values)}` : '')
        );
    }
}
console.log(
    `\n${result.rows.length - withProblems} ready, ${withProblems} to fix, of ${result.rows.length} rows.` +
        ' Not checked here: handles already taken, and the same name or website as an organization on Communalists (Review file checks those).'
);
process.exit(withProblems ? 1 : 0);
