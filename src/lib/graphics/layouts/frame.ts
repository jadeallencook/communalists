import type { LayoutSpec } from '../layout-spec';

/** Framed: a thick border around the page and centred words inside it. */
export const frame: LayoutSpec = {
    group: 'type',
    margin: 0.12,
    decorations: [
        { kind: 'frame', inset: 0.035, thickness: 0.02, color: 'accent' },
    ],
    regions: [
        {
            height: 'rest',
            center: [
                { role: 'title', color: 'accent', align: 'center' },
                { role: 'tagline', color: 'text', align: 'center' },
                { rule: 'text', align: 'center', width: 0.12 },
                { role: 'when', color: 'text', align: 'center' },
                { role: 'place', color: 'text', align: 'center' },
                { role: 'details', color: 'text', align: 'center' },
            ],
        },
    ],
};
