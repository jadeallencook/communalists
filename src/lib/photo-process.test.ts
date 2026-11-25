// @vitest-environment node
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import { processPhoto } from './photo-process';
import { MAX_PHOTO_UPLOAD_BYTES, PHOTO_SIZE } from './photos';

const image = (width: number, height: number, format: 'png' | 'jpeg' | 'gif') =>
    sharp({
        create: {
            width,
            height,
            channels: 3,
            background: { r: 200, g: 80, b: 40 },
        },
    })
        .toFormat(format)
        .toBuffer();

describe('processPhoto', () => {
    it('makes a square WebP of the stored size', async () => {
        const result = await processPhoto(await image(800, 600, 'png'));
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        const meta = await sharp(result.data).metadata();
        expect(meta.format).toBe('webp');
        expect(meta.width).toBe(PHOTO_SIZE);
        expect(meta.height).toBe(PHOTO_SIZE);
    });

    it('drops EXIF data such as where the photo was taken', async () => {
        const withExif = await sharp(await image(400, 400, 'jpeg'))
            .withExif({ IFD0: { Copyright: 'Somewhere private' } })
            .jpeg()
            .toBuffer();
        expect((await sharp(withExif).metadata()).exif).toBeDefined();
        const result = await processPhoto(withExif);
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect((await sharp(result.data).metadata()).exif).toBeUndefined();
    });

    it('rejects other formats, however they were labeled', async () => {
        expect(await processPhoto(await image(400, 400, 'gif'))).toEqual({
            ok: false,
            error: 'invalid',
        });
        expect(
            await processPhoto(new TextEncoder().encode('<svg></svg>'))
        ).toEqual({ ok: false, error: 'invalid' });
    });

    it('rejects photos too small to look sharp', async () => {
        expect(await processPhoto(await image(100, 400, 'png'))).toEqual({
            ok: false,
            error: 'tooSmall',
        });
    });

    it('rejects uploads over the limit before decoding them', async () => {
        expect(
            await processPhoto(new Uint8Array(MAX_PHOTO_UPLOAD_BYTES + 1))
        ).toEqual({ ok: false, error: 'tooBig' });
    });
});
