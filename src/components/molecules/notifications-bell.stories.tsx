import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { NotificationsBell } from './notifications-bell';

const meta = {
    title: 'Components/Molecules/Notifications Bell',
    component: NotificationsBell,
    args: { unread: 2 },
} satisfies Meta<typeof NotificationsBell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoNew: Story = {};
export const NothingNew: Story = { args: { unread: 0 } };
/** More than 9 shows "9+"; the link's name still says the number. */
export const Many: Story = { args: { unread: 23 } };
