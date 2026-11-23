import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
    HeaderLinksPlaceholder,
    SignedInLinks,
    SignedOutLinks,
} from './header-links';

const meta = {
    title: 'Components/Molecules/Header Links',
    component: SignedOutLinks,
    decorators: [
        (Story) => (
            <div className="flex items-center gap-1 p-4">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof SignedOutLinks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {};
export const SignedOutOnSignIn: Story = { args: { current: 'sign-in' } };
export const SignedOutOnSignUp: Story = { args: { current: 'sign-up' } };
export const SignedIn: Story = { render: () => <SignedInLinks /> };
export const SignedInOnDashboard: Story = {
    render: () => <SignedInLinks current="dashboard" />,
};
/** While the session is checked. */
export const Loading: Story = { render: () => <HeaderLinksPlaceholder /> };
