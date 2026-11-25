// Turns an upload into the stored photo, with sharp (Node only; importing
// this from the browser fails the build). Kept apart from photo-store.ts so
// it can be tested without Firestore.

import sharp from 'sharp';

import {
    MAX_PHOTO_UPLOAD_BYTES,
    MIN_PHOTO_SIDE,
    PHOTO_SIZE,
} from '@/lib/photos';

export type ProcessPhotoResult =
    | { ok: true; data: Buffer }
    | { ok: false; error: 'tooBig' | 'invalid' | 'tooSmall' };

/**
 * Checks an upload and makes the stored version: a PHOTO_SIZE square WebP.
 * Never trusts the browser's crop or type: the bytes must decode as JPEG, PNG
 * or WebP. Re-encoding drops everything but the pixels, including EXIF data
 * like where a photo was taken.
 */
export async function processPhoto(
    bytes: Uint8Array
): Promise<ProcessPhotoResult> {
    if (bytes.byteLength > MAX_PHOTO_UPLOAD_BYTES)
        return { ok: false, error: 'tooBig' };
    try {
        // A cap on pixels guards against "decompression bombs".
        const image = sharp(bytes, { limitInputPixels: 4096 * 4096 });
        const meta = await image.metadata();
        if (!['jpeg', 'png', 'webp'].includes(meta.format ?? ''))
            return { ok: false, error: 'invalid' };
        if (Math.min(meta.width ?? 0, meta.height ?? 0) < MIN_PHOTO_SIDE)
            return { ok: false, error: 'tooSmall' };
        const data = await image
            .rotate() // apply the camera's orientation before it's dropped
            .resize(PHOTO_SIZE, PHOTO_SIZE, { fit: 'cover' })
            .webp({ quality: 82 })
            .toBuffer();
        return { ok: true, data };
    } catch {
        return { ok: false, error: 'invalid' };
    }
}
