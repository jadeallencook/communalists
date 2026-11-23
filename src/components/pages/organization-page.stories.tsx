import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { AccountMenu } from '@/components/molecules/account-menu';
import {
    SignedInLinks,
    SignedOutLinks,
} from '@/components/molecules/header-links';
import { sampleProfile } from '@/components/organisms/organization-profile.stories';
import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';

import { OrganizationPage, OrganizationPageLoading } from './organization-page';

const meta = {
    title: 'Pages/Organization',
    component: OrganizationPage,
    parameters: { layout: 'fullscreen' },
    args: { profile: sampleProfile, role: null },
    decorators: [
        (Story, { args }) => (
            <>
                <SiteHeader
                    nav={args.role ? <SignedInLinks /> : undefined}
                    account={
                        args.role ? (
                            <AccountMenu
                                name="Ada Lovelace"
                                email="ada@example.com"
                                locale="en"
                                signOutAction={fn()}
                            />
                        ) : (
                            <SignedOutLinks />
                        )
                    }
                />
                <main>
                    <Story />
                </main>
                <SiteFooter />
            </>
        ),
    ],
} satisfies Meta<typeof OrganizationPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** What visitors see. */
export const Public: Story = {};
/** What the owner sees: the profile plus the members' space. */
export const AsOwner: Story = { args: { role: 'owner' } };
export const AsMember: Story = { args: { role: 'member' } };
export const Loading: Story = { render: () => <OrganizationPageLoading /> };
