import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { SignUpForm } from './sign-up-form';

const location = {
    countries: [{ code: 'US' as const, name: 'United States' }],
    country: 'US' as const,
    onCountryChange: fn(),
    query: '',
    onQueryChange: fn(),
    options: [],
    selected: null,
    onSelect: fn(),
};
const sanJose = { id: '5392171', label: 'San Jose, California' };

const meta = {
    title: 'Components/Organisms/Sign Up Form',
    component: SignUpForm,
    args: {
        state: {},
        formAction: fn(),
        pending: false,
        locale: 'en',
        location,
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
                name: 'required',
                email: 'invalidEmail',
                password: 'passwordTooShort',
                confirmPassword: 'required',
                placeId: 'placeRequired',
            },
            values: { name: '', email: 'not-an-email' },
        },
    },
};

export const PasswordMismatch: Story = {
    args: {
        location: { ...location, selected: sanJose },
        state: {
            fieldErrors: { confirmPassword: 'passwordMismatch' },
            values: {
                name: 'Ada Lovelace',
                email: 'ada@example.com',
            },
        },
    },
};

export const EmailInUse: Story = {
    args: {
        location: { ...location, selected: sanJose },
        state: {
            fieldErrors: { email: 'emailInUse' },
            values: {
                name: 'Ada Lovelace',
                email: 'ada@example.com',
            },
        },
    },
};

export const ServerError: Story = {
    args: {
        location: { ...location, selected: sanJose },
        state: {
            formError: 'generic',
            values: {
                name: 'Ada Lovelace',
                email: 'ada@example.com',
            },
        },
    },
};

export const Submitting: Story = {
    args: {
        location: { ...location, selected: sanJose },
        pending: true,
        state: {
            values: {
                name: 'Ada Lovelace',
                email: 'ada@example.com',
            },
        },
    },
};
