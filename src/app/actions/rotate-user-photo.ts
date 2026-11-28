import 'server-only';

import type { Photo } from '@/lib/photos';
import { deletePhotoFiles, rotatePhoto } from '@/lib/photos/store';
import { setUserPhoto } from '@/lib/users';

/**
 * Moves a person's photo to a new link and deletes the old files, so copies
 * of the old link stop working (decision #71). Used when they share with
 * fewer people: a stricter visibility, or a comrade removed (decision #74).
 * Throws if the copy fails (nothing changed then). A failed delete of the
 * old files only leaves an unreachable file, so it's logged. The caller
 * clears `userTag` and syncs member copies.
 */
export async function rotateUserPhoto(
    uid: string,
    photo: Photo
): Promise<void> {
    const moved = await rotatePhoto('users', uid, photo);
    const old = await setUserPhoto(uid, moved);
    if (old)
        await deletePhotoFiles('users', uid, old.id).catch((error: Error) =>
            console.error('[photos] old photo delete failed', error.message)
        );
}
