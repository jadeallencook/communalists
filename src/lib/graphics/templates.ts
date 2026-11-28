// Templates: what a graphic is for (a free store, a protest…), the words it
// starts with, and the look it starts with. The words live in the messages
// files (`Graphics.copy`), so they're in every language. Keys are permanent:
// they're in analytics and saved file names.

import type { FormatKey } from './formats';
import type { LayoutKey } from './layouts';
import type { PaletteKey } from './palettes';

export const TEMPLATE_KEYS = [
    'free-store',
    'clothing-swap',
    'protest',
    'ice-watch',
    'garden',
    'event',
] as const;
export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

/**
 * What a template starts with, and what it suggests first. Any layout and
 * colour set works with any template; the first of each is where it starts.
 */
export interface TemplateDefaults {
    layouts: [LayoutKey, ...LayoutKey[]];
    palettes: [PaletteKey, ...PaletteKey[]];
}

export const TEMPLATES: Record<TemplateKey, TemplateDefaults> = {
    'free-store': {
        layouts: ['stripe', 'centered', 'block'],
        palettes: ['rose', 'sun', 'mint'],
    },
    'clothing-swap': {
        layouts: ['block', 'frame', 'stripe'],
        palettes: ['sky', 'grape', 'rose'],
    },
    protest: {
        layouts: ['bold', 'reverse', 'stripe'],
        palettes: ['paper', 'night', 'punk'],
    },
    'ice-watch': {
        layouts: ['stripe', 'reverse', 'bold'],
        palettes: ['night', 'paper', 'ocean'],
    },
    garden: {
        layouts: ['block', 'photo-below', 'centered'],
        palettes: ['garden', 'mint', 'clay'],
    },
    event: {
        layouts: ['bold', 'frame', 'photo-below'],
        palettes: ['sun', 'ocean', 'grape'],
    },
};

/** `suggested` first (in its order), then the rest of `all` (in theirs). */
export function suggestedFirst<K extends string>(
    suggested: readonly K[],
    all: readonly K[]
): { suggested: K[]; rest: K[] } {
    return {
        suggested: [...suggested],
        rest: all.filter((key) => !suggested.includes(key)),
    };
}

export const isTemplateKey = (value: string): value is TemplateKey =>
    (TEMPLATE_KEYS as readonly string[]).includes(value);

/** What people type. Dates and times are the inputs' own formats (`YYYY-MM-DD`, `HH:MM`). */
export interface GraphicContent {
    title: string;
    tagline: string;
    date: string;
    startTime: string;
    endTime: string;
    place: string;
    details: string;
    host: string;
    /** Opened by the QR code. Empty for no code. */
    link: string;
}

export type ContentField = keyof GraphicContent;

/** The words a template fills in for you (the rest start empty). */
export const TEMPLATE_TEXT_FIELDS = ['title', 'tagline', 'details'] as const;
export type TemplateTextField = (typeof TEMPLATE_TEXT_FIELDS)[number];

/** Longest each field can be; more wouldn't fit any layout. */
export const CONTENT_LIMITS: Record<
    Exclude<ContentField, 'date' | 'startTime' | 'endTime'>,
    number
> = {
    title: 60,
    tagline: 100,
    place: 120,
    details: 300,
    host: 80,
    link: 300,
};

export const EMPTY_CONTENT: GraphicContent = {
    title: '',
    tagline: '',
    date: '',
    startTime: '',
    endTime: '',
    place: '',
    details: '',
    host: '',
    link: '',
};

/** The saved file's name: `free-store-square.png`. */
export const fileName = (template: TemplateKey, format: FormatKey) =>
    `${template}-${format}.png`;

/** The editor's steps, in order. */
export const GRAPHIC_STEPS = ['template', 'words', 'pictures', 'look'] as const;
export type GraphicStep = (typeof GRAPHIC_STEPS)[number];

/** Which part of a photo stays when it's cropped to fit. */
export const PHOTO_FOCUS = ['top', 'center', 'bottom'] as const;
export type PhotoFocus = (typeof PHOTO_FOCUS)[number];
