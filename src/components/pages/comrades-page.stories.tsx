import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { manyComrades } from '@/components/organisms/profile-fixtures';

import { ComradesPage, ComradesPageLoading } from './comrades-page';

const meta = {
    title: 'Pages/Comrades',
    component: ComradesPage,
    args: {
        name: 'Maya Thompson',
        username: 'maya-thompson',
        comrades: manyComrades,
    },
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ComradesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
/** Nobody this viewer may see. */
export const Empty: Story = { args: { comrades: [] } };
/** Their profile or list is private to this viewer. */
export const Private: Story = { args: { comrades: null } };
export const LoadFailed: Story = { args: { comrades: [], loadFailed: true } };
export const Loading: Story = { render: () => <ComradesPageLoading /> };
