import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { LinkProblem } from './link-problem';

const meta = {
    title: 'Components/Molecules/Link Problem',
    component: LinkProblem,
    args: { reason: 'expired' },
    decorators: [
        (Story) => (
            <div className="max-w-md">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof LinkProblem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expired: Story = {};
export const Invalid: Story = { args: { reason: 'invalid' } };
