// One-time backfill: sets `missingDetails` on every organization created
// before it existed (2026-11-27), so the super-user dashboard can count and
// list pages that need research. New and edited organizations get it from
// the app. Safe to re-run: it only writes documents whose value changed.
//
//   node scripts/backfill-missing-details.mjs              dry run, emulators
//   node scripts/backfill-missing-details.mjs --write      write, emulators
//   node scripts/backfill-missing-details.mjs --production [--write]
//
// --production uses the real `communalists` project, with
// FIREBASE_SERVICE_ACCOUNT_KEY if set, else Application Default Credentials
// (`gcloud auth application-default login`). It reads every organization
// once (about one read per organization) and writes only the ones that change.

import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Plain TypeScript with no imports: Node strips the types.
import {
    missingDetails,
    missingDetailsChanged,
} from '../src/lib/organizations/details.ts';

const write = process.argv.includes('--write');
const production = process.argv.includes('--production');
const say = (message) => console.log(`\x1b[36m[backfill]\x1b[0m ${message}`);

let app;
if (production) {
    const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    app = initializeApp({
        credential: key ? cert(JSON.parse(key)) : applicationDefault(),
        projectId: 'communalists',
    });
} else {
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
    process.env.METADATA_SERVER_DETECTION = 'none';
    app = initializeApp({ projectId: 'demo-communalists' });
}
const db = getFirestore(app);

say(
    `${production ? 'PRODUCTION (communalists)' : 'emulators'}, ${write ? 'writing' : 'dry run (add --write to save)'}`
);

const PAGE = 300;
let last;
let read = 0;
let changed = 0;
for (;;) {
    let query = db.collection('organizations').orderBy('__name__').limit(PAGE);
    if (last) query = query.startAfter(last);
    const snapshot = await query.get();
    if (snapshot.empty) break;
    read += snapshot.size;
    const batch = db.batch();
    let inBatch = 0;
    for (const doc of snapshot.docs) {
        const data = doc.data();
        if (!missingDetailsChanged(data.missingDetails, data)) continue;
        changed++;
        inBatch++;
        // Not updatedAt: nothing a person sees changed.
        batch.update(doc.ref, { missingDetails: missingDetails(data) });
    }
    if (write && inBatch > 0) await batch.commit();
    last = snapshot.docs.at(-1);
    if (snapshot.size < PAGE) break;
}

say(
    `${read} organizations read, ${changed} ${write ? 'updated' : 'would change'}.`
);
