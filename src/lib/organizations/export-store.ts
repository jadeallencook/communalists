import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';

import { getAdminDb } from '@/lib/firebase/admin';
import { logRead } from '@/lib/firebase/read-log';

import { existingFromDocument, existingToCsv } from './existing';

// The super-user export of every organization (./existing.ts, features/18,
// decision #43). A fresh read, not cached: it's rare, it's used to decide
// what to research next, and it should include what was added minutes ago.
// It costs one read per organization.

/** Fields read from each document; nothing about members or the people a group serves. */
const FIELDS = [
    'name',
    'handle',
    'status',
    'claimStatus',
    'visibility',
    'location',
    'website',
    'phone',
    'contactEmail',
    'socials',
] as const;

/**
 * Every organization (listed, unlisted, unclaimed, and archived: deleted or
 * taken down) as a CSV, and an adminLog entry saying who downloaded it.
 * Callers check that `adminUid` is a super user.
 */
export async function exportOrganizations(adminUid: string) {
    const snapshot = await getAdminDb()
        .collection('organizations')
        .select(...FIELDS)
        .get();
    logRead('organizations', Math.max(snapshot.size, 1));
    const rows = snapshot.docs.map((doc) => existingFromDocument(doc.data()));
    await getAdminDb().collection('adminLog').add({
        action: 'exportOrganizations',
        orgName: '',
        actorUid: adminUid,
        count: rows.length,
        createdAt: FieldValue.serverTimestamp(),
    });
    return { csv: existingToCsv(rows), count: rows.length };
}
