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

export const Default: Story = {};
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
