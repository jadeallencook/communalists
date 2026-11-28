import type { LayoutSpec } from '../layout-spec';

/** Reverse: the colours flipped, light words on the text colour, with an accent band at the bottom. */
export const reverse: LayoutSpec = {
    group: 'type',
    background: 'text',
    regions: [
        {
            height: 'rest',
            start: [
                { role: 'title', color: 'background', scale: 1.1 },
                { role: 'tagline', color: 'background' },
            ],
            end: [
                { role: 'when', color: 'background' },
                { role: 'place', color: 'background' },
                { role: 'details', color: 'background' },
            ],
        },
    ],
    footer: { fill: 'accent', color: 'onAccent' },
};
