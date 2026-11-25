import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { NearbyOrganizations } from './nearby-organizations';

const meta = {
    title: 'Components/Organisms/Nearby Organizations',
    component: NearbyOrganizations,
    args: {
        place: 'San Jose, California',
        findQuery: { country: 'US', placeId: '5392171', radius: '50' },
        organizations: [
            {
                name: 'Little Saigon Food Pantry',
                handle: 'little-saigon-pantry',
                focusAreas: ['food'],
                detail: 'Also in San Jose, California',
            },
            {
                name: 'Eastside Shower Day',
                handle: 'eastside-shower-day',
                focusAreas: ['hygiene', 'health'],
                detail: 'Also in San Jose, California',
                unclaimed: true,
            },
            {
                name: 'Santa Clara Community Garden',
                handle: 'sc-community-garden',
                focusAreas: ['environment', 'food'],
                detail: '3 mi from here · Santa Clara, California',
            },
            {
                name: 'Oakland Auto Club',
                handle: 'oakland-auto-club',
                focusAreas: ['transportation', 'hobbies'],
                detail: '39 mi from here · Oakland, California',
            },
        ],
    },
} satisfies Meta<typeof NearbyOrganizations>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Up to 4, closest first. */
export const Four: Story = {};
export const One: Story = {
    args: {
        organizations: [
            {
                name: 'Little Saigon Food Pantry',
                handle: 'little-saigon-pantry',
                focusAreas: ['food'],
                detail: 'Also in San Jose, California',
            },
        ],
    },
};
/** Nothing nearby: the section isn't shown at all. */
export const NoneNearby: Story = { args: { organizations: [] } };
