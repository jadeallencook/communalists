import type { LayoutSpec } from '../layout-spec';

const words = {
    height: 'rest',
    start: [
        { role: 'tagline', color: 'accent' },
        { role: 'title', color: 'text' },
    ],
    end: [
        { role: 'when', color: 'text' },
        { role: 'place', color: 'text' },
        { role: 'details', color: 'text' },
    ],
} as const;

/** Picture below: the words first, the photo under them, and a coloured strip at the bottom. */
export const photoBelow: LayoutSpec = {
    group: 'photo',
    regions: [
        { ...words, start: [...words.start], end: [...words.end] },
        {
            height: { default: 0.36, square: 0.3, story: 0.4 },
            photo: true,
            minHeight: 0.16,
        },
    ],
    withoutPhoto: [{ ...words, start: [...words.start], end: [...words.end] }],
    footer: { fill: 'accent', color: 'onAccent' },
};
