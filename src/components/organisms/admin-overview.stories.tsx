import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { emptyOverview, overview } from './admin-fixtures';
import { AdminOverview } from './admin-overview';

const meta = {
    title: 'Components/Organisms/AdminOverview',
    component: AdminOverview,
    parameters: { layout: 'padded' },
    args: overview,
} satisfies Meta<typeof AdminOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** After a big import: one tall week in "Organizations added". */
export const AfterImport: Story = {};
export const Empty: Story = { args: emptyOverview };
