import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { DirectionsMenu } from './directions-menu';

const meta = {
    title: 'Components/Molecules/Directions Menu',
    component: DirectionsMenu,
    args: { address: '749 Story Rd, San Jose, CA 95122' },
    decorators: [
        (Story) => (
            <div className="min-h-64 text-sm">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof DirectionsMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

/** The choice of map apps; each opens in a new tab (or the app). */
export const Open: Story = { args: { defaultOpen: true } };
