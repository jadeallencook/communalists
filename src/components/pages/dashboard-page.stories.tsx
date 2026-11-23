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
    args: { name: 'Ada Lovelace', areaLabel: 'San Jose, California' },
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

export const Default: Story = {};
export const LongName: Story = {
    args: {
        name: 'Maria de los Ángeles Fernández-Villanueva',
        areaLabel: 'Rancho Santa Margarita, California',
    },
};
export const Loading: Story = { render: () => <DashboardPageLoading /> };
