// Says which candidates are already known, before any time goes into
// researching them: already on Communalists (the super-user export), already
// in an earlier research file, or already looked at and rejected.
//   pnpm exec tsx .claude/skills/find-organizations/known.ts research/organizations/san-jose/candidates.csv
//   pnpm exec tsx .claude/skills/find-organizations/known.ts --name "Food Not Bombs San Jose" --website fnbsj.org
// Candidates are a CSV with a `name` column, and optionally `website`,
// `socials` (platform:username;…) and `phone`. Known organizations are read
// from every CSV under research/organizations/ (only the newest
// communalists-organizations-*.csv export, and never candidates*.csv), plus
// any files passed with --known. Matching: src/lib/organizations/existing.ts.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';

import {
    findKnown,
    readKnownFile,
    type Candidate,
    type KnownMatch,
} from '@/lib/organizations/existing';

const RESEARCH_DIR = 'research/organizations';
const EXPORT_PATTERN = /^communalists-organizations-.*\.csv$/;
const STALE_DAYS = 7;

const args = process.argv.slice(2);
const option = (flag: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args.splice(i, 2)[1] : undefined;
};
const extraKnown: string[] = [];
for (let f = option('--known'); f; f = option('--known')) extraKnown.push(f);
const single: Candidate | undefined = args.includes('--name')
    ? {
          name: option('--name') ?? '',
          website: option('--website'),
          socials: option('--socials'),
          phone: option('--phone'),
      }
    : undefined;
const candidatesFile = single ? undefined : args[0];
if (!single && !candidatesFile) {
    console.error(
        'Usage: known.ts <candidates.csv> [--known file.csv]…\n' +
            '   or: known.ts --name "…" [--website …] [--socials platform:user;…] [--phone …]'
    );
    process.exit(1);
}

function csvFiles(dir: string): string[] {
    let entries: string[];
    try {
        entries = readdirSync(dir);
    } catch {
        return [];
    }
    return entries.flatMap((entry) => {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) return csvFiles(path);
        return entry.endsWith('.csv') ? [path] : [];
    });
}

const all = csvFiles(RESEARCH_DIR);
const exports = all
    .filter((f) => EXPORT_PATTERN.test(basename(f)))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
const newestExport = exports[0];
const inputPath = candidatesFile ? resolve(candidatesFile) : '';
const knownFiles = [
    ...(newestExport ? [newestExport] : []),
    ...all.filter(
        (f) =>
            !EXPORT_PATTERN.test(basename(f)) &&
            !basename(f).startsWith('candidates') &&
            resolve(f) !== inputPath
    ),
    ...extraKnown,
];

if (!newestExport) {
    console.log(
        `WARNING: no export of the organizations on Communalists in ${RESEARCH_DIR}/.\n` +
            'Ask a super user to download it from /admin/import ("Download organizations already on Communalists") and save it there.\n'
    );
} else {
    const days = (Date.now() - statSync(newestExport).mtimeMs) / 86_400_000;
    if (days > STALE_DAYS)
        console.log(
            `WARNING: the export ${basename(newestExport)} is ${Math.floor(days)} days old. Ask for a fresh one.\n`
        );
}

const known = knownFiles.flatMap((f) =>
    readKnownFile(readFileSync(f, 'utf8'), relative('.', f))
);

const candidates: Candidate[] = single
    ? [single]
    : readKnownFile(readFileSync(candidatesFile!, 'utf8'), candidatesFile!);

const describe = ({ reason, known: k }: KnownMatch) => {
    const what = {
        website: 'same website',
        social: 'same social account',
        name: 'same name',
        phone: 'same phone',
        similarName: 'similar name',
    }[reason];
    const status = [
        k.status === 'archived'
            ? 'ARCHIVED (deleted, or taken down at the group’s request): do not re-add; tell the super user'
            : k.status,
        k.claimStatus,
        k.placeLabel,
        k.reason && `rejected: ${k.reason}`,
    ]
        .filter(Boolean)
        .join(', ');
    return `    ${what}: "${k.name}"${k.handle ? ` (/organization/${k.handle})` : ''} in ${k.source}:${k.line}${status ? ` [${status}]` : ''}`;
};

let fresh = 0;
for (const c of candidates) {
    const matches = findKnown(c, known);
    const sure = matches.filter((m) => m.reason !== 'similarName');
    if (matches.length === 0) {
        fresh += 1;
        console.log(`NEW    ${c.name}`);
    } else {
        console.log(`${sure.length ? 'KNOWN ' : 'MAYBE '} ${c.name}`);
        for (const m of matches.slice(0, 3)) console.log(describe(m));
    }
}
console.log(
    `\n${fresh} new, ${candidates.length - fresh} known or maybe, of ${candidates.length}. Checked against ${known.length} known organizations in ${knownFiles.length} files.`
);
