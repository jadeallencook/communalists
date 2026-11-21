import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { HeartHandshakeIcon } from 'lucide-react';

import { Button } from './button';

const meta = {
    title: 'UI/Button',
    component: Button,
    args: { children: 'Request aid' },
    argTypes: {
        variant: {
            control: 'select',
            options: [
                'default',
                'secondary',
                'outline',
                'ghost',
                'destructive',
                'link',
            ],
        },
        size: {
            control: 'select',
            options: ['xs', 'sm', 'default', 'lg'],
        },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
    render: (args) => (
        <div className="flex flex-wrap gap-2">
            <Button {...args} variant="default" />
            <Button {...args} variant="secondary" />
            <Button {...args} variant="outline" />
            <Button {...args} variant="ghost" />
            <Button {...args} variant="destructive" />
            <Button {...args} variant="link" />
        </div>
    ),
};

export const WithIcon: Story = {
    render: (args) => (
        <Button {...args}>
            <HeartHandshakeIcon aria-hidden data-icon="inline-start" />
            Volunteer
        </Button>
    ),
};
