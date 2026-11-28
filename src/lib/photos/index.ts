// Profile photos and organization logos: sizes, limits, where the files live
// and how their links are built. Pure (no React, Next or Firebase), so the
// browser, the server and tests share it.
// Design: documentation/features/17-profiles.md → "Photo" (decision #71).
//
// The browser crops the picture to a square and sends a small JPEG (the
// original never leaves the device). The server checks it again and saves
// two WebP files with sharp, which also drops EXIF data such as GPS
// coordinates. Files are read through Firebase download-token links: the
// token is the secret, so a link is only handed to viewers who may see the
// photo, and changing the token (a "rotation") makes copied links stop
// working.

/** Whose picture it is. Also the Storage folder, so never rename. */
export const PHOTO_KINDS = ['users', 'organizations'] as const;
export type PhotoKind = (typeof PHOTO_KINDS)[number];

/** The saved sizes, in pixels (square). `large` for pages, `small` for lists. */
export const PHOTO_SIZES = { large: 500, small: 128 } as const;
export type PhotoSize = keyof typeof PHOTO_SIZES;

/** The square the browser crops to and sends. */
export const CROP_OUTPUT_SIZE = PHOTO_SIZES.large;

/** Largest picture someone can pick. It's only read in the browser. */
export const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

/**
 * Largest cropped upload the server accepts. A 500×500 JPEG is usually
 * 50–200 KB; this stays under Next's 1 MB limit for server actions.
 */
export const MAX_UPLOAD_BYTES = 900 * 1024;

/** What the server accepts from the browser (it re-encodes all of them). */
export const UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/** Smallest and largest side the server accepts; anything else wasn't cropped by us. */
export const MIN_UPLOAD_SIDE = 100;
export const MAX_UPLOAD_SIDE = 2000;

/** A saved photo, as stored on `users/{uid}.photo` and `organizations/{id}.photo`. */
export interface Photo {
    /** Random, new for each upload: part of the file names. */
    id: string;
    /** Download-token links, one per size. */
    large: string;
    small: string;
}

/** Reads a stored photo leniently: anything incomplete is no photo. */
export function photoOf(data: unknown): Photo | undefined {
    const d = (data ?? {}) as Partial<Photo>;
    if (
        typeof d.id !== 'string' ||
        typeof d.large !== 'string' ||
        typeof d.small !== 'string' ||
        !d.id ||
        !d.large ||
        !d.small
    )
        return undefined;
    return { id: d.id, large: d.large, small: d.small };
}

/** Where one size of a photo lives in Storage. */
export function photoPath(
    kind: PhotoKind,
    ownerId: string,
    id: string,
    size: PhotoSize
): string {
    return `photos/${kind}/${ownerId}/${id}-${PHOTO_SIZES[size]}.webp`;
}

/**
 * The download link for a Storage file and token. `host` is
 * https://firebasestorage.googleapis.com, or the emulator's http://host:port.
 */
export function downloadUrl(
    host: string,
    bucket: string,
    path: string,
    token: string
): string {
    return `${host.replace(/\/$/, '')}/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media&token=${encodeURIComponent(token)}`;
}

/** Why an upload is refused before it's decoded, or null if it may go on. */
export type UploadProblem = 'missing' | 'tooLarge' | 'wrongType';

export function uploadProblem(
    file: { size: number; type: string } | null | undefined
): UploadProblem | null {
    if (!file || file.size === 0) return 'missing';
    if (file.size > MAX_UPLOAD_BYTES) return 'tooLarge';
    if (!(UPLOAD_TYPES as readonly string[]).includes(file.type))
        return 'wrongType';
    return null;
}

/**
 * Whether decoded dimensions look like our crop: square (a pixel of
 * rounding allowed) and within the accepted sides.
 */
export function isCroppedSquare(width: number, height: number): boolean {
    return (
        Math.abs(width - height) <= 2 &&
        Math.min(width, height) >= MIN_UPLOAD_SIDE &&
        Math.max(width, height) <= MAX_UPLOAD_SIDE
    );
}

/** Why a picked file can't be cropped, checked in the browser before reading it. */
export type SourceProblem = 'notImage' | 'tooLarge';

export function sourceProblem(file: {
    size: number;
    type: string;
}): SourceProblem | null {
    // Some systems leave the type empty; the decoder decides then.
    if (file.type && !file.type.startsWith('image/')) return 'notImage';
    if (file.size > MAX_SOURCE_BYTES) return 'tooLarge';
    return null;
}

/** A crop in the source picture's pixels, as the cropper reports it. */
export interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Clamps a reported crop to the picture and makes it square, so drawing it
 * never reads outside the image (rounding can put it a pixel over).
 */
export function clampCrop(
    area: CropArea,
    image: { width: number; height: number }
): CropArea {
    const side = Math.max(
        1,
        Math.min(
            Math.round(Math.min(area.width, area.height)),
            image.width,
            image.height
        )
    );
    const x = Math.min(Math.max(0, Math.round(area.x)), image.width - side);
    const y = Math.min(Math.max(0, Math.round(area.y)), image.height - side);
    return { x, y, width: side, height: side };
}
