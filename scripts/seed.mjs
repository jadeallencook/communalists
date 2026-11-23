#!/usr/bin/env node
// `pnpm seed`: test accounts and organizations (scripts/seed-data.json) in
// the local emulators. Running it again resets them.
//
//   --if-missing  Seed only if any seeded account or organization is missing
//                 (`pnpm dev` runs this at every start). Otherwise do nothing.
//   --from-app    Run by the dev toolbar's "Reset test data", which clears
//                 Next's cache itself, so skip the restart hint.
//
// Emulators only. The hosts and the `demo-` project are hard-coded, so this
// can't reach the real Firebase project. It only touches the seeded accounts
// and organizations (fixed ids) and leaves everything else alone.
//
// The documents match what the app writes (src/lib/users.ts saveUserProfile,
// src/lib/organizations/index.ts createOrganization). If you change those
// shapes, change this too. Data model: documentation/technical/data-model.md.

import { readFileSync } from 'node:fs';

import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { geohashForLocation } from 'geofire-common';

const PROJECT = 'demo-communalists';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
// Off the cloud there's no metadata server; don't wait seconds looking for one.
process.env.METADATA_SERVER_DETECTION = 'none';

const ifMissing = process.argv.includes('--if-missing');
const fromApp = process.argv.includes('--from-app');

const say = (message) => console.log(`\x1b[36m[seed]\x1b[0m ${message}`);
const fail = (message) => {
    console.error(`\x1b[31m[seed]\x1b[0m ${message}`);
    process.exit(1);
};

const readJson = (path) =>
    JSON.parse(readFileSync(new URL(path, import.meta.url)));
const { password, users, organizations } = readJson('./seed-data.json');

// --- Places, from the same data file the app uses.
const us = readJson('../src/lib/places/data/us.json');
function area(placeId) {
    const entry = us.places.find(([id]) => String(id) === placeId);
    if (!entry) fail(`seed-data.json: unknown place ${placeId}`);
    const [, name, region, lat, lng] = entry;
    return {
        placeId,
        country: 'US',
        label: `${name}, ${us.regions[region] ?? region}`,
        lat,
        lng,
        geohash: geohashForLocation([lat, lng]),
    };
}
const reachFor = (reach) =>
    reach.scope === 'local'
        ? {
              scope: 'local',
              radiusMiles: reach.radiusMiles,
              radiusKm: Math.round(reach.radiusMiles * 1.609344),
          }
        : { scope: reach.scope };

// --- Preflight
try {
    await fetch('http://127.0.0.1:9099/', {
        signal: AbortSignal.timeout(2000),
    });
} catch {
    fail(
        "The emulators aren't running. Start them with `pnpm dev` (or `pnpm emulators`), then run this again."
    );
}

// A stalled run (say, the emulators stopped midway) would otherwise hang and
// leave half the data. Fail loudly instead; running again fixes it.
setTimeout(
    () =>
        fail(
            'Seeding stalled for 30 s and was stopped. Check the emulators are running, then run `pnpm seed` again.'
        ),
    30_000
).unref();

const app = initializeApp({ projectId: PROJECT });
const auth = getAuth(app);
const db = getFirestore(app);
const now = FieldValue.serverTimestamp();

if (ifMissing) {
    const checks = await Promise.all([
        ...users.map(({ uid }) =>
            auth.getUser(uid).then(
                () => true,
                () => false
            )
        ),
        ...users
            .filter((u) => u.profile)
            .map(({ uid }) =>
                db
                    .collection('users')
                    .doc(uid)
                    .get()
                    .then((s) => s.exists)
            ),
        ...organizations.map(({ id }) =>
            db
                .collection('organizations')
                .doc(id)
                .get()
                .then((s) => s.exists)
        ),
    ]);
    if (checks.every(Boolean)) process.exit(0);
    say('Test data is missing or incomplete; adding it…');
}

/** Whether the account still signs in with the seed password (emulator REST). */
async function hasSeedPassword(email) {
    const response = await fetch(
        'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key',
        {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email, password, returnSecureToken: true }),
        }
    );
    return response.ok;
}

// --- Accounts. Existing ones are updated in place, so their sessions survive.
for (const { uid, email, profile } of users) {
    // Someone may have signed up with this email by hand.
    const byEmail = await auth.getUserByEmail(email).catch(() => null);
    if (byEmail && byEmail.uid !== uid) await auth.deleteUser(byEmail.uid);
    const existing = await auth.getUser(uid).catch(() => null);
    if (!existing) {
        await auth.createUser({ uid, email, password });
    } else if (existing.email !== email || !(await hasSeedPassword(email))) {
        // Setting a password (even the same one) signs the account out
        // everywhere, so only do it when it was actually changed.
        await auth.updateUser(uid, { email, password });
    }

    const ref = db.collection('users').doc(uid);
    if (profile) {
        const { placeId, ...rest } = profile;
        await ref.set({
            ...rest,
            location: area(placeId),
            createdAt: now,
            updatedAt: now,
        });
    } else {
        await ref.delete();
    }
}

// --- Leftovers: seeded accounts and organizations (ids starting `seed-`) that
// are no longer in seed-data.json, say after renaming one. Only `seed-` ids
// are touched, so accounts and groups you made by hand are left alone.
const userIds = new Set(users.map((u) => u.uid));
const orgIds = new Set(organizations.map((o) => o.id));
const deleteWhere = async (field, value) => {
    const found = await db
        .collection('memberships')
        .where(field, '==', value)
        .get();
    await Promise.all(found.docs.map((doc) => doc.ref.delete()));
};
let removed = 0;
for (let page = await auth.listUsers(1000); ;) {
    for (const { uid } of page.users) {
        if (!uid.startsWith('seed-') || userIds.has(uid)) continue;
        await auth.deleteUser(uid);
        await db.collection('users').doc(uid).delete();
        await deleteWhere('uid', uid);
        removed++;
    }
    if (!page.pageToken) break;
    page = await auth.listUsers(1000, page.pageToken);
}
for (const ref of await db.collection('organizations').listDocuments()) {
    if (!ref.id.startsWith('seed-') || orgIds.has(ref.id)) continue;
    const handle = (await ref.get()).data()?.handle;
    if (handle) {
        const handleRef = db.collection('handles').doc(handle);
        if ((await handleRef.get()).data()?.orgId === ref.id)
            await handleRef.delete();
    }
    await deleteWhere('orgId', ref.id);
    await ref.delete();
    removed++;
}
if (removed) say(`Removed ${removed} old test accounts and organizations.`);

// --- Organizations, their handles and memberships.
let skipped = 0;
const nameOf = Object.fromEntries(
    users.map((u) => [u.uid, u.profile?.displayName ?? ''])
);
for (const {
    members,
    requests = [],
    banned = [],
    placeId,
    reach,
    ...org
} of organizations) {
    const handleRef = db.collection('handles').doc(org.handle);
    const claimed = await handleRef.get();
    if (claimed.exists && claimed.data().orgId !== org.id) {
        say(
            `Skipped ${org.name}: the handle "${org.handle}" belongs to an organization you created.`
        );
        skipped++;
        continue;
    }

    // Start from a clean member list and moderation log for seeded organizations.
    const orgRef = db.collection('organizations').doc(org.id);
    const [old, oldLog] = await Promise.all([
        db.collection('memberships').where('orgId', '==', org.id).get(),
        orgRef.collection('moderationLog').get(),
    ]);
    const batch = db.batch();
    old.docs.forEach((doc) => batch.delete(doc.ref));
    oldLog.docs.forEach((doc) => batch.delete(doc.ref));

    const owner = members.find(([, role]) => role === 'owner')[0];
    batch.set(orgRef, {
        ...org,
        location: area(placeId),
        reach: reachFor(reach),
        status: 'active',
        memberCount: members.length,
        createdBy: owner,
        createdAt: now,
        updatedAt: now,
    });
    batch.set(handleRef, { orgId: org.id, createdAt: now });
    const copy = {
        name: org.name,
        handle: org.handle,
        focusAreas: org.focusAreas,
    };
    const membership = (uid, fields) =>
        batch.set(db.collection('memberships').doc(`${org.id}_${uid}`), {
            orgId: org.id,
            uid,
            org: copy,
            member: { displayName: nameOf[uid] },
            ...fields,
        });
    for (const [uid, role] of members) {
        membership(uid, { role, status: 'active', joinedAt: now });
    }
    for (const uid of requests) {
        membership(uid, {
            role: 'member',
            status: 'pending',
            requestedAt: now,
        });
    }
    for (const [uid, reason] of banned) {
        membership(uid, {
            role: 'member',
            status: 'banned',
            banReason: reason,
            bannedAt: now,
        });
        batch.set(orgRef.collection('moderationLog').doc(), {
            action: 'ban',
            target: { uid, displayName: nameOf[uid] },
            actor: { uid: owner, displayName: nameOf[owner] },
            reason,
            createdAt: now,
        });
    }
    await batch.commit();
}

say(
    `Seeded ${users.length} accounts and ${organizations.length - skipped} organizations. Password for all: ${password}. Main accounts:`
);
for (const { email, profile } of users.filter((u) => u.featured)) {
    say(
        `  ${email}${profile ? '' : '  (no profile yet: goes to account setup)'}`
    );
}
if (!ifMissing && !fromApp) {
    say(
        'If `pnpm dev` was already running, restart it: pages may show cached data from before. (The dev toolbar\'s "Reset test data" clears it for you.)'
    );
}
process.exit(0);
