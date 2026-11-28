import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SAMPLE_LOGO } from './photo-fixtures';

import { OrganizationCard } from './organization-card';

const meta = {
    title: 'Components/Molecules/Organization Card',
    component: OrganizationCard,
    args: {
        name: 'South Bay Mutual Aid',
        handle: 'sbma',
        focusAreas: ['general', 'food', 'housing'],
        role: 'owner',
    },
    decorators: [
        (Story) => (
            <div className="max-w-xl">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof OrganizationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Owner: Story = {};
export const Member: Story = {
    args: {
        name: 'Oakland Auto Club',
        handle: 'oakland-auto-club',
        focusAreas: ['hobbies', 'transportation'],
        role: 'member',
    },
};
export const NoRole: Story = { args: { role: undefined } };
export const LongName: Story = {
    args: {
        name: 'East San José Community Fridge & Free Store Collective',
        handle: 'east-san-jose-community-fridge',
        focusAreas: ['food'],
    },
};
/** In search results: distance and city instead of the handle. */
export const WithDistance: Story = {
    args: {
        role: undefined,
        detail: '3 mi away · Santa Clara, California',
    },
};
/** Added by a super user and not claimed yet. */
export const Unclaimed: Story = {
    args: {
        role: undefined,
        name: 'Eastside Shower Day',
        handle: 'eastside-shower-day',
        focusAreas: ['hygiene', 'health'],
        detail: '2 mi away · San Jose, California',
        unclaimed: true,
    },
};

export const WithLogo: Story = { args: { photo: SAMPLE_LOGO } };
