import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Skeleton } from './skeleton';

const meta = {
    title: 'Components/Atoms/Skeleton',
    component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = { args: { className: 'h-4 w-64' } };
export const Card: Story = {
    render: () => (
        <div className="flex max-w-sm flex-col gap-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-24 w-full rounded-lg" />
        </div>
    ),
};
