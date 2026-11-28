import type { LayoutSpec } from '../layout-spec';

/** Centered: every line centred, with short rules around the headline. */
export const centered: LayoutSpec = {
    group: 'type',
    regions: [
        {
            height: 'rest',
            center: [
                { role: 'tagline', color: 'accent', align: 'center' },
                { rule: 'accent', align: 'center', width: 0.15 },
                { role: 'title', color: 'text', align: 'center' },
                { rule: 'accent', align: 'center', width: 0.15 },
                { role: 'when', color: 'text', align: 'center' },
                { role: 'place', color: 'text', align: 'center' },
                { role: 'details', color: 'text', align: 'center' },
            ],
        },
    ],
};
