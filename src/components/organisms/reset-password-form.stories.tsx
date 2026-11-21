import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { ResetPasswordForm } from './reset-password-form';

const meta = {
    title: 'Components/Organisms/Reset Password Form',
    component: ResetPasswordForm,
    args: {
        state: {},
        formAction: fn(),
        pending: false,
        locale: 'en',
        oobCode: 'sample-code',
        email: 'ada@example.com',
    },
    decorators: [
        (Story) => (
            <div className="max-w-md">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ResetPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const TooShort: Story = {
    args: { state: { fieldErrors: { password: 'passwordTooShort' } } },
};

export const Mismatch: Story = {
    args: { state: { fieldErrors: { confirmPassword: 'passwordMismatch' } } },
};

export const ServerError: Story = {
    args: { state: { formError: 'generic' } },
};

export const Submitting: Story = { args: { pending: true } };

/** The code expired or was used while the form was open. */
export const LinkExpiredOnSubmit: Story = {
    args: { state: { linkExpired: true } },
};
