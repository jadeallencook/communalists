import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { AccountMenu } from './account-menu';

const meta = {
    title: 'Components/Molecules/Account Menu',
    component: AccountMenu,
    args: {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        locale: 'en',
        signOutAction: fn(),
    },
    decorators: [
        (Story) => (
            <div className="flex justify-end p-4">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof AccountMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** With "Your profile" (accounts with a username). */
export const Default: Story = { args: { username: 'ada-lovelace' } };
export const LongNameAndEmail: Story = {
    args: {
        name: 'Maria de los Ángeles Fernández-Villanueva',
        email: 'south.bay.mutual.aid.volunteer.coordinator@example.org',
    },
};
export const ChineseName: Story = { args: { name: '王小明' } };
/** An account that hasn't finished setup: its email stands in for the name. */
export const NoNameYet: Story = {
    args: { name: 'ada@example.com', email: 'ada@example.com' },
};

/** With their organizations listed. */
export const WithOrganizations: Story = {
    args: {
        username: 'ada-lovelace',
        organizations: [
            { name: 'Oakland Auto Club', handle: 'oakland-auto-club' },
            { name: 'South Bay Mutual Aid', handle: 'south-bay-mutual-aid' },
        ],
    },
};
/** More organizations than the menu lists: "See all" goes to the dashboard. */
export const ManyOrganizations: Story = {
    args: {
        username: 'ada-lovelace',
        organizations: [
            { name: 'East Oakland Collective', handle: 'eoc' },
            { name: 'Food Not Bombs San José', handle: 'fnb' },
            { name: 'Oakland Auto Club', handle: 'oac' },
            {
                name: 'Santa Clara County Tenant Union and Mutual Aid Network',
                handle: 'sct',
            },
            { name: 'South Bay Mutual Aid', handle: 'sbma' },
        ],
        moreOrganizations: true,
    },
};
/** Super users also get Admin. */
export const SuperUser: Story = {
    args: { username: 'ada-lovelace', isAdmin: true },
};
