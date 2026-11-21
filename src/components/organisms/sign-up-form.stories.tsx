import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { SignUpForm } from './sign-up-form';

const meta = {
    title: 'Components/Organisms/Sign Up Form',
    component: SignUpForm,
    args: { state: {}, formAction: fn(), pending: false, locale: 'en' },
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
                name: 'required',
                email: 'invalidEmail',
                password: 'passwordTooShort',
                location: 'locationNotFound',
            },
            values: { name: '', email: 'not-an-email', location: 'Zzqx' },
        },
    },
};

export const EmailInUse: Story = {
    args: {
        state: {
            fieldErrors: { email: 'emailInUse' },
            values: {
                name: 'Ada Lovelace',
                email: 'ada@example.com',
                location: 'San Jose, CA',
            },
        },
    },
};

export const ServerError: Story = {
    args: {
        state: {
            formError: 'generic',
            values: {
                name: 'Ada Lovelace',
                email: 'ada@example.com',
                location: 'San Jose, CA',
            },
        },
    },
};

export const Submitting: Story = {
    args: {
        pending: true,
        state: {
            values: {
                name: 'Ada Lovelace',
                email: 'ada@example.com',
                location: 'San Jose, CA',
            },
        },
    },
};
