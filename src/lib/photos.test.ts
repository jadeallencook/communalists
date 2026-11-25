import { describe, expect, it } from 'vitest';

import {
    centeredCrop,
    clampCrop,
    cropSourceRect,
    MAX_PHOTO_ZOOM,
    moveCrop,
    photoDimensionsProblem,
    photoFileProblem,
    photoUrl,
    zoomCrop,
} from './photos';

// A landscape photo, 1000×500, in a 200 px viewport: at zoom 1 it shows
// 400×200, so it can slide 200 px sideways and not at all up or down.
const wide = { width: 1000, height: 500, viewport: 200 };

describe('photoUrl', () => {
    it('includes the version so a new photo is never served from cache', () => {
        expect(photoUrl('org', 'abc', 123)).toBe('/api/photos/org/abc?v=123');
    });
    it('is undefined without a photo', () => {
        expect(photoUrl('user', 'abc', undefined)).toBeUndefined();
    });
});

describe('picking a file', () => {
    it('accepts JPEG, PNG and WebP', () => {
        expect(photoFileProblem({ type: 'image/png', size: 1000 })).toBeNull();
    });
    it('rejects other types and huge files', () => {
        expect(photoFileProblem({ type: 'image/gif', size: 10 })).toBe('type');
        expect(photoFileProblem({ type: 'image/heic', size: 10 })).toBe('type');
        expect(
            photoFileProblem({ type: 'image/jpeg', size: 50 * 1024 * 1024 })
        ).toBe('tooBig');
    });
    it('needs enough pixels to look sharp in the circle', () => {
        expect(photoDimensionsProblem(100, 900)).toBe('tooSmall');
        expect(photoDimensionsProblem(128, 128)).toBeNull();
        expect(photoDimensionsProblem(0, 0)).toBe('unreadable');
    });
});

describe('crop', () => {
    it('starts centered at zoom 1', () => {
        expect(centeredCrop(wide)).toEqual({ zoom: 1, x: -100, y: 0 });
    });

    it('never leaves a gap in the circle', () => {
        const start = centeredCrop(wide);
        expect(moveCrop(wide, start, 500, 50)).toEqual({
            zoom: 1,
            x: 0,
            y: 0,
        });
        expect(moveCrop(wide, start, -500, -50)).toEqual({
            zoom: 1,
            x: -200,
            y: 0,
        });
    });

    it('keeps zoom between 1 and the maximum', () => {
        expect(clampCrop(wide, { zoom: 0.2, x: 0, y: 0 }).zoom).toBe(1);
        expect(clampCrop(wide, { zoom: 99, x: 0, y: 0 }).zoom).toBe(
            MAX_PHOTO_ZOOM
        );
    });

    it('zooms around the center', () => {
        const square = { width: 400, height: 400, viewport: 200 };
        const zoomed = zoomCrop(square, centeredCrop(square), 2);
        // Shown at 400 px in a 200 px viewport, centered: the middle half.
        expect(zoomed).toEqual({ zoom: 2, x: -100, y: -100 });
        expect(cropSourceRect(square, zoomed)).toEqual({
            sx: 100,
            sy: 100,
            size: 200,
        });
    });

    it('maps the viewport back to the original photo', () => {
        expect(cropSourceRect(wide, centeredCrop(wide))).toEqual({
            sx: 250,
            sy: 0,
            size: 500,
        });
        expect(cropSourceRect(wide, { zoom: 1, x: 0, y: 0 })).toEqual({
            sx: 0,
            sy: 0,
            size: 500,
        });
    });
});
