import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { FocusArea } from '@/lib/organizations/options';

import { sampleOrgPhoto } from '@/components/molecules/photo-fixtures';

import { OrganizationProfile } from './organization-profile';

export const sampleProfile = {
    name: 'South Bay Mutual Aid',
    handle: 'sbma',
    focusAreas: ['general', 'food', 'housing'] as FocusArea[],
    description:
        'Neighbors helping neighbors across Santa Clara County.\n\nWe deliver groceries, cook community meals and connect people with local resources.',
    place: 'San Jose, California',
    reach: { scope: 'local' as const, radiusMiles: 25 },
    languages: ['en', 'es', 'vi'],
    memberCount: 42,
    website: 'https://southbaymutualaid.org/',
    contactEmail: 'hello@southbaymutualaid.org',
    socials: [
        { platform: 'instagram' as const, handle: 'sbma' },
        { platform: 'facebookGroup' as const, handle: 'southbaymutualaid' },
    ],
};

const meta = {
    title: 'Components/Organisms/Organization Profile',
    component: OrganizationProfile,
    args: sampleProfile,
    decorators: [
        (Story) => (
            <div className="max-w-3xl">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof OrganizationProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Local: Story = {};
export const National: Story = {
    args: { reach: { scope: 'national' }, memberCount: 1 },
};
export const Minimal: Story = {
    args: {
        description: '',
        website: undefined,
        contactEmail: undefined,
        socials: [],
        languages: ['en'],
        memberCount: 1,
    },
};
export const Unlisted: Story = {
    args: {
        unlisted: true,
        focusAreas: ['housing', 'legal'],
        name: 'Tenants of Alum Rock',
        handle: 'alum-rock-tenants',
    },
};
/** Not claimed yet: the label, and no member count. */
export const Unclaimed: Story = {
    args: {
        unclaimed: true,
        name: 'Eastside Shower Day',
        handle: 'eastside-shower-day',
        focusAreas: ['hygiene', 'health'],
        memberCount: 0,
        contactEmail: undefined,
        socials: [],
    },
};
/** With a public street address and a directions link. */
export const WithStreetAddress: Story = {
    args: { streetAddress: '749 Story Rd, San Jose, CA 95122' },
};
/** Every way to reach them: address, phone, email and links, and the year founded. */
export const FullContact: Story = {
    args: {
        streetAddress: '749 Story Rd, San Jose, CA 95122',
        phone: {
            text: '(408) 555-0123 ext. 2',
            href: 'tel:+14085550123;ext=2',
        },
        foundedYear: 1983,
    },
};
/** With a photo. */
export const WithPhoto: Story = { args: { photoUrl: sampleOrgPhoto } };
