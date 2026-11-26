import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { OrganizationListing } from './organization-listing';

const meta = {
    title: 'Components/Molecules/Organization Listing',
    component: OrganizationListing,
    args: {
        name: 'South Bay Mutual Aid',
        handle: 'sbma',
        focusAreas: ['general', 'food', 'housing'],
        detail: '3 mi away · San Jose, California',
        description:
            'Neighbors helping neighbors in San José. We run a weekly grocery share, help people find housing, and give rides to appointments.',
        languages: ['en', 'es', 'vi'],
        joinPolicy: 'request',
        memberCount: 42,
        website: 'https://www.southbaymutualaid.org',
        socials: [
            { platform: 'instagram', handle: 'sbma' },
            { platform: 'facebook', handle: 'southbaymutualaid' },
        ],
    },
    decorators: [
        (Story) => (
            <div className="max-w-2xl">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof OrganizationListing>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Collapsed, as results first appear. The top opens the page; the bar under it opens the details. */
export const Collapsed: Story = {};

export const Expanded: Story = { args: { defaultOpen: true } };

/** Unclaimed: labelled, and no member count (nobody has joined yet). */
export const Unclaimed: Story = {
    args: {
        name: 'Alameda County Community Food Bank',
        handle: 'accfb',
        focusAreas: ['food'],
        detail: 'In Oakland, California',
        unclaimed: true,
        joinPolicy: 'open',
        memberCount: 0,
        defaultOpen: true,
    },
};

export const NoDescription: Story = {
    args: {
        description: '',
        languages: [],
        socials: [],
        website: undefined,
        defaultOpen: true,
    },
};

/** Long descriptions are cut at four lines; the full text is on the page. */
export const LongText: Story = {
    args: {
        name: 'East San José Community Fridge & Free Store Collective',
        handle: 'east-san-jose-community-fridge',
        description: Array(12)
            .fill(
                'We keep the fridge stocked and the free store open every day.'
            )
            .join(' '),
        defaultOpen: true,
    },
};
