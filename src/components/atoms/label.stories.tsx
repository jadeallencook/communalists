import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Input } from './input';
import { Label } from './label';

const meta = {
    title: 'Components/Atoms/Label',
    component: Label,
    args: { children: 'Email', htmlFor: 'label-demo' },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithInput: Story = {
    render: (args) => (
        <div className="flex max-w-sm flex-col gap-2">
            <Label {...args} />
            <Input id="label-demo" type="email" />
        </div>
    ),
};
