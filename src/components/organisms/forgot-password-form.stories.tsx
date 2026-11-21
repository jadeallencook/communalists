import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { ForgotPasswordForm } from './forgot-password-form';

const meta = {
    title: 'Components/Organisms/Forgot Password Form',
    component: ForgotPasswordForm,
    args: {
        state: {},
        formAction: fn(),
        pending: false,
        locale: 'en',
    },
    decorators: [
        (Story) => (
            <div className="max-w-md">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ForgotPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const InvalidEmail: Story = {
    args: {
        state: {
            fieldErrors: { email: 'invalidEmail' },
            values: { email: 'not-an-email' },
        },
    },
};

export const TooManyRequests: Story = {
    args: {
        state: {
            formError: 'tooManyAttempts',
            values: { email: 'ada@example.com' },
        },
    },
};

export const Submitting: Story = {
    args: { pending: true, state: { values: { email: 'ada@example.com' } } },
};

export const Sent: Story = {
    args: { state: { sent: true, values: { email: 'ada@example.com' } } },
};

export const SentLongEmail: Story = {
    args: {
        state: {
            sent: true,
            values: {
                email: 'south.bay.mutual.aid.volunteer.coordinator@example.org',
            },
        },
    },
};
