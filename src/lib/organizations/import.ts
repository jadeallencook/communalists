import { phoneForDisplay, normalizePhone } from '@/lib/phone';
import { parseCsv, toCsv as toCsvText } from '@/lib/csv';
import {
    isSocialPlatform,
    parseSocialHandle,
    type SocialLink,
} from '@/lib/socials';
import {
    organizationSchema,
    type OrganizationErrorKey,
    type OrganizationInput,
} from '@/lib/validation/organization';

import { suggestHandle } from './handle';
import {
    normalizeWebUrl,
    OFFERED_FOCUS_AREAS,
    ORG_LANGUAGES,
    RADIUS_MILES,
    REACH_SCOPES,
    type FocusArea,
    type ReachScope,
} from './options';

// Bulk import of unclaimed organizations from a CSV (features/18, decisions
// #40 and #41). Pure: parsing, per-row checks, previews and CSV export. The
// database checks (handle taken, already listed) are in ./import-store.ts;
// the page is /admin/import. The CSV format is described for researchers in
// .claude/skills/prepare-organizations-csv/SKILL.md; keep the two in step.

/** Columns read from the CSV, in the order the template lists them. */
export const IMPORT_COLUMNS = [
    'name',
    'handle',
    'focusAreas',
    'description',
    'foundedYear',
    'country',
    'placeId',
    'placeLabel',
    'streetAddress',
    'reach',
    'radiusMiles',
    'languages',
    'website',
    'contactEmail',
    'phone',
    'socials',
    'joinPolicy',
    'visibility',
    'memberListVisibility',
    // Research columns: shown to the reviewer, never stored.
    'verification',
    'notes',
    'sources',
] as const;
export type ImportColumn = (typeof IMPORT_COLUMNS)[number];
export type ImportValues = Partial<Record<ImportColumn, string>>;

/** A file without these can't be checked at all. */
export const REQUIRED_COLUMNS: readonly ImportColumn[] = [
    'name',
    'focusAreas',
    'placeId',
    'reach',
    'languages',
];

/** Kept small: each row is a transaction, and a person reviews every one. */
export const IMPORT_MAX_ROWS = 200;
/** Well under the server action body limit (1 MB). */
export const IMPORT_MAX_BYTES = 500_000;
/** Longest cell accepted from the browser (the longest field allows 2,000). */
export const IMPORT_MAX_CELL = 5_000;

/** What's wrong with one cell. Keys under Admin.import.problems. */
export type ImportProblemKey =
    | Exclude<
          OrganizationErrorKey,
          'ownedLimit' | 'handleCooldown' | 'notAllowed' | 'generic'
      >
    | 'invalid'
    | 'placeMismatch'
    | 'socialPlatform'
    | 'duplicateInFile'
    | 'sameName'
    | 'sameWebsite';

/** Problems only the database can find; an edit re-checks them for that row only. */
export const DATABASE_PROBLEMS: readonly ImportProblemKey[] = [
    'handleTaken',
    'sameName',
    'sameWebsite',
];

/** An organization already on Communalists that a row seems to repeat. */
export interface ImportMatch {
    name: string;
    handle: string;
    place: string;
    unclaimed: boolean;
}

export interface ImportProblem {
    column: ImportColumn;
    key: ImportProblemKey;
    /** What the file says in that column, so the reviewer sees what to fix. */
    value?: string;
    /** For sameName, sameWebsite and handleTaken: who already has it. */
    match?: ImportMatch;
    /** For duplicateInFile: the earlier row's line. */
    otherLine?: number;
}

export type ImportFileProblem =
    'empty' | 'tooBig' | 'tooManyRows' | 'missingColumns';

export interface ImportRow {
    /** The line in the file (the header is line 1). Also the row's id while reviewing. */
    line: number;
    values: ImportValues;
}

/** What the page shows for a row: its public profile, as far as it can be read. */
export interface ImportPreview {
    name: string;
    handle: string;
    focusAreas: FocusArea[];
    description: string;
    place: string;
    reach: { scope: ReachScope; radiusMiles?: number };
    languages: string[];
    streetAddress?: string;
    website?: string;
    contactEmail?: string;
    phone?: { text: string; href: string };
    foundedYear?: number;
    socials: SocialLink[];
}

export interface CheckedRow {
    line: number;
    name: string;
    handle: string;
    placeLabel: string;
    verification: string;
    notes: string;
    sources: string[];
    problems: ImportProblem[];
    preview: ImportPreview;
    /** Set only when the row passed every check. */
    input?: OrganizationInput;
}

/** The reviewed rows as a CSV in the import's own format (all columns, in order). */
export function toCsv(rows: ImportValues[]): string {
    return toCsvText(
        IMPORT_COLUMNS,
        rows.map((values) => IMPORT_COLUMNS.map((c) => values[c] ?? ''))
    );
}

/** Splits the file into rows keyed by column. Unknown columns are reported, not read. */
export function readImportFile(
    text: string
):
    | { ok: true; rows: ImportRow[]; ignoredColumns: string[] }
    | { ok: false; problem: ImportFileProblem; columns?: string[] } {
    if (text.length > IMPORT_MAX_BYTES) return { ok: false, problem: 'tooBig' };
    const [header, ...body] = parseCsv(text);
    if (!header || body.length === 0) return { ok: false, problem: 'empty' };
    if (body.length > IMPORT_MAX_ROWS)
        return { ok: false, problem: 'tooManyRows' };
    const names = header.map((h) => h.trim());
    const missing = REQUIRED_COLUMNS.filter((c) => !names.includes(c));
    if (missing.length > 0)
        return { ok: false, problem: 'missingColumns', columns: missing };
    const known = (name: string): name is ImportColumn =>
        (IMPORT_COLUMNS as readonly string[]).includes(name);
    // Line numbers count physical rows; good enough unless a cell holds a line break.
    const rows = body.map((cells, i) => {
        const values: ImportValues = {};
        names.forEach((name, j) => {
            if (known(name)) values[name] = (cells[j] ?? '').trim();
        });
        return { line: i + 2, values };
    });
    return { ok: true, rows, ignoredColumns: names.filter((n) => !known(n)) };
}

const list = (value = '') =>
    value
        .split(';')
        .map((v) => v.trim())
        .filter(Boolean);

/** "instagram:sbma;bluesky:sbma.bsky.social" → the form's social rows. */
function socialRows(value: string) {
    return list(value).map((entry) => {
        const at = entry.indexOf(':');
        return at < 0
            ? { platform: entry, handle: '' }
            : {
                  platform: entry.slice(0, at).trim(),
                  handle: entry.slice(at + 1).trim(),
              };
    });
}

/** Zod issue message → problem key; anything not one of ours is just "invalid". */
const PROBLEM_KEYS = new Set<string>([
    'required',
    'tooShort',
    'tooLong',
    'handleTooShort',
    'handleTooLong',
    'handleFormat',
    'handleReserved',
    'handleTaken',
    'focusAreasRequired',
    'focusAreasTooMany',
    'placeRequired',
    'placeNotFound',
    'radiusRequired',
    'languagesRequired',
    'invalidUrl',
    'invalidEmail',
    'invalidPhone',
    'invalidYear',
    'socialInvalid',
    'socialMismatch',
    'socialDuplicate',
]);
const problemKey = (message: string): ImportProblemKey =>
    PROBLEM_KEYS.has(message) ? (message as ImportProblemKey) : 'invalid';

/**
 * The cell to show beside a problem. For list columns, just the entries that
 * are wrong, so "food;mutualAid" points at "mutualAid".
 */
function offendingValue(column: ImportColumn, v: ImportValues): string {
    const cell = v[column] ?? '';
    const bad = (allowed: readonly string[]) =>
        list(cell)
            .filter((x) => !allowed.includes(x))
            .join(';');
    if (column === 'focusAreas') return bad(OFFERED_FOCUS_AREAS) || cell;
    if (column === 'languages') return bad(ORG_LANGUAGES) || cell;
    if (column === 'socials')
        return (
            socialRows(cell)
                .filter(
                    (s) =>
                        !isSocialPlatform(s.platform) ||
                        'problem' in parseSocialHandle(s.platform, s.handle)
                )
                .map((s) => `${s.platform}:${s.handle}`)
                .join(';') || cell
        );
    if (column === 'handle') return cell || suggestHandle(v.name ?? '');
    if (column === 'country') return cell || 'US';
    return cell;
}

/** As much of the public profile as the row's values allow, even with problems. */
export function previewOf(v: ImportValues, place: string): ImportPreview {
    const reach = (REACH_SCOPES as readonly string[]).includes(v.reach ?? '')
        ? (v.reach as ReachScope)
        : 'local';
    const radius = Number(v.radiusMiles);
    const phone = normalizePhone(v.phone ?? '', 'US');
    const year = Number(v.foundedYear);
    const socials = socialRows(v.socials ?? '').flatMap((s) => {
        if (!isSocialPlatform(s.platform)) return [];
        const parsed = parseSocialHandle(s.platform, s.handle);
        return 'handle' in parsed
            ? [{ platform: s.platform, handle: parsed.handle }]
            : [];
    });
    return {
        name: v.name ?? '',
        handle: v.handle || suggestHandle(v.name ?? ''),
        focusAreas: [
            ...new Set(
                list(v.focusAreas).filter((a): a is FocusArea =>
                    (OFFERED_FOCUS_AREAS as readonly string[]).includes(a)
                )
            ),
        ],
        description: v.description ?? '',
        place,
        reach:
            reach === 'local' && RADIUS_MILES.includes(radius as never)
                ? { scope: reach, radiusMiles: radius }
                : { scope: reach },
        languages: list(v.languages).filter((l) =>
            (ORG_LANGUAGES as readonly string[]).includes(l)
        ),
        streetAddress: v.streetAddress || undefined,
        website: normalizeWebUrl(v.website ?? '') ?? undefined,
        contactEmail: v.contactEmail || undefined,
        phone: phone ? (phoneForDisplay(phone) ?? undefined) : undefined,
        foundedYear: /^\d{4}$/.test(v.foundedYear ?? '') ? year : undefined,
        socials: socials.filter(
            (s, i) => socials.findIndex((o) => o.platform === s.platform) === i
        ),
    };
}

/**
 * One row through the same schema as the create form, with the import's
 * defaults: a handle from the name, US, listed, request to join, members-only
 * member list. `findPlace` looks up a GeoNames id (server-side data).
 */
export function checkImportRow(
    row: ImportRow,
    findPlace: (country: string, placeId: string) => { label: string } | null
): CheckedRow {
    const v = row.values;
    const name = v.name ?? '';
    const handle = v.handle || suggestHandle(name);
    const country = v.country || 'US';
    const problems: ImportProblem[] = [];
    const add = (column: ImportColumn, key: ImportProblemKey) => {
        if (problems.some((p) => p.column === column)) return;
        const value = offendingValue(column, v);
        problems.push(value ? { column, key, value } : { column, key });
    };

    const socials = socialRows(v.socials ?? '');
    const unknownPlatform = socials.some((s) => !isSocialPlatform(s.platform));
    if (unknownPlatform) add('socials', 'socialPlatform');

    const parsed = organizationSchema.safeParse({
        name,
        handle,
        focusAreas: list(v.focusAreas),
        description: v.description ?? '',
        foundedYear: v.foundedYear ?? '',
        country,
        placeId: v.placeId ?? '',
        streetAddress: v.streetAddress ?? '',
        reach: v.reach ?? '',
        radiusMiles: v.radiusMiles || undefined,
        languages: list(v.languages),
        website: v.website ?? '',
        contactEmail: v.contactEmail ?? '',
        phone: v.phone ?? '',
        socials: unknownPlatform ? [] : socials,
        joinPolicy: v.joinPolicy || 'request',
        visibility: v.visibility || 'listed',
        memberListVisibility: v.memberListVisibility || 'members',
    });
    if (!parsed.success) {
        for (const issue of parsed.error.issues) {
            // Schema fields and columns share names.
            add(
                String(issue.path[0] ?? 'name') as ImportColumn,
                problemKey(issue.message)
            );
        }
    }

    let placeLabel = v.placeLabel ?? '';
    if (
        !problems.some((p) => p.column === 'placeId' || p.column === 'country')
    ) {
        const place = findPlace(country, v.placeId ?? '');
        if (!place) add('placeId', 'placeNotFound');
        else {
            // A label that doesn't match means the id is probably the wrong city.
            if (placeLabel && !sameLabel(placeLabel, place.label))
                problems.push({
                    column: 'placeLabel',
                    key: 'placeMismatch',
                    value: `${placeLabel} → ${place.label}`,
                });
            placeLabel = place.label;
        }
    }

    return {
        line: row.line,
        name,
        handle,
        placeLabel,
        verification: v.verification ?? '',
        notes: v.notes ?? '',
        sources: list(v.sources).filter((s) => /^https?:\/\//i.test(s)),
        problems,
        preview: previewOf(v, placeLabel),
        input:
            problems.length === 0 && parsed.success ? parsed.data : undefined,
    };
}

/** "San Jose, CA" matches "San José, California"? Compare the city part only. */
function sameLabel(a: string, b: string) {
    const city = (s: string) =>
        s
            .split(',')[0]
            .normalize('NFKD')
            .replace(/[̀-ͯ]/g, '')
            .trim()
            .toLowerCase();
    return city(a) === city(b);
}

/** Two rows with the same handle or name: only the first is kept. */
export function markDuplicatesInFile(rows: CheckedRow[]): CheckedRow[] {
    const handles = new Map<string, number>();
    const names = new Map<string, number>();
    return rows.map((row) => {
        const name = row.name.trim().toLowerCase();
        const otherLine =
            (row.handle && handles.get(row.handle)) || names.get(name);
        if (row.handle && !handles.has(row.handle))
            handles.set(row.handle, row.line);
        if (!names.has(name)) names.set(name, row.line);
        return otherLine
            ? withProblem(row, {
                  column: 'name',
                  key: 'duplicateInFile',
                  value: row.name,
                  otherLine,
              })
            : row;
    });
}

/** Adds a problem; the row is no longer ready to import. */
export function withProblem(
    row: CheckedRow,
    problem: ImportProblem
): CheckedRow {
    return { ...row, problems: [...row.problems, problem], input: undefined };
}

type FindPlace = (country: string, placeId: string) => { label: string } | null;

/** Checks rows against each other and the rules, but not the database. */
export function checkImportRows(
    rows: ImportRow[],
    findPlace: FindPlace
): CheckedRow[] {
    return markDuplicatesInFile(
        rows.map((row) => checkImportRow(row, findPlace))
    );
}

/** Checks a whole file, except for what needs the database. */
export function checkImportFile(
    text: string,
    findPlace: FindPlace
):
    | { ok: true; rows: CheckedRow[]; ignoredColumns: string[] }
    | { ok: false; problem: ImportFileProblem; columns?: string[] } {
    const file = readImportFile(text);
    if (!file.ok) return file;
    return {
        ok: true,
        rows: checkImportRows(file.rows, findPlace),
        ignoredColumns: file.ignoredColumns,
    };
}

/**
 * Re-checked rows, keeping the earlier database problems for rows the
 * database wasn't asked about this time (only edited rows are).
 */
export function keepDatabaseProblems<
    T extends { line: number; problems: ImportProblem[] },
>(next: T[], previous: T[], checkedLines: ReadonlySet<number>): T[] {
    const before = new Map(previous.map((r) => [r.line, r]));
    return next.map((row) => {
        if (checkedLines.has(row.line)) return row;
        const kept = (before.get(row.line)?.problems ?? []).filter((p) =>
            DATABASE_PROBLEMS.includes(p.key)
        );
        return kept.length > 0
            ? { ...row, problems: [...row.problems, ...kept] }
            : row;
    });
}

/**
 * What the create form (used to edit a row) sent, as the row's CSV values.
 * The research columns are kept from the row as they were.
 */
export function valuesFromForm(
    form: {
        name: string;
        handle: string;
        focusAreas: string[];
        description: string;
        country: string;
        placeId: string;
        streetAddress: string;
        reach: string;
        radiusMiles: string;
        languages: string[];
        website: string;
        contactEmail: string;
        phone: string;
        foundedYear: string;
        socials: { platform: string; handle: string }[];
        joinPolicy: string;
        visibility: string;
        memberListVisibility: string;
    },
    placeLabel: string,
    before: ImportValues
): ImportValues {
    return {
        ...before,
        name: form.name.trim(),
        handle: form.handle.trim(),
        focusAreas: form.focusAreas.join(';'),
        description: form.description.trim(),
        foundedYear: form.foundedYear.trim(),
        country: form.country,
        placeId: form.placeId,
        placeLabel,
        streetAddress: form.streetAddress.trim(),
        reach: form.reach,
        radiusMiles: form.reach === 'local' ? form.radiusMiles : '',
        languages: form.languages.join(';'),
        website: form.website.trim(),
        contactEmail: form.contactEmail.trim(),
        phone: form.phone.trim(),
        socials: form.socials
            .map((s) => `${s.platform}:${s.handle.trim()}`)
            .join(';'),
        joinPolicy: form.joinPolicy,
        visibility: form.visibility,
        memberListVisibility: form.memberListVisibility,
    };
}

/** A row's values as the create form's starting values, for editing it. */
export function formValuesOf(v: ImportValues) {
    return {
        name: v.name ?? '',
        handle: v.handle || suggestHandle(v.name ?? ''),
        focusAreas: list(v.focusAreas),
        description: v.description ?? '',
        reach: v.reach || 'local',
        radiusMiles: v.radiusMiles ?? '',
        streetAddress: v.streetAddress ?? '',
        languages: list(v.languages),
        website: v.website ?? '',
        contactEmail: v.contactEmail ?? '',
        phone: v.phone ?? '',
        foundedYear: v.foundedYear ?? '',
        socials: socialRows(v.socials ?? ''),
        joinPolicy: v.joinPolicy || 'request',
        visibility: v.visibility || 'listed',
        memberListVisibility: v.memberListVisibility || 'members',
    };
}
