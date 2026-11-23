import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { AccountMenu } from '@/components/molecules/account-menu';
import {
    SignedInLinks,
    SignedOutLinks,
} from '@/components/molecules/header-links';
import { HeroActions } from '@/components/molecules/hero-actions';
import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';

import { HomePage } from './home-page';

const meta = {
    title: 'Pages/Home',
    component: HomePage,
    parameters: { layout: 'fullscreen' },
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
                    nav={<SignedInLinks />}
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
