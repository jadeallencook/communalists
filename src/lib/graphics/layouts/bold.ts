import type { LayoutSpec } from '../layout-spec';

/** Big words: a huge headline, the details at the bottom, a bar of colour on top. */
export const bold: LayoutSpec = {
    group: 'type',
    decorations: [{ kind: 'rect', x: 0, y: 0, w: 1, h: 0.02, color: 'accent' }],
    regions: [
        {
            height: 'rest',
            start: [
                { role: 'tagline', color: 'accent' },
                { role: 'title', color: 'text' },
            ],
            end: [
                { rule: 'accent' },
                { role: 'when', color: 'text' },
                { role: 'place', color: 'text' },
                { role: 'details', color: 'text' },
            ],
        },
    ],
};
