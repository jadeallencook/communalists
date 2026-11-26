import { normalizePhone } from '@/lib/phone';
import { socialLinksOf } from '@/lib/socials';

import { parseCsv } from './import';
import { normalizeWebUrl } from './options';

// The organizations already on Communalists, as a CSV a super user downloads
// from /admin/import (features/18, decision #43), and the matching that the
// find-organizations skill uses to skip groups that are already there (or
// already looked at) before researching them. Pure: no React, Next or
// Firebase. The export's reads are in ./export-store.ts.

/** Columns of the export, in order. Stable: the skill's scripts read them. */
export const EXISTING_COLUMNS = [
    'name',
    'handle',
    'status',
    'claimStatus',
    'visibility',
    'placeId',
    'placeLabel',
    'website',
    'phone',
    'contactEmail',
    'socials',
] as const;

export type ExistingColumn = (typeof EXISTING_COLUMNS)[number];
export type ExistingOrganization = Record<ExistingColumn, string>;

const text = (value: unknown) => (typeof value === 'string' ? value : '');

/** One organization document as an export row. Leaves out everything about people. */
export function existingFromDocument(
    data: Record<string, unknown>
): ExistingOrganization {
    const location = (data.location ?? {}) as Record<string, unknown>;
    return {
        name: text(data.name),
        handle: text(data.handle),
        status: text(data.status),
        claimStatus: data.claimStatus === 'unclaimed' ? 'unclaimed' : 'claimed',
        visibility: text(data.visibility),
        placeId: text(location.placeId),
        placeLabel: text(location.label),
        website: text(data.website),
        phone: text(data.phone),
        contactEmail: text(data.contactEmail),
        socials: socialLinksOf(data.socials)
            .map((s) => `${s.platform}:${s.handle}`)
            .join(';'),
    };
}

/**
 * A cell a spreadsheet won't run as a formula. Names are written by anyone
 * who creates an organization, and a super user may open this file in
 * Excel or Sheets. readKnownFile strips the added quote again.
 */
const safeCell = (value: string) => {
    const cell = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
    return /[",\r\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
};

/** The export file, sorted by name. */
export function existingToCsv(rows: ExistingOrganization[]): string {
    const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    return [
        EXISTING_COLUMNS.join(','),
        ...sorted.map((row) =>
            EXISTING_COLUMNS.map((c) => safeCell(row[c])).join(',')
        ),
    ]
        .join('\n')
        .concat('\n');
}

// --- Matching. Looser than the import's own check (exact name or website),
// because its job is to save research time, not to refuse a row: a "maybe"
// is shown to the researcher, who decides.

/** Lowercase, accents and punctuation removed, "&" read as "and", no leading "the". */
export function nameKey(name: string): string {
    return name
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim()
        .replace(/^the /, '');
}

/** Host without "www." plus the path without a trailing slash: "example.org/pantry". */
export function websiteKey(website: string): string {
    const url = normalizeWebUrl(website);
    if (!url) return '';
    const { hostname, pathname } = new URL(url);
    const host = hostname.toLowerCase().replace(/^www\./, '');
    const path = pathname.replace(/\/+$/, '').toLowerCase();
    return host + path;
}

/** "instagram:sjmutualaid" from "instagram:@SJMutualAid". */
export function socialKeys(socials: string): string[] {
    return socials
        .split(';')
        .map((entry) => {
            const at = entry.indexOf(':');
            if (at < 1) return '';
            const platform = entry.slice(0, at).trim().toLowerCase();
            const handle = entry
                .slice(at + 1)
                .trim()
                .replace(/^@/, '')
                .toLowerCase();
            return handle ? `${platform}:${handle}` : '';
        })
        .filter(Boolean);
}

const phoneKey = (phone: string) => {
    const stored = normalizePhone(phone, 'US');
    return stored ?? '';
};

/** An organization known from some file: the export, an earlier CSV, or the rejected list. */
export interface KnownOrganization {
    name: string;
    website: string;
    socials: string;
    phone: string;
    /** For the export: `active` or `archived` (deleted, or taken down at the group's request). */
    status: string;
    claimStatus: string;
    handle: string;
    placeLabel: string;
    /** For the rejected list: why it was left out. */
    reason: string;
    /** The file it came from, and its line. */
    source: string;
    line: number;
}

/** Something found while searching, before it's researched. */
export interface Candidate {
    name: string;
    website?: string;
    socials?: string;
    phone?: string;
}

export type MatchReason =
    'name' | 'website' | 'social' | 'phone' | 'similarName';

export interface KnownMatch {
    reason: MatchReason;
    known: KnownOrganization;
}

/** Reads any CSV with a `name` column (the export, an import file, the rejected list). */
export function readKnownFile(
    text: string,
    source: string
): KnownOrganization[] {
    const [header, ...body] = parseCsv(text);
    if (!header) return [];
    const index = new Map(
        header.map((column, i) => [column.trim().replace(/^﻿/, ''), i])
    );
    if (!index.has('name')) return [];
    const cell = (row: string[], column: string) => {
        const i = index.get(column);
        const value = i === undefined ? '' : (row[i] ?? '').trim();
        return value.replace(/^'(?=[=+\-@\t\r])/, ''); // undo safeCell
    };
    return body
        .map((row, i) => ({
            name: cell(row, 'name'),
            website: cell(row, 'website'),
            socials: cell(row, 'socials'),
            phone: cell(row, 'phone'),
            status: cell(row, 'status'),
            claimStatus: cell(row, 'claimStatus'),
            handle: cell(row, 'handle'),
            placeLabel: cell(row, 'placeLabel'),
            reason: cell(row, 'reason'),
            source,
            line: i + 2,
        }))
        .filter((k) => k.name);
}

const words = (key: string) => key.split(' ').filter(Boolean);

/** One name contains the other as whole words, and the shorter has at least two words. */
function similarNames(a: string, b: string): boolean {
    if (!a || !b || a === b) return false;
    const [short, long] = a.length <= b.length ? [a, b] : [b, a];
    if (words(short).length < 2) return false;
    return ` ${long} `.includes(` ${short} `);
}

/** Every known organization this candidate seems to be, strongest reason first. */
export function findKnown(
    candidate: Candidate,
    known: KnownOrganization[]
): KnownMatch[] {
    const name = nameKey(candidate.name);
    const website = candidate.website ? websiteKey(candidate.website) : '';
    const socials = new Set(socialKeys(candidate.socials ?? ''));
    const phone = candidate.phone ? phoneKey(candidate.phone) : '';
    const order: MatchReason[] = [
        'website',
        'social',
        'name',
        'phone',
        'similarName',
    ];
    const matches: KnownMatch[] = [];
    for (const k of known) {
        const kName = nameKey(k.name);
        let reason: MatchReason | undefined;
        if (website && website === websiteKey(k.website)) reason = 'website';
        else if (socialKeys(k.socials).some((s) => socials.has(s)))
            reason = 'social';
        else if (name && name === kName) reason = 'name';
        else if (phone && phone === phoneKey(k.phone)) reason = 'phone';
        else if (similarNames(name, kName)) reason = 'similarName';
        if (reason) matches.push({ reason, known: k });
    }
    return matches.sort(
        (a, b) => order.indexOf(a.reason) - order.indexOf(b.reason)
    );
}
