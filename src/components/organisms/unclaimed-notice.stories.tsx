import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { UnclaimedNotice } from './unclaimed-notice';

const meta = {
    title: 'Components/Organisms/Unclaimed Notice',
    component: UnclaimedNotice,
    args: { name: 'Eastside Shower Day', handle: 'eastside-shower-day' },
} satisfies Meta<typeof UnclaimedNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LongName: Story = {
    args: {
        name: 'Saint Vincent de Paul Society of Santa Clara County, Downtown Conference',
    },
};
