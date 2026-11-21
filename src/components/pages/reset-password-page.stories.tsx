import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { ResetPasswordForm } from '@/components/organisms/reset-password-form';
import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';

import {
    ResetPasswordPage,
    ResetPasswordPageLoading,
} from './reset-password-page';

const meta = {
    title: 'Pages/Reset Password',
    component: ResetPasswordPage,
    parameters: { layout: 'fullscreen' },
    decorators: [
        (Story) => (
            <>
                <SiteHeader />
                <main>
                    <Story />
                </main>
                <SiteFooter />
            </>
        ),
    ],
} satisfies Meta<typeof ResetPasswordPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ValidLink: Story = {
    args: {
        email: 'ada@example.com',
        form: (
            <ResetPasswordForm
                state={{}}
                formAction={fn()}
                locale="en"
                oobCode="sample-code"
                email="ada@example.com"
            />
        ),
    },
};

export const ExpiredLink: Story = { args: { problem: 'expired' } };

export const InvalidLink: Story = { args: { problem: 'invalid' } };

export const Checking: Story = {
    render: () => <ResetPasswordPageLoading />,
};
