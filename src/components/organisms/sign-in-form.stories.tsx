import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { SignInForm } from './sign-in-form';

const meta = {
    title: 'Components/Organisms/Sign In Form',
    component: SignInForm,
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
} satisfies Meta<typeof SignInForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const FieldErrors: Story = {
    args: {
        state: {
            fieldErrors: { email: 'invalidEmail', password: 'required' },
            values: { email: 'not-an-email' },
        },
    },
};

export const WrongPassword: Story = {
    args: {
        state: {
            formError: 'invalidCredentials',
            values: { email: 'ada@example.com' },
        },
    },
};

export const TooManyAttempts: Story = {
    args: {
        state: {
            formError: 'tooManyAttempts',
            values: { email: 'ada@example.com' },
        },
    },
};

export const Submitting: Story = {
    args: {
        pending: true,
        state: { values: { email: 'ada@example.com' } },
    },
};
