import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';

import {
    OrganizationMembersPage,
    OrganizationMembersPageLoading,
} from './organization-members-page';

const day = 86_400_000;
const now = Date.UTC(2026, 10, 23);

const meta = {
    title: 'Pages/Organization Members',
    component: OrganizationMembersPage,
    parameters: { layout: 'fullscreen' },
    args: {
        orgId: 'org1',
        name: 'South Bay Mutual Aid',
        handle: 'sbma',
        locale: 'en',
        formAction: fn(),
        requests: [
            {
                uid: 'marcus',
                displayName: 'Marcus Johnson',
                since: now - 2 * day,
            },
            { uid: 'priya', displayName: 'Priya Patel', since: now - day },
        ],
        members: [
            {
                uid: 'maya',
                displayName: 'Maya Thompson',
                role: 'owner',
                since: now - 90 * day,
                canAct: false,
            },
            {
                uid: 'thanh',
                displayName: 'Thanh Nguyễn',
                role: 'moderator',
                since: now - 80 * day,
                canAct: true,
            },
            {
                uid: 'luis',
                displayName: 'Luis Hernández',
                role: 'member',
                since: now - 30 * day,
                canAct: true,
            },
            {
                uid: 'rosa',
                displayName: 'Rosa Martínez',
                role: 'member',
                since: now - 10 * day,
                canAct: true,
            },
        ],
        banned: [
            {
                uid: 'spam',
                displayName: 'Free Crypto',
                since: now - 5 * day,
                reason: 'Posted ads in the requests board three times.',
            },
        ],
        log: [
            {
                id: '1',
                action: 'ban',
                actorName: 'Maya Thompson',
                targetName: 'Free Crypto',
                reason: 'Posted ads in the requests board three times.',
                at: now - 5 * day,
            },
            {
                id: '2',
                action: 'approve',
                actorName: 'Thanh Nguyễn',
                targetName: 'Rosa Martínez',
                at: now - 10 * day,
            },
        ],
    },
    decorators: [
        (Story) => (
            <>
                <SiteHeader />
                <main>
                    <Story />
                </main>
                <SiteFooter />
            </>
        ),
    ],
} satisfies Meta<typeof OrganizationMembersPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Seen by the owner: can act on the moderator and members, not on themself. */
export const AsOwner: Story = {};
/** Seen by a moderator: can't act on the owner or other moderators. */
export const AsModerator: Story = {
    args: {
        members: [
            {
                uid: 'maya',
                displayName: 'Maya Thompson',
                role: 'owner',
                since: now - 90 * day,
                canAct: false,
            },
            {
                uid: 'thanh',
                displayName: 'Thanh Nguyễn',
                role: 'moderator',
                since: now - 80 * day,
                canAct: false,
            },
            {
                uid: 'luis',
                displayName: 'Luis Hernández',
                role: 'member',
                since: now - 30 * day,
                canAct: true,
            },
        ],
    },
};
/** Nothing to do yet. */
export const Quiet: Story = {
    args: { requests: [], banned: [], log: [] },
};
export const AfterAction: Story = { args: { notice: 'Approved.' } };
export const WithError: Story = {
    args: { error: "You can't do that to this person." },
};
export const Loading: Story = {
    render: () => <OrganizationMembersPageLoading />,
};
