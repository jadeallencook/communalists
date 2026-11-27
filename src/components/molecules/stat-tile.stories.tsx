import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { StatTile } from './stat-tile';

const meta = {
    title: 'Components/Molecules/StatTile',
    component: StatTile,
    decorators: [
        (Story) => (
            <dl className="grid max-w-xs">
                <Story />
            </dl>
        ),
    ],
    args: { label: 'Active organizations', value: '512' },
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = {};

export const WithDetail: Story = {
    args: { detail: '486 unclaimed · 7 deleted' },
};

export const Up: Story = {
    args: {
        label: 'New accounts, last 30 days',
        value: '42',
        comparison: { text: 'Up 12 from the 30 days before', trend: 'up' },
    },
};

export const Down: Story = {
    args: {
        label: 'Claim requests, last 30 days',
        value: '3',
        comparison: { text: 'Down 2 from the 30 days before', trend: 'down' },
        detail: 'All time: 14 approved · 3 denied',
    },
};

export const Same: Story = {
    args: {
        value: '0',
        comparison: { text: 'Same from the 30 days before', trend: 'same' },
    },
};

export const LongText: Story = {
    args: {
        label: 'Páginas del equipo reclamadas en los últimos treinta días',
        value: '12 %',
        detail: '58 de 486 · 4 en los últimos 30 días, con una nota más larga',
    },
};
