import 'server-only';

import { getAdminDb } from '@/lib/firebase/admin';
import { logRead } from '@/lib/firebase/read-log';
import { getPlace, toGeneralArea } from '@/lib/places';
import { isSupportedCountry } from '@/lib/places/types';

import { createUnclaimedOrganization } from './index';
import { claimBlocks } from './handle';
import {
    checkImportRows,
    withProblem,
    type CheckedRow,
    type ImportMatch,
    type ImportRow,
} from './import';

// The database side of the CSV import (./import.ts, features/18). Always
// fresh reads: these decide what gets written.

const findPlace = (country: string, placeId: string) =>
    isSupportedCountry(country) ? (getPlace(country, placeId) ?? null) : null;

const organizations = () => getAdminDb().collection('organizations');

const toMatch = (data: FirebaseFirestore.DocumentData): ImportMatch => ({
    name: data.name,
    handle: data.handle,
    place: data.location?.label ?? '',
    unclaimed: data.claimStatus === 'unclaimed',
});

/** An active organization with this value in `field`, if there is one. */
async function activeWith(field: 'name' | 'website', value: string) {
    logRead('organizations');
    const snapshot = await organizations()
        .where(field, '==', value)
        .limit(5)
        .get();
    const doc = snapshot.docs.find((d) => d.data().status === 'active');
    return doc ? toMatch(doc.data()) : null;
}

/** Whether the handle is taken, and by which organization (none when it's only held). */
async function handleHolder(handle: string) {
    logRead('handles');
    const claim = await getAdminDb().collection('handles').doc(handle).get();
    const data = claim.data();
    const taken = claimBlocks(
        claim.exists
            ? {
                  orgId: data?.orgId,
                  heldUntil: data?.heldUntil?.toMillis?.() ?? data?.heldUntil,
              }
            : null,
        null,
        Date.now()
    );
    if (!taken) return { taken: false as const };
    logRead('organizations');
    const org = data?.orgId
        ? await organizations().doc(data.orgId).get()
        : null;
    const current = org?.exists && org.data()?.handle === handle;
    return {
        taken: true as const,
        match: current ? toMatch(org.data()!) : undefined,
    };
}

/** Adds what only the database knows: already listed by name or website, handle taken. */
async function checkAgainstDatabase(row: CheckedRow): Promise<CheckedRow> {
    if (!row.input) return row;
    const { name, website, handle } = row.input;
    const [sameName, sameWebsite, holder] = await Promise.all([
        activeWith('name', name),
        website ? activeWith('website', website) : Promise.resolve(null),
        handleHolder(handle),
    ]);
    if (sameName)
        return withProblem(row, {
            column: 'name',
            key: 'sameName',
            value: name,
            match: sameName,
        });
    if (sameWebsite)
        return withProblem(row, {
            column: 'website',
            key: 'sameWebsite',
            value: website,
            match: sameWebsite,
        });
    if (holder.taken)
        return withProblem(row, {
            column: 'handle',
            key: 'handleTaken',
            value: handle,
            ...(holder.match ? { match: holder.match } : {}),
        });
    return row;
}

/**
 * Every check. The database is asked about the rows in `databaseLines` only
 * (all rows when it's left out); each such row costs up to 4 reads.
 */
export async function checkImport(
    rows: ImportRow[],
    databaseLines?: ReadonlySet<number>
): Promise<CheckedRow[]> {
    const checked = checkImportRows(rows, findPlace);
    const out: CheckedRow[] = [];
    // A few rows at a time.
    for (let i = 0; i < checked.length; i += 10) {
        out.push(
            ...(await Promise.all(
                checked
                    .slice(i, i + 10)
                    .map((row) =>
                        !databaseLines || databaseLines.has(row.line)
                            ? checkAgainstDatabase(row)
                            : row
                    )
            ))
        );
    }
    return out;
}

export type ImportOutcome =
    | { line: number; name: string; status: 'created'; handle: string }
    | { line: number; name: string; status: 'skipped' }
    | { line: number; name: string; status: 'failed' };

/**
 * Checks everything again on fresh data, then adds every ready row as an
 * unclaimed organization, one transaction each (each also writes its
 * adminLog entry). A row that fails doesn't stop the rest.
 */
export async function runImport(adminUid: string, rows: ImportRow[]) {
    const checked = await checkImport(rows);
    const outcomes: ImportOutcome[] = [];
    for (const row of checked) {
        const base = { line: row.line, name: row.name };
        const place =
            row.input && findPlace(row.input.country, row.input.placeId);
        if (!row.input || !place) {
            outcomes.push({ ...base, status: 'skipped' });
            continue;
        }
        try {
            const created = await createUnclaimedOrganization(
                adminUid,
                row.input,
                toGeneralArea(place)
            );
            outcomes.push(
                created.ok
                    ? { ...base, status: 'created', handle: created.handle }
                    : { ...base, status: 'failed' }
            );
        } catch (error) {
            console.error(
                '[import] create failed on line',
                row.line,
                (error as Error).message
            );
            outcomes.push({ ...base, status: 'failed' });
        }
    }
    return { rows: checked, outcomes };
}
