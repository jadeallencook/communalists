import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { SignUpForm } from './sign-up-form';

const meta = {
    title: 'Components/Organisms/Sign Up Form',
    component: SignUpForm,
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
} satisfies Meta<typeof SignUpForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const FieldErrors: Story = {
    args: {
        state: {
            fieldErrors: {
                email: 'invalidEmail',
                password: 'passwordTooShort',
                confirmPassword: 'required',
            },
            values: { email: 'not-an-email' },
        },
    },
};

export const PasswordMismatch: Story = {
    args: {
        state: {
            fieldErrors: { confirmPassword: 'passwordMismatch' },
            values: { email: 'ada@example.com' },
        },
    },
};

export const EmailInUse: Story = {
    args: {
        state: {
            fieldErrors: { email: 'emailInUse' },
            values: { email: 'ada@example.com' },
        },
    },
};

export const ServerError: Story = {
    args: {
        state: { formError: 'generic', values: { email: 'ada@example.com' } },
    },
};

export const Submitting: Story = {
    args: { pending: true, state: { values: { email: 'ada@example.com' } } },
};
