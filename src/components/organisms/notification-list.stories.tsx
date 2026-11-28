import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NotificationList } from './notification-list';
import { sampleNotifications } from './notification-fixtures';

const now = Date.now();
const hour = 60 * 60 * 1000;

const meta = {
    title: 'Components/Organisms/Notification List',
    component: NotificationList,
    args: { items: sampleNotifications },
    decorators: [
        (Story) => (
            <div className="max-w-2xl">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof NotificationList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A request to answer, a new acceptance, and an older one already seen. */
export const Mixed: Story = {};
export const Empty: Story = { args: { items: [] } };
/** The account behind one has been deleted: "Someone", no link. */
export const FormerAccount: Story = {
    args: {
        items: [
            {
                id: 'n4',
                kind: 'comradeAccepted',
                at: now - hour,
                unread: false,
            },
        ],
    },
};
export const OlderHidden: Story = { args: { more: true } };
/** They couldn't be loaded. */
export const LoadFailed: Story = { args: { items: null } };
