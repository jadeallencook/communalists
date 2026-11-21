import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@/components/atoms/button';

import { AuthCard } from './auth-card';

const meta = {
    title: 'Components/Organisms/Auth Card',
    component: AuthCard,
    parameters: { layout: 'fullscreen' },
    args: {
        title: 'Sign in',
        description: 'Welcome back. Sign in to your Communalists account.',
        children: <Button className="w-full">Form goes here</Button>,
        footer: {
            prompt: 'New to Communalists?',
            label: 'Create an account',
            href: '/sign-up',
        },
    },
} satisfies Meta<typeof AuthCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TitleOnly: Story = {
    args: { description: undefined, footer: undefined },
};
export const LongText: Story = {
    args: {
        title: 'Choose a new password for your Communalists account',
        description:
            'For south.bay.mutual.aid.volunteer.coordinator@example.org.',
    },
};
