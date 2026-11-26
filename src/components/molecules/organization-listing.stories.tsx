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
        servesWithin: { miles: 25, place: 'San Jose, California' },
        foundedYear: 2020,
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

/** Collapsed, as results first appear. The top (name underlined) opens the page; **Show details** opens the drawer, which ends with **Open page**. */
export const Collapsed: Story = {};

export const Expanded: Story = { args: { defaultOpen: true } };

/** Unclaimed: not labelled in results, and no member count (nobody has joined yet). */
export const Unclaimed: Story = {
    args: {
        name: 'Alameda County Community Food Bank',
        handle: 'accfb',
        focusAreas: ['food'],
        detail: 'In Oakland, California',
        unclaimed: true,
        servesWithin: undefined,
        foundedYear: undefined,
        memberCount: 0,
        defaultOpen: true,
    },
};

export const NoDescription: Story = {
    args: {
        description: '',
        languages: [],
        servesWithin: undefined,
        foundedYear: undefined,
        socials: [],
        website: undefined,
        defaultOpen: true,
    },
};

/** Long descriptions are cut at four lines. Tap the text or **Read more** to see the rest. */
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
