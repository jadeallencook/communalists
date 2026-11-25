// Photos for organizations and profiles: sizes, addresses and the crop math
// the photo editor uses. Pure (no React, Next or Firebase), so the browser,
// the server and a future native app share it. Design:
// documentation/features/19-photos.md (decision #42).

/** Whose photo it is. Part of the stored id and the URL; never rename. */
export const PHOTO_KINDS = ['org', 'user'] as const;
export type PhotoKind = (typeof PHOTO_KINDS)[number];

/**
 * The stored photo: a square this many pixels wide. Photos are shown in
 * circles of 28 to 64 CSS pixels, so this stays sharp on high-density
 * screens without being bigger than it needs to be.
 */
export const PHOTO_SIZE = 256;
/** What the browser sends after cropping (the server shrinks it to PHOTO_SIZE). */
export const PHOTO_UPLOAD_SIZE = 512;
/** The most the server accepts for one upload (under the 1 MB server action limit). */
export const MAX_PHOTO_UPLOAD_BYTES = 900 * 1024;
/** Files people can pick. Browsers decode these everywhere. */
export const PHOTO_PICK_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
/** The largest original file the editor opens (it never leaves the device). */
export const MAX_PHOTO_PICK_BYTES = 20 * 1024 * 1024;
/** The shortest side an original needs, so the photo isn't blurry in its circle. */
export const MIN_PHOTO_SIDE = 128;
/** How far the editor zooms in. 1 = the photo just covers the circle. */
export const MAX_PHOTO_ZOOM = 4;

export function isPhotoKind(value: string): value is PhotoKind {
    return (PHOTO_KINDS as readonly string[]).includes(value);
}

/** The stored document's id: `photos/{kind}_{id}`. */
export const photoDocId = (kind: PhotoKind, id: string) => `${kind}_${id}`;

/**
 * Where a photo is served. `version` (when it was saved, epoch ms) changes
 * with every new photo, so browsers never show an old one from their cache.
 */
export function photoUrl(
    kind: PhotoKind,
    id: string,
    version: number | undefined
): string | undefined {
    if (!version) return undefined;
    return `/api/photos/${kind}/${encodeURIComponent(id)}?v=${version}`;
}

/** Why a picked file can't be used, checked in the browser before cropping. */
export type PhotoPickProblem = 'type' | 'tooBig' | 'tooSmall' | 'unreadable';

export function photoFileProblem(file: {
    type: string;
    size: number;
}): PhotoPickProblem | null {
    if (!PHOTO_PICK_TYPES.includes(file.type)) return 'type';
    if (file.size > MAX_PHOTO_PICK_BYTES) return 'tooBig';
    return null;
}

export function photoDimensionsProblem(
    width: number,
    height: number
): PhotoPickProblem | null {
    if (!width || !height) return 'unreadable';
    return Math.min(width, height) < MIN_PHOTO_SIDE ? 'tooSmall' : null;
}

// --- Cropping. The editor shows the photo in a square `viewport` (CSS px)
// with a circle over it. `zoom` 1 means the photo's shorter side just fills
// the viewport; `x` and `y` are where the photo's top-left corner sits,
// relative to the viewport's top-left (so they're 0 or negative).

export interface PhotoCrop {
    zoom: number;
    x: number;
    y: number;
}

export interface CropFrame {
    /** The photo's natural size in pixels. */
    width: number;
    height: number;
    /** The square viewport's size in CSS pixels. */
    viewport: number;
}

/** Display pixels per photo pixel at this zoom. */
export const cropScale = (frame: CropFrame, zoom: number) =>
    (frame.viewport / Math.min(frame.width, frame.height)) * zoom;

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

/** Keeps the zoom in range and the photo covering the whole viewport. */
export function clampCrop(frame: CropFrame, crop: PhotoCrop): PhotoCrop {
    const zoom = clamp(crop.zoom, 1, MAX_PHOTO_ZOOM);
    const scale = cropScale(frame, zoom);
    const minX = frame.viewport - frame.width * scale;
    const minY = frame.viewport - frame.height * scale;
    return {
        zoom,
        x: clamp(crop.x, minX, 0),
        y: clamp(crop.y, minY, 0),
    };
}

/** The starting crop: zoom 1, photo centered. */
export function centeredCrop(frame: CropFrame): PhotoCrop {
    const scale = cropScale(frame, 1);
    return clampCrop(frame, {
        zoom: 1,
        x: (frame.viewport - frame.width * scale) / 2,
        y: (frame.viewport - frame.height * scale) / 2,
    });
}

/** Moves the photo by (dx, dy) CSS pixels. */
export function moveCrop(
    frame: CropFrame,
    crop: PhotoCrop,
    dx: number,
    dy: number
): PhotoCrop {
    return clampCrop(frame, { ...crop, x: crop.x + dx, y: crop.y + dy });
}

/** Zooms around the viewport's center, so what's in the middle stays there. */
export function zoomCrop(
    frame: CropFrame,
    crop: PhotoCrop,
    zoom: number
): PhotoCrop {
    const next = clamp(zoom, 1, MAX_PHOTO_ZOOM);
    const ratio = cropScale(frame, next) / cropScale(frame, crop.zoom);
    const center = frame.viewport / 2;
    return clampCrop(frame, {
        zoom: next,
        x: center - (center - crop.x) * ratio,
        y: center - (center - crop.y) * ratio,
    });
}

/** The square of the original photo (in photo pixels) the viewport shows. */
export function cropSourceRect(
    frame: CropFrame,
    crop: PhotoCrop
): { sx: number; sy: number; size: number } {
    const scale = cropScale(frame, crop.zoom);
    const size = Math.min(frame.viewport / scale, frame.width, frame.height);
    return {
        sx: clamp(-crop.x / scale, 0, frame.width - size),
        sy: clamp(-crop.y / scale, 0, frame.height - size),
        size,
    };
}

/** What saving or removing a photo returns to the editor. */
export type PhotoSaveError =
    'tooBig' | 'invalid' | 'tooSmall' | 'notAllowed' | 'generic';
export type PhotoSaveResult =
    { ok: true; removed: boolean } | { ok: false; error: PhotoSaveError };

/** The editor sends `photo` (the cropped file) or `remove=1`. */
export const PHOTO_FIELD = 'photo';
