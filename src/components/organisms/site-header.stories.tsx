import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { AccountMenu } from '@/components/molecules/account-menu';
import {
    HeaderLinksPlaceholder,
    NavLinks,
    SignedOutLinks,
} from '@/components/molecules/header-links';

import { MobileNav } from './mobile-nav';
import { account, publicLinks, signedInLinks } from './mobile-nav-fixtures';
import { SiteHeader } from './site-header';

const meta = {
    title: 'Components/Organisms/Site Header',
    component: SiteHeader,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const signedOut = (current?: 'sign-in' | 'sign-up') => (
    <>
        <div className="hidden items-center gap-1 lg:flex">
            <SignedOutLinks current={current} />
        </div>
        <MobileNav links={publicLinks} current={current} />
    </>
);

const signedIn = (
    <>
        <div className="hidden lg:block">
            <AccountMenu {...account} />
        </div>
        <MobileNav links={signedInLinks} account={account} />
    </>
);

export const SignedOut: Story = {
    args: { nav: <NavLinks links={publicLinks} />, account: signedOut() },
};

/** On /sign-in, Sign in is marked as the current page. */
export const OnSignInPage: Story = {
    args: {
        nav: <NavLinks links={publicLinks} />,
        account: signedOut('sign-in'),
    },
};

export const SignedIn: Story = {
    args: { nav: <NavLinks links={signedInLinks} />, account: signedIn },
};

export const SignedInOnDashboard: Story = {
    args: {
        nav: (
            <NavLinks
                links={signedInLinks.map((link) =>
                    link.key === 'dashboard'
                        ? { ...link, current: 'page' }
                        : link
                )}
            />
        ),
        account: signedIn,
    },
};

/** While the session is checked: the public sections, and placeholders for the account area. */
export const Loading: Story = {
    args: {
        nav: <NavLinks links={publicLinks} />,
        account: <HeaderLinksPlaceholder />,
    },
};

/** Phones: wordmark, language, and the Menu button. */
export const Phone: Story = {
    args: { nav: <NavLinks links={signedInLinks} />, account: signedIn },
    globals: { viewport: { value: 'mobile1' } },
};

export const PhoneSignedOut: Story = {
    args: { nav: <NavLinks links={publicLinks} />, account: signedOut() },
    globals: { viewport: { value: 'mobile1' } },
};
