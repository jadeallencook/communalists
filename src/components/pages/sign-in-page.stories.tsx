import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';
import { SignInForm } from '@/components/organisms/sign-in-form';

import { SignInPage } from './sign-in-page';

const meta = {
    title: 'Pages/Sign In',
    component: SignInPage,
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
} satisfies Meta<typeof SignInPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        form: <SignInForm state={{}} formAction={fn()} locale="en" />,
    },
};

export const WrongPassword: Story = {
    args: {
        form: (
            <SignInForm
                state={{
                    formError: 'invalidCredentials',
                    values: { email: 'ada@example.com' },
                }}
                formAction={fn()}
                locale="en"
            />
        ),
    },
};
