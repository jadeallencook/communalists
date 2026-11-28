import type { LayoutSpec } from '../layout-spec';

const info = [
    { role: 'when', color: 'text' },
    { role: 'place', color: 'text' },
    { role: 'details', color: 'text' },
] as const;

const top = { default: 0.44, square: 0.4, story: 0.48 };

/** Picture on top: the photo above the words, or a block of colour holding the headline. */
export const block: LayoutSpec = {
    group: 'photo',
    regions: [
        { height: top, photo: true, minHeight: 0.2 },
        {
            height: 'rest',
            start: [
                { role: 'tagline', color: 'accent' },
                { role: 'title', color: 'accent' },
            ],
            end: [...info],
        },
    ],
    withoutPhoto: [
        {
            height: top,
            fill: 'accent',
            end: [
                { role: 'tagline', color: 'onAccent' },
                { role: 'title', color: 'onAccent' },
            ],
        },
        { height: 'rest', start: [...info] },
    ],
};
