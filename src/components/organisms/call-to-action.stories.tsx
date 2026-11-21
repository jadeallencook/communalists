import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@/components/atoms/button';

import { CallToAction } from './call-to-action';

const meta = {
    title: 'Components/Organisms/Call To Action',
    component: CallToAction,
    parameters: { layout: 'fullscreen' },
    args: {
        title: 'Ready to organize?',
        description: "It's free, and it only takes a minute.",
        action: <Button size="lg">Create account</Button>,
    },
} satisfies Meta<typeof CallToAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutDescription: Story = { args: { description: undefined } };
