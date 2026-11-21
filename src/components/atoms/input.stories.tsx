import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Input } from './input';

const meta = {
    title: 'Components/Atoms/Input',
    component: Input,
    args: { placeholder: 'e.g. San Jose, CA', 'aria-label': 'Example input' },
    decorators: [
        (Story) => (
            <div className="max-w-sm">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithValue: Story = { args: { defaultValue: 'Oakland, CA' } };
export const Password: Story = {
    args: { type: 'password', defaultValue: 'secret123' },
};
export const Invalid: Story = {
    args: { 'aria-invalid': true, defaultValue: 'not-an-email' },
};
export const Disabled: Story = {
    args: { disabled: true, defaultValue: 'Disabled' },
};
