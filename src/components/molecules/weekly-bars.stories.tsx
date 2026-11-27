import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { WeeklyBars } from './weekly-bars';

const labels = [
    'Sep 5',
    'Sep 12',
    'Sep 19',
    'Sep 26',
    'Oct 3',
    'Oct 10',
    'Oct 17',
    'Oct 24',
    'Oct 31',
    'Nov 7',
    'Nov 14',
    'Nov 21',
];
const weeks = (counts: number[]) =>
    labels.map((label, i) => ({ label, count: counts[i] ?? 0 }));

const meta = {
    title: 'Components/Molecules/WeeklyBars',
    component: WeeklyBars,
    decorators: [
        (Story) => (
            <div className="max-w-sm">
                <Story />
            </div>
        ),
    ],
    args: {
        id: 'story',
        title: 'New accounts per week',
        weeks: weeks([1, 0, 3, 2, 4, 6, 5, 3, 8, 7, 9, 12]),
        summary: '60 in the last 12 weeks, 12 in the latest week.',
        showTable: 'Show as a table',
        weekColumn: 'Week starting',
        countColumn: 'Count',
    },
} satisfies Meta<typeof WeeklyBars>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Growing: Story = {};

export const Empty: Story = {
    args: {
        weeks: weeks([]),
        summary: '0 in the last 12 weeks, 0 in the latest week.',
    },
};

/** An import week: one tall bar, the rest stay readable as small bars. */
export const OneSpike: Story = {
    args: {
        title: 'Organizations added per week',
        weeks: weeks([0, 0, 2, 0, 1, 0, 486, 3, 0, 1, 2, 4]),
        summary: '499 in the last 12 weeks, 4 in the latest week.',
    },
};
