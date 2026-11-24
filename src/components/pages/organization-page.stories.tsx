import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { AccountMenu } from '@/components/molecules/account-menu';
import {
    SignedInLinks,
    SignedOutLinks,
} from '@/components/molecules/header-links';
import { JoinPanel } from '@/components/organisms/join-panel';
import { sampleProfile } from '@/components/organisms/organization-profile.stories';
import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';

import { OrganizationPage, OrganizationPageLoading } from './organization-page';

const leaders = [
    { uid: 'maya', displayName: 'Maya Thompson', role: 'owner' as const },
    { uid: 'thanh', displayName: 'Thanh Nguyễn', role: 'moderator' as const },
];
const everyone = [
    ...leaders,
    { uid: 'luis', displayName: 'Luis Hernández', role: 'member' as const },
    { uid: 'rosa', displayName: 'Rosa Martínez', role: 'member' as const },
    { uid: 'daniel', displayName: 'Daniel Park', role: 'member' as const },
    { uid: 'linh', displayName: 'Linh Trần', role: 'member' as const },
    { uid: 'wei', displayName: 'Wei Chen', role: 'member' as const },
    { uid: 'aisha', displayName: 'Aisha Bello', role: 'member' as const },
];
const memberJoin = (
    <JoinPanel
        state="member"
        orgId="org1"
        handle="sbma"
        name="South Bay Mutual Aid"
        locale="en"
        formAction={fn()}
    />
);

const meta = {
    title: 'Pages/Organization',
    component: OrganizationPage,
    parameters: { layout: 'fullscreen' },
    args: {
        profile: sampleProfile,
        role: null,
        join: (
            <JoinPanel
                state="request"
                orgId="org1"
                handle="sbma"
                name="South Bay Mutual Aid"
                locale="en"
                formAction={fn()}
            />
        ),
        members: {
            people: leaders,
            total: 8,
            setting: 'members',
        },
    },
    decorators: [
        (Story, { args }) => (
            <>
                <SiteHeader
                    nav={args.role ? <SignedInLinks /> : undefined}
                    account={
                        args.role ? (
                            <AccountMenu
                                name="Ada Lovelace"
                                email="ada@example.com"
                                locale="en"
                                signOutAction={fn()}
                            />
                        ) : (
                            <SignedOutLinks />
                        )
                    }
                />
                <main>
                    <Story />
                </main>
                <SiteFooter />
            </>
        ),
    ],
} satisfies Meta<typeof OrganizationPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A signed-in visitor: Ask to join, and only owners and moderators named. */
export const Public: Story = {};
/** The owner: members' space, Manage members with 2 requests, everyone named. */
export const AsOwner: Story = {
    args: {
        role: 'owner',
        join: memberJoin,
        pendingRequests: 2,
        members: {
            people: everyone,
            total: 8,
            setting: 'members',
            viewerIsMember: true,
        },
    },
};
/** A member of a group that shows names to members. */
export const AsMember: Story = {
    args: {
        role: 'member',
        join: memberJoin,
        members: {
            people: everyone,
            total: 8,
            setting: 'members',
            viewerIsMember: true,
        },
    },
};
export const Loading: Story = { render: () => <OrganizationPageLoading /> };
const unclaimedProfile = {
    ...sampleProfile,
    name: 'Eastside Shower Day',
    handle: 'eastside-shower-day',
    focusAreas: ['hygiene' as const, 'health' as const],
    description:
        'Free hot showers, towels and hygiene kits every Wednesday morning in the church hall. Walk in, no ID needed.',
    memberCount: 0,
    contactEmail: undefined,
    socials: [],
};
/** Added by a super user: the notice and "Claim it" instead of joining and members. */
export const Unclaimed: Story = {
    args: {
        profile: unclaimedProfile,
        join: null,
        unclaimed: { canManage: false },
    },
};
/** A super user viewing it: the edit tools, without being named as owner. */
export const UnclaimedAsSuperUser: Story = {
    args: {
        profile: unclaimedProfile,
        join: null,
        unclaimed: { canManage: true },
    },
};
