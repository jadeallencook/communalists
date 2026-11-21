import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';
import { SignUpForm } from '@/components/organisms/sign-up-form';

import { SignUpPage } from './sign-up-page';

const meta = {
    title: 'Pages/Sign Up',
    component: SignUpPage,
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
} satisfies Meta<typeof SignUpPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        form: <SignUpForm state={{}} formAction={fn()} locale="en" />,
    },
};

export const WithErrors: Story = {
    args: {
        form: (
            <SignUpForm
                state={{
                    fieldErrors: { email: 'emailInUse' },
                    values: { email: 'ada@example.com' },
                }}
                formAction={fn()}
                locale="en"
            />
        ),
    },
};
