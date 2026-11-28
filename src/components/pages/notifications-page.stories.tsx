import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { sampleNotifications } from '@/components/organisms/notification-fixtures';

import {
    NotificationsPage,
    NotificationsPageLoading,
} from './notifications-page';

const meta = {
    title: 'Pages/Notifications',
    component: NotificationsPage,
    args: { items: sampleNotifications },
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NotificationsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
/** Just accepted a request: it's announced, and its row is gone. */
export const JustAccepted: Story = {
    args: {
        items: sampleNotifications.slice(1),
        notice: "You're comrades now.",
    },
};
export const Empty: Story = { args: { items: [] } };
export const LoadFailed: Story = { args: { items: null } };
export const Loading: Story = { render: () => <NotificationsPageLoading /> };
