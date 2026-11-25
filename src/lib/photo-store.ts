import 'server-only';

import { getAdminDb } from '@/lib/firebase/admin';
import { logRead } from '@/lib/firebase/read-log';
import { processPhoto } from '@/lib/photo-process';
import { profileSettingsOf, type ProfileVisibility } from '@/lib/profiles';
import { MAX_PHOTO_UPLOAD_BYTES, PHOTO_FIELD, photoDocId } from '@/lib/photos';

// Stored photos: photos/{kind}_{id} → { data (bytes), type, updatedAt }.
// Small (a 256 px WebP, usually 5–30 KB), so they live in Firestore beside
// everything else and are served by /api/photos/{kind}/{id}, which checks who
// may see them (decision #42). Rules deny clients; only the Admin SDK reads
// and writes here.
//
// The route reads fresh (no 'use cache'): it decides access, and in testing
// its cached reads went stale after updateTag from the pages' actions. Each
// URL carries the photo's version, so browsers cache it and the reads happen
// only once per browser per photo.
//
// Whoever owns the photo keeps its version (when it was saved) on their own
// document (`organizations/{id}.photoVersion`, `users/{uid}.photoVersion`);
// that's what pages use to decide whether there's a photo at all.

const photos = () => getAdminDb().collection('photos');

export interface StoredPhoto {
    data: Buffer;
    version?: number;
}

const toPhoto = (snapshot: FirebaseFirestore.DocumentSnapshot) => {
    const data = snapshot.data()?.data as Buffer | undefined;
    return data ? { data: Buffer.from(data) } : null;
};

/**
 * An active organization's photo, read fresh: the organization and the photo
 * in one round trip. Not through 'use cache': the photo route makes access
 * decisions, and browsers cache each version's URL instead.
 */
export async function readOrganizationPhoto(
    orgId: string
): Promise<StoredPhoto | null> {
    const db = getAdminDb();
    logRead('organizations + photos (photo route)', 2);
    const [org, photo] = await db.getAll(
        db.collection('organizations').doc(orgId),
        photos().doc(photoDocId('org', orgId))
    );
    if (org.data()?.status !== 'active') return null;
    return toPhoto(photo);
}

/** A person's photo and their profile visibility, read fresh in one round trip. */
export async function readUserPhoto(uid: string): Promise<{
    photo: StoredPhoto;
    visibility: ProfileVisibility;
} | null> {
    const db = getAdminDb();
    logRead('users + photos (photo route)', 2);
    const [user, photo] = await db.getAll(
        db.collection('users').doc(uid),
        photos().doc(photoDocId('user', uid))
    );
    const stored = toPhoto(photo);
    if (!user.exists || !stored) return null;
    return {
        photo: stored,
        visibility: profileSettingsOf(user.data()?.profile).visibility,
    };
}

/** Whether two people share an active group, read fresh. */
export async function shareActiveGroup(a: string, b: string): Promise<boolean> {
    const db = getAdminDb();
    const theirs = await db
        .collection('memberships')
        .where('uid', '==', a)
        .where('status', '==', 'active')
        .select('orgId')
        .get();
    logRead('memberships (photo route)', Math.max(theirs.size, 1));
    if (theirs.empty) return false;
    const mine = await db.getAll(
        ...theirs.docs.map((doc) =>
            db.collection('memberships').doc(`${doc.data().orgId}_${b}`)
        )
    );
    logRead('memberships (photo route)', mine.length);
    return mine.some((doc) => doc.data()?.status === 'active');
}

/**
 * Reads the editor's form: the new photo, processed and ready to store, or
 * null to remove it.
 */
export async function photoFromForm(
    formData: FormData
): Promise<
    | { ok: true; photo: Buffer | null }
    | { ok: false; error: 'tooBig' | 'invalid' | 'tooSmall' }
> {
    if (formData.get('remove') === '1') return { ok: true, photo: null };
    const file = formData.get(PHOTO_FIELD);
    if (!(file instanceof File) || file.size === 0)
        return { ok: false, error: 'invalid' };
    if (file.size > MAX_PHOTO_UPLOAD_BYTES)
        return { ok: false, error: 'tooBig' };
    const processed = await processPhoto(
        new Uint8Array(await file.arrayBuffer())
    );
    return processed.ok ? { ok: true, photo: processed.data } : processed;
}
