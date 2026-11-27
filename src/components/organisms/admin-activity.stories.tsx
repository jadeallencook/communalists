import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { AdminActivity } from './admin-activity';
import { activity } from './admin-fixtures';

const meta = {
    title: 'Components/Organisms/AdminActivity',
    component: AdminActivity,
    parameters: { layout: 'padded' },
    args: activity,
} satisfies Meta<typeof AdminActivity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Busy: Story = {};

export const Quiet: Story = {
    args: {
        activity: {
            added: 0,
            edited: 0,
            claims: 0,
            lifecycle: 0,
            words: 0,
            exports: 0,
        },
        log: [],
    },
};

export const Unavailable: Story = { args: { activity: null, log: null } };
