import type { LayoutSpec } from '../layout-spec';

/** Stripe: the headline on a band of colour across the page. */
export const stripe: LayoutSpec = {
    group: 'type',
    regions: [
        {
            height: 'rest',
            start: [
                { role: 'tagline', color: 'accent' },
                { role: 'title', color: 'onAccent', band: 'accent' },
            ],
            end: [
                { role: 'when', color: 'text' },
                { role: 'place', color: 'text' },
                { role: 'details', color: 'text' },
            ],
        },
    ],
};
