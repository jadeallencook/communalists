import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { AccountMenu } from '@/components/molecules/account-menu';
import { NavLinks, SignedOutLinks } from '@/components/molecules/header-links';
import { WithDefinitions } from '@/components/molecules/definition-fixtures';
import { HeroActions } from '@/components/molecules/hero-actions';
import { SiteFooter } from '@/components/organisms/site-footer';
import { signedInLinks } from '@/components/organisms/mobile-nav-fixtures';
import { SiteHeader } from '@/components/organisms/site-header';

import { HomePage } from './home-page';

const meta = {
    title: 'Pages/Home',
    component: HomePage,
    parameters: { layout: 'fullscreen' },
    // Marked words (mutual aid networks, organization…) get their tooltips.
    decorators: [
        (Story) => (
            <WithDefinitions>
                <Story />
            </WithDefinitions>
        ),
    ],
} satisfies Meta<typeof HomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {
    decorators: [
        (Story) => (
            <>
                <SiteHeader account={<SignedOutLinks />} />
                <main>
                    <Story />
                </main>
                <SiteFooter />
            </>
        ),
    ],
};

/** Signed in: one dashboard button in the banner, and no sign-up band. */
export const SignedIn: Story = {
    args: { heroActions: <HeroActions signedIn />, join: null },
    decorators: [
        (Story) => (
            <>
                <SiteHeader
                    nav={<NavLinks links={signedInLinks} />}
                    account={
                        <AccountMenu
                            name="Ada Lovelace"
                            email="ada@example.com"
                            locale="en"
                            signOutAction={fn()}
                        />
                    }
                />
                <main>
                    <Story />
                </main>
                <SiteFooter />
            </>
        ),
    ],
};
