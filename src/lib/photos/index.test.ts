import { describe, expect, it } from 'vitest';

import {
    clampCrop,
    downloadUrl,
    isCroppedSquare,
    MAX_SOURCE_BYTES,
    MAX_UPLOAD_BYTES,
    photoOf,
    photoPath,
    sourceProblem,
    uploadProblem,
} from './index';

describe('photoOf', () => {
    it('reads a complete photo', () => {
        expect(photoOf({ id: 'a', large: 'L', small: 'S', extra: 1 })).toEqual({
            id: 'a',
            large: 'L',
            small: 'S',
        });
    });

    it('treats anything incomplete as no photo', () => {
        expect(photoOf(undefined)).toBeUndefined();
        expect(photoOf({ id: 'a', large: 'L' })).toBeUndefined();
        expect(photoOf({ id: '', large: 'L', small: 'S' })).toBeUndefined();
    });
});

describe('Storage paths and links', () => {
    it('names files by kind, owner, upload id and size', () => {
        expect(photoPath('users', 'u1', 'abc', 'large')).toBe(
            'photos/users/u1/abc-500.webp'
        );
        expect(photoPath('organizations', 'o1', 'abc', 'small')).toBe(
            'photos/organizations/o1/abc-128.webp'
        );
    });

    it('builds a download-token link, encoding the path', () => {
        expect(
            downloadUrl(
                'https://firebasestorage.googleapis.com/',
                'b.firebasestorage.app',
                'photos/users/u1/abc-500.webp',
                't-1'
            )
        ).toBe(
            'https://firebasestorage.googleapis.com/v0/b/b.firebasestorage.app/o/photos%2Fusers%2Fu1%2Fabc-500.webp?alt=media&token=t-1'
        );
    });
});

describe('uploadProblem', () => {
    const file = (size: number, type = 'image/jpeg') => ({ size, type });

    it('accepts a small JPEG, PNG or WebP', () => {
        expect(uploadProblem(file(80_000))).toBeNull();
        expect(uploadProblem(file(80_000, 'image/png'))).toBeNull();
        expect(uploadProblem(file(80_000, 'image/webp'))).toBeNull();
    });

    it('refuses missing, too large and other types', () => {
        expect(uploadProblem(null)).toBe('missing');
        expect(uploadProblem(file(0))).toBe('missing');
        expect(uploadProblem(file(MAX_UPLOAD_BYTES + 1))).toBe('tooLarge');
        expect(uploadProblem(file(10, 'image/svg+xml'))).toBe('wrongType');
        expect(uploadProblem(file(10, 'image/gif'))).toBe('wrongType');
    });
});

describe('sourceProblem', () => {
    it('lets any image through, and files with no type', () => {
        expect(sourceProblem({ size: 5_000_000, type: 'image/heic' })).toBe(
            null
        );
        expect(sourceProblem({ size: 5_000_000, type: '' })).toBeNull();
    });

    it('refuses other files and huge ones', () => {
        expect(sourceProblem({ size: 10, type: 'application/pdf' })).toBe(
            'notImage'
        );
        expect(
            sourceProblem({ size: MAX_SOURCE_BYTES + 1, type: 'image/jpeg' })
        ).toBe('tooLarge');
    });
});

describe('isCroppedSquare', () => {
    it('accepts squares, allowing rounding', () => {
        expect(isCroppedSquare(500, 500)).toBe(true);
        expect(isCroppedSquare(500, 499)).toBe(true);
    });

    it('refuses other shapes and sizes', () => {
        expect(isCroppedSquare(500, 400)).toBe(false);
        expect(isCroppedSquare(50, 50)).toBe(false);
        expect(isCroppedSquare(4000, 4000)).toBe(false);
    });
});

describe('clampCrop', () => {
    const image = { width: 1000, height: 600 };

    it('rounds and squares the crop', () => {
        expect(
            clampCrop({ x: 10.4, y: 20.6, width: 300.2, height: 299.7 }, image)
        ).toEqual({ x: 10, y: 21, width: 300, height: 300 });
    });

    it('keeps the crop inside the picture', () => {
        expect(
            clampCrop({ x: 900, y: -3, width: 601, height: 601 }, image)
        ).toEqual({ x: 400, y: 0, width: 600, height: 600 });
    });
});
