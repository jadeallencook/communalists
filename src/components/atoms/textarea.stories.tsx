import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Textarea } from './textarea';

const meta = {
    title: 'Components/Atoms/Textarea',
    component: Textarea,
    args: {
        placeholder: 'What can we help with?',
        'aria-label': 'Example textarea',
    },
    decorators: [
        (Story) => (
            <div className="max-w-sm">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Invalid: Story = { args: { 'aria-invalid': true } };
export const Disabled: Story = {
    args: { disabled: true, defaultValue: 'Read only' },
};
