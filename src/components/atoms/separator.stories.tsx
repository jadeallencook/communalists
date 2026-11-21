import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Separator } from './separator';

const meta = {
    title: 'Components/Atoms/Separator',
    component: Separator,
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
    render: () => (
        <div className="max-w-sm">
            <p>Above</p>
            <Separator className="my-4" />
            <p>Below</p>
        </div>
    ),
};

export const Vertical: Story = {
    render: () => (
        <div className="flex h-6 items-center gap-4">
            <span>Requests</span>
            <Separator orientation="vertical" />
            <span>Library</span>
            <Separator orientation="vertical" />
            <span>Calendar</span>
        </div>
    ),
};
