import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { AccountMenu } from '@/components/molecules/account-menu';
import {
    SignedInLinks,
    SignedOutLinks,
} from '@/components/molecules/header-links';

import { SiteHeader } from './site-header';

const meta = {
    title: 'Components/Organisms/Site Header',
    component: SiteHeader,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = { args: { account: <SignedOutLinks /> } };

/** On /sign-in, Sign in is marked as the current page. */
export const OnSignInPage: Story = {
    args: { account: <SignedOutLinks current="sign-in" /> },
};

const menu = (
    <AccountMenu
        name="Ada Lovelace"
        email="ada@example.com"
        locale="en"
        signOutAction={fn()}
    />
);

export const SignedIn: Story = {
    args: { nav: <SignedInLinks />, account: menu },
};

export const SignedInOnDashboard: Story = {
    args: { nav: <SignedInLinks current="dashboard" />, account: menu },
};

/** While the session is checked, the account area is empty. */
export const Loading: Story = {};

/** Narrow screens: Create account and Dashboard fold into the menu. */
export const Phone: Story = {
    args: { nav: <SignedInLinks />, account: menu },
    globals: { viewport: { value: 'mobile1' } },
};
