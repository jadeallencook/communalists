// The sizes a graphic can be saved at. Pure data, so adding one (a business
// card, a sticker) is an entry here plus layouts that handle its shape.
// Design: documentation/features/23-graphics.md (decision #75).

export const FORMAT_KEYS = [
    'square',
    'portrait',
    'story',
    'letter',
    'a4',
] as const;
export type FormatKey = (typeof FORMAT_KEYS)[number];

export interface Format {
    /** Pixels of the saved PNG. */
    width: number;
    height: number;
    /** Social posts are seen on screens; print is held at arm's length. */
    use: 'social' | 'print';
    /**
     * Extra pixels on every side that a printer trims off (for business
     * cards and stickers later). Nothing important is drawn there.
     */
    bleed: number;
    /** No background colour (for stickers and shirts later). */
    transparent: boolean;
}

/** Print sizes are 300 dots per inch. */
export const FORMATS: Record<FormatKey, Format> = {
    square: {
        width: 1080,
        height: 1080,
        use: 'social',
        bleed: 0,
        transparent: false,
    },
    portrait: {
        width: 1080,
        height: 1350,
        use: 'social',
        bleed: 0,
        transparent: false,
    },
    story: {
        width: 1080,
        height: 1920,
        use: 'social',
        bleed: 0,
        transparent: false,
    },
    // 8.5 × 11 in
    letter: {
        width: 2550,
        height: 3300,
        use: 'print',
        bleed: 0,
        transparent: false,
    },
    // 210 × 297 mm
    a4: {
        width: 2480,
        height: 3508,
        use: 'print',
        bleed: 0,
        transparent: false,
    },
};

export const isFormatKey = (value: string): value is FormatKey =>
    (FORMAT_KEYS as readonly string[]).includes(value);
