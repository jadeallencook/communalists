import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';
import { AccountMenu } from '@/components/molecules/account-menu';
import { fn } from 'storybook/test';

import { DashboardPage, DashboardPageLoading } from './dashboard-page';

const meta = {
    title: 'Pages/Dashboard',
    component: DashboardPage,
    parameters: { layout: 'fullscreen' },
    args: {
        name: 'Ada Lovelace',
        areaLabel: 'San Jose, California',
        organizations: [],
        canCreate: true,
    },
    decorators: [
        (Story) => (
            <>
                <SiteHeader
                    account={
                        <AccountMenu
                            name="Ada Lovelace"
                            email="ada@example.com"
                            locale="en"
                            signOutAction={fn()}
                        />
                    }
                />
                <main>
                    <Story />
                </main>
                <SiteFooter />
            </>
        ),
    ],
} satisfies Meta<typeof DashboardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** New user: nothing joined yet, so the empty state leads with Create. */
export const NoOrganizations: Story = {};

export const WithOrganizations: Story = {
    args: {
        organizations: [
            {
                name: 'Oakland Auto Club',
                handle: 'oakland-auto-club',
                focusAreas: ['hobbies', 'transportation'],
                role: 'member',
            },
            {
                name: 'South Bay Mutual Aid',
                handle: 'sbma',
                focusAreas: ['general', 'food'],
                role: 'owner',
            },
            {
                name: 'Tenants of Alum Rock',
                handle: 'alum-rock-tenants',
                focusAreas: ['housing'],
                role: 'moderator',
            },
        ],
    },
};

/** Owns the most organizations allowed: no Create button, and a note why. */
export const AtOwnershipLimit: Story = {
    args: {
        canCreate: false,
        organizations: [
            {
                name: 'South Bay Mutual Aid',
                handle: 'sbma',
                focusAreas: ['general', 'food'],
                role: 'owner',
            },
        ],
    },
};

export const LongName: Story = {
    args: {
        name: 'Maria de los Ángeles Fernández-Villanueva',
        areaLabel: 'Rancho Santa Margarita, California',
    },
};

export const Loading: Story = { render: () => <DashboardPageLoading /> };
