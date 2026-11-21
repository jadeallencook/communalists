import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { ForgotPasswordForm } from '@/components/organisms/forgot-password-form';
import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';

import { ForgotPasswordPage } from './forgot-password-page';

const meta = {
    title: 'Pages/Forgot Password',
    component: ForgotPasswordPage,
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
} satisfies Meta<typeof ForgotPasswordPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        form: <ForgotPasswordForm state={{}} formAction={fn()} locale="en" />,
    },
};

export const Sent: Story = {
    args: {
        form: (
            <ForgotPasswordForm
                state={{ sent: true, values: { email: 'ada@example.com' } }}
                formAction={fn()}
                locale="en"
            />
        ),
    },
};
