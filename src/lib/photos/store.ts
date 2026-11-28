import 'server-only';

import { randomUUID } from 'node:crypto';

import sharp from 'sharp';

import {
    getAdminBucket,
    storageBucketName,
    storageDownloadHost,
} from '@/lib/firebase/admin';

import {
    downloadUrl,
    isCroppedSquare,
    PHOTO_SIZES,
    photoPath,
    type Photo,
    type PhotoKind,
    type PhotoSize,
} from './index';

// Photo files in Firebase Storage (design: features/17-profiles.md → "Photo").
//
//   photos/users/{uid}/{id}-500.webp, …-128.webp
//   photos/organizations/{orgId}/{id}-500.webp, …-128.webp
//
// Only this server writes them (Storage rules deny every client). They're
// read through download-token links; the token is the secret.

const SIZES = Object.keys(PHOTO_SIZES) as PhotoSize[];

/**
 * Browsers keep a copy for a year: every new photo or token is a new link,
 * so a cached copy is never out of date. `private`: no shared caches, so a
 * changed token can't be served from one.
 */
const CACHE_CONTROL = 'private, max-age=31536000, immutable';

export type ProcessResult =
    | { ok: true; files: Record<PhotoSize, Buffer> }
    | { ok: false; error: 'unreadable' | 'notSquare' };

/**
 * Decodes the upload and writes it again as WebP at each saved size. Never
 * trusts the browser: anything that doesn't decode as a JPEG, PNG or WebP
 * square is refused. sharp drops all metadata (EXIF, GPS) unless told to
 * keep it, and limitInputPixels stops oversized "decompression bomb" files.
 */
export async function processPhoto(bytes: Buffer): Promise<ProcessResult> {
    let info;
    try {
        info = await sharp(bytes, { limitInputPixels: 4096 * 4096 }).metadata();
    } catch {
        return { ok: false, error: 'unreadable' };
    }
    if (!['jpeg', 'png', 'webp'].includes(info.format ?? ''))
        return { ok: false, error: 'unreadable' };
    if (!info.width || !info.height || (info.pages && info.pages > 1))
        return { ok: false, error: 'unreadable' };
    if (!isCroppedSquare(info.width, info.height))
        return { ok: false, error: 'notSquare' };

    try {
        const entries = await Promise.all(
            SIZES.map(async (size) => {
                const side = PHOTO_SIZES[size];
                const file = await sharp(bytes, {
                    limitInputPixels: 4096 * 4096,
                })
                    .rotate() // applies (then drops) any orientation tag
                    .resize(side, side, { fit: 'cover' })
                    .flatten({ background: '#ffffff' }) // transparent logos
                    .webp({ quality: size === 'large' ? 82 : 78 })
                    .toBuffer();
                return [size, file] as const;
            })
        );
        return {
            ok: true,
            files: Object.fromEntries(entries) as Record<PhotoSize, Buffer>,
        };
    } catch {
        return { ok: false, error: 'unreadable' };
    }
}

const linksFor = (
    kind: PhotoKind,
    ownerId: string,
    id: string,
    token: string
): Photo => {
    const host = storageDownloadHost();
    const bucket = storageBucketName();
    return {
        id,
        large: downloadUrl(
            host,
            bucket,
            photoPath(kind, ownerId, id, 'large'),
            token
        ),
        small: downloadUrl(
            host,
            bucket,
            photoPath(kind, ownerId, id, 'small'),
            token
        ),
    };
};

/** Saves processed files under a new random id and returns their links. */
export async function savePhotoFiles(
    kind: PhotoKind,
    ownerId: string,
    files: Record<PhotoSize, Buffer>
): Promise<Photo> {
    const id = randomUUID();
    const token = randomUUID();
    const bucket = getAdminBucket();
    await Promise.all(
        SIZES.map((size) =>
            bucket.file(photoPath(kind, ownerId, id, size)).save(files[size], {
                resumable: false,
                contentType: 'image/webp',
                metadata: {
                    cacheControl: CACHE_CONTROL,
                    metadata: { firebaseStorageDownloadTokens: token },
                },
            })
        )
    );
    return linksFor(kind, ownerId, id, token);
}

/**
 * Saves a copy of a photo under a new id and token, and returns its links.
 * Used when someone shares their profile with fewer people: the caller
 * points the profile at the copy, then deletes the old files, so links
 * copied before stop working. (Changing the token in place isn't enough:
 * setting firebaseStorageDownloadTokens can add a token instead of
 * replacing it, and then the old link keeps working. Seen in the emulator,
 * 2026-11-27.)
 */
export async function rotatePhoto(
    kind: PhotoKind,
    ownerId: string,
    photo: Photo
): Promise<Photo> {
    const bucket = getAdminBucket();
    const entries = await Promise.all(
        SIZES.map(async (size) => {
            const [bytes] = await bucket
                .file(photoPath(kind, ownerId, photo.id, size))
                .download();
            return [size, bytes] as const;
        })
    );
    return savePhotoFiles(
        kind,
        ownerId,
        Object.fromEntries(entries) as Record<PhotoSize, Buffer>
    );
}

/**
 * Deletes a photo's files. Missing files are fine (already gone). Callers
 * delete after the record stops pointing at them, so a failure here only
 * leaves an unreachable file, never a broken photo.
 */
export async function deletePhotoFiles(
    kind: PhotoKind,
    ownerId: string,
    id: string
): Promise<void> {
    const bucket = getAdminBucket();
    await Promise.all(
        SIZES.map((size) =>
            bucket
                .file(photoPath(kind, ownerId, id, size))
                .delete({ ignoreNotFound: true })
        )
    );
}
