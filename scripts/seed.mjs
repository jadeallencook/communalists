#!/usr/bin/env node
// `pnpm seed`: test accounts and organizations (scripts/seed-data.json), and
// dictionary words from any CSVs in research/definitions/ (git ignores it; the
// format is the /admin/definitions/import one), in the local emulators.
// Running it again resets them.
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

import { existsSync, readdirSync, readFileSync } from 'node:fs';

import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { geohashForLocation } from 'geofire-common';
import sharp from 'sharp';

// Plain TypeScript with no imports: Node strips the types.
import { parseCsv } from '../src/lib/csv.ts';
import { missingDetails } from '../src/lib/organizations/details.ts';
import {
    downloadUrl,
    PHOTO_SIZES,
    photoPath,
} from '../src/lib/photos/index.ts';

const PROJECT = 'demo-communalists';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';
const BUCKET = `${PROJECT}.firebasestorage.app`;
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
const {
    password,
    users,
    organizations,
    comments = [],
} = readJson('./seed-data.json');

// --- Dictionary words: every CSV in research/definitions/, in the import's
// columns (src/lib/definitions/import.ts). Unchecked here; check a file with
// /admin/definitions/import first. Missing folder: no words. Agreed rewrites
// of single words (research/definitions/updates/, from the brainstorm-definition
// skill) replace those words' text, but not their related words, like the
// upload at /admin/definitions/upload.
const WORDS_DIR = new URL('../research/definitions/', import.meta.url);
const UPDATES_DIR = new URL('updates/', WORDS_DIR);
const LOCALES = ['en', 'es', 'vi', 'zh'];
const readWords = (dir) =>
    (existsSync(dir) ? readdirSync(dir) : [])
        .filter((name) => name.endsWith('.csv'))
        .flatMap((name) => {
            const [header, ...rows] = parseCsv(
                readFileSync(new URL(name, dir), 'utf8')
            );
            const col = (row, name) => (row[header.indexOf(name)] ?? '').trim();
            return rows.map((row) => ({
                slug: col(row, 'slug').toLowerCase(),
                related: col(row, 'related')
                    .split(';')
                    .map((s) => s.trim().toLowerCase())
                    .filter(Boolean),
                text: Object.fromEntries(
                    LOCALES.map((l) => [
                        l,
                        {
                            word: col(row, `${l}_word`),
                            definition: col(row, `${l}_definition`),
                            details: col(row, `${l}_details`),
                        },
                    ])
                ),
            }));
        })
        .filter((d) => d.slug);
const updates = new Map(readWords(UPDATES_DIR).map((d) => [d.slug, d.text]));
const definitions = readWords(WORDS_DIR).map((d) =>
    updates.has(d.slug) ? { ...d, text: updates.get(d.slug) } : d
);

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

const app = initializeApp({ projectId: PROJECT, storageBucket: BUCKET });
const auth = getAuth(app);
const db = getFirestore(app);
const now = FieldValue.serverTimestamp();

// --- Photos: abstract pictures (two colours, never real people) saved like
// the app saves uploads (src/lib/photos/store.ts), in the Storage emulator.
// If Storage isn't running (emulators started before it was added), the
// seed goes on without photos.
let photosSkipped = false;
// Asked once, quickly: the Storage client retries for a long time otherwise.
const storageUp = fetch(
    `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}/`,
    {
        signal: AbortSignal.timeout(2000),
    }
).then(
    () => true,
    () => false
);
async function seedPhoto(kind, ownerId, [from, to]) {
    if (!photosSkipped && !(await storageUp)) {
        photosSkipped = true;
        say(
            "Skipped photos: the Storage emulator isn't running. Restart `pnpm dev` to start it, then run `pnpm seed`."
        );
    }
    if (photosSkipped) return undefined;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="500" height="500" fill="url(#g)"/><circle cx="250" cy="210" r="90" fill="#ffffff" fill-opacity="0.55"/><ellipse cx="250" cy="480" rx="170" ry="140" fill="#ffffff" fill-opacity="0.35"/></svg>`;
    const id = 'seed';
    const token = `seed-${ownerId}`;
    try {
        const links = {};
        for (const [size, side] of Object.entries(PHOTO_SIZES)) {
            const path = photoPath(kind, ownerId, id, size);
            const file = await sharp(Buffer.from(svg))
                .resize(side, side)
                .webp({ quality: 80 })
                .toBuffer();
            await getStorage(app)
                .bucket()
                .file(path)
                .save(file, {
                    resumable: false,
                    contentType: 'image/webp',
                    metadata: {
                        metadata: { firebaseStorageDownloadTokens: token },
                    },
                });
            links[size] = downloadUrl(
                `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}`,
                BUCKET,
                path,
                token
            );
        }
        return { id, ...links };
    } catch (error) {
        photosSkipped = true;
        say(
            `Skipped photos: the Storage emulator didn't answer (${error.message}). Restart \`pnpm dev\` to start it, then run \`pnpm seed\`.`
        );
        return undefined;
    }
}

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
            .map(({ uid, profile }) =>
                db
                    .collection('users')
                    .doc(uid)
                    .get()
                    // Also re-seed when the data gained a field (like username).
                    .then(
                        (s) =>
                            s.exists && s.data().username === profile.username
                    )
            ),
        ...organizations.map(({ id }) =>
            db
                .collection('organizations')
                .doc(id)
                .get()
                .then((s) => s.exists)
        ),
        ...definitions.map(({ slug }) =>
            db
                .collection('definitions')
                .doc(slug)
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
const photoOf = {};
for (const { uid, email, profile, photo } of users) {
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
    // Usernames this account claimed before (say, renamed in the app).
    const oldClaims = await db
        .collection('usernames')
        .where('uid', '==', uid)
        .get();
    await Promise.all(
        oldClaims.docs
            .filter((doc) => doc.id !== profile?.username)
            .map((doc) => doc.ref.delete())
    );
    if (profile) {
        const { placeId, publicProfile, ...rest } = profile;
        photoOf[uid] = photo ? await seedPhoto('users', uid, photo) : undefined;
        await ref.set({
            ...rest,
            location: area(placeId),
            // What they share on their profile (src/lib/profiles.ts).
            ...(publicProfile ? { profile: publicProfile } : {}),
            ...(photoOf[uid] ? { photo: photoOf[uid] } : {}),
            createdAt: now,
            updatedAt: now,
        });
        if (profile.username) {
            await db
                .collection('usernames')
                .doc(profile.username)
                .set({ uid, createdAt: now });
        }
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
    for (const collection of ['memberships', 'endorsements']) {
        const found = await db
            .collection(collection)
            .where(field, '==', value)
            .get();
        await Promise.all(found.docs.map((doc) => doc.ref.delete()));
    }
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
    const claimsLeft = await db
        .collection('claimRequests')
        .where('orgId', '==', ref.id)
        .get();
    await Promise.all(claimsLeft.docs.map((doc) => doc.ref.delete()));
    await ref.delete();
    removed++;
}
if (removed) say(`Removed ${removed} old test accounts and organizations.`);

// --- Organizations, their handles and memberships.
let skipped = 0;
const nameOf = Object.fromEntries(
    users.map((u) => [u.uid, u.profile?.displayName ?? ''])
);
const usernameOf = Object.fromEntries(
    users.map((u) => [u.uid, u.profile?.username])
);
const visibilityOf = Object.fromEntries(
    users.map((u) => [u.uid, u.profile?.publicProfile?.visibility ?? 'groups'])
);
for (const {
    members,
    requests = [],
    banned = [],
    claims = [],
    endorsedBy = [],
    unclaimed = false,
    createdBy,
    placeId,
    reach,
    photo: logoColors,
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
    const [old, oldLog, oldHandles, oldClaims, oldEndorsements] =
        await Promise.all([
            db.collection('memberships').where('orgId', '==', org.id).get(),
            orgRef.collection('moderationLog').get(),
            // Handles it moved to (or holds) since: renaming in the app adds these.
            db.collection('handles').where('orgId', '==', org.id).get(),
            db.collection('claimRequests').where('orgId', '==', org.id).get(),
            db.collection('endorsements').where('orgId', '==', org.id).get(),
        ]);
    const batch = db.batch();
    oldEndorsements.docs.forEach((doc) => batch.delete(doc.ref));
    old.docs.forEach((doc) => batch.delete(doc.ref));
    oldLog.docs.forEach((doc) => batch.delete(doc.ref));
    oldHandles.docs
        .filter((doc) => doc.id !== org.handle)
        .forEach((doc) => batch.delete(doc.ref));
    oldClaims.docs.forEach((doc) => batch.delete(doc.ref));

    // Unclaimed organizations (added by a super user) have no members.
    const owner = members.find(([, role]) => role === 'owner')?.[0];
    const logo = logoColors
        ? await seedPhoto('organizations', org.id, logoColors)
        : undefined;
    batch.set(orgRef, {
        ...(logo ? { photo: logo } : {}),
        ...org,
        location: area(placeId),
        reach: reachFor(reach),
        status: 'active',
        ...(unclaimed ? { claimStatus: 'unclaimed' } : {}),
        memberCount: members.length,
        endorsementCount: endorsedBy.length,
        missingDetails: missingDetails(org),
        createdBy: createdBy ?? owner,
        createdAt: now,
        updatedAt: now,
    });
    batch.set(handleRef, { orgId: org.id, createdAt: now });
    const copy = {
        name: org.name,
        handle: org.handle,
        focusAreas: org.focusAreas,
        ...(logo ? { photo: logo.small } : {}),
    };
    const membership = (uid, fields) =>
        batch.set(db.collection('memberships').doc(`${org.id}_${uid}`), {
            orgId: org.id,
            uid,
            org: copy,
            // Like memberCopyOf (src/lib/organizations/index.ts).
            member: JSON.parse(
                JSON.stringify({
                    displayName: nameOf[uid],
                    username: usernameOf[uid],
                    photo: photoOf[uid]?.small,
                    visibility: visibilityOf[uid],
                })
            ),
            ...fields,
        });
    for (const [uid, role] of members) {
        membership(uid, { role, status: 'active', joinedAt: now });
    }
    // People showing it off on their profile (src/lib/endorsements).
    for (const uid of endorsedBy) {
        batch.set(db.collection('endorsements').doc(`${org.id}_${uid}`), {
            orgId: org.id,
            uid,
            createdAt: now,
        });
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
    // Requests to claim (or take down) an unclaimed organization.
    for (const { uid, intent, role, message } of claims) {
        batch.set(db.collection('claimRequests').doc(`${org.id}_${uid}`), {
            orgId: org.id,
            uid,
            intent,
            role,
            message,
            status: 'pending',
            org: { name: org.name, handle: org.handle },
            claimant: JSON.parse(
                JSON.stringify({
                    displayName: nameOf[uid],
                    username: usernameOf[uid],
                })
            ),
            requestedAt: now,
        });
    }
    await batch.commit();
}

// --- Dictionary words from research/definitions/, added by the seeded super
// user. Those words are reset; words you added in the app are left alone.
// The document matches saveDefinition in src/lib/definitions/store.ts.
const admin = users.find((u) => u.platformAdmin)?.uid ?? 'seed-jordan';
// Batches hold 500 writes; commit every 400 words.
for (let i = 0; i < definitions.length; i += 400) {
    const wordBatch = db.batch();
    for (const definition of definitions.slice(i, i + 400)) {
        wordBatch.set(db.collection('definitions').doc(definition.slug), {
            ...definition,
            resources: [],
            createdBy: admin,
            createdAt: now,
            updatedBy: admin,
            updatedAt: now,
        });
    }
    await wordBatch.commit();
}

// --- Comments (src/lib/comments/store.ts) on words that exist (`slug`) and
// on seeded organizations (`org`, with the organization's `reply`): reset
// each time, with their votes and reports. Reports on seed-c4 and on one
// reply give /admin/comments something to review. Rate limits of seeded
// people are cleared.
const wordSlugs = new Set(definitions.map((d) => d.slug));
const seededComments = comments.filter((c) =>
    c.slug ? wordSlugs.has(c.slug) : orgIds.has(c.org)
);
const commentBatch = db.batch();
for (const c of seededComments) {
    const target = c.slug
        ? { kind: 'definition', id: c.slug }
        : { kind: 'organization', id: c.org };
    const parent = db
        .collection(c.slug ? 'definitions' : 'organizations')
        .doc(target.id);
    const oldVotes = await parent
        .collection('commentVotes')
        .where('commentId', '==', c.id)
        .get();
    for (const doc of oldVotes.docs) commentBatch.delete(doc.ref);
    commentBatch.set(parent.collection('comments').doc(c.id), {
        uid: c.uid,
        text: c.text,
        lang: c.lang,
        votes: c.voters.length,
        hidden: false,
        createdAt: Timestamp.fromMillis(Date.now() - c.daysAgo * 86_400_000),
        ...(c.reply
            ? {
                  reply: {
                      uid: c.reply.uid,
                      text: c.reply.text,
                      lang: c.reply.lang,
                      byTeam: c.reply.byTeam === true,
                      hidden: false,
                      createdAt: Timestamp.fromMillis(
                          Date.now() - c.reply.daysAgo * 86_400_000
                      ),
                  },
              }
            : {}),
    });
    for (const voter of c.voters)
        commentBatch.set(
            parent.collection('commentVotes').doc(`${c.id}_${voter}`),
            { commentId: c.id, uid: voter, createdAt: now }
        );
    for (const part of ['comment', 'reply']) {
        const list = part === 'reply' ? c.reply?.reports : c.reports;
        const report = db
            .collection('commentReports')
            .doc(
                `${target.kind}~${target.id}~${c.id}${part === 'reply' ? '~reply' : ''}`
            );
        if (list?.length) {
            const reasons = {};
            for (const r of list)
                reasons[r.reason] = (reasons[r.reason] ?? 0) + 1;
            commentBatch.set(report, {
                target,
                commentId: c.id,
                part,
                reporters: list.map((r) => r.uid),
                reasons,
                count: list.length,
                firstAt: now,
                lastAt: now,
            });
        } else commentBatch.delete(report);
    }
}
for (const { uid } of users)
    commentBatch.delete(db.collection('commentLimits').doc(uid));
await commentBatch.commit();

say(
    `Seeded ${users.length} accounts, ${organizations.length - skipped} organizations, ${definitions.length} dictionary words and ${seededComments.length} comments. Password for all: ${password}. Main accounts:`
);
for (const { email, profile, platformAdmin } of users.filter(
    (u) => u.featured
)) {
    say(
        `  ${email}${profile ? '' : '  (no profile yet: goes to account setup)'}${platformAdmin ? '  (super user)' : ''}`
    );
}
if (!ifMissing && !fromApp) {
    say(
        'If `pnpm dev` was already running, restart it: pages may show cached data from before. (The dev toolbar\'s "Reset test data" clears it for you.)'
    );
}
process.exit(0);
