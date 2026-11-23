import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';

import { HomePage } from './home-page';

const meta = {
    title: 'Pages/Home',
    component: HomePage,
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
} satisfies Meta<typeof HomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Signed out: "Create account" and "Sign in". */
export const Default: Story = { args: { signedIn: false } };

/** Signed in: one "Go to dashboard" button in place of both. */
export const SignedIn: Story = { args: { signedIn: true } };

/** While the session is checked, the buttons keep their space but stay hidden. */
export const CheckingSession: Story = {};
