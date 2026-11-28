import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { MobileNav } from './mobile-nav';
import {
    account,
    manyOrganizations,
    publicLinks,
    signedInLinks,
} from './mobile-nav-fixtures';

const meta = {
    title: 'Components/Organisms/Mobile Nav',
    component: MobileNav,
    args: { links: publicLinks, defaultOpen: true },
    // The Menu button only shows below `lg`.
    globals: { viewport: { value: 'mobile1' } },
    decorators: [
        (Story) => (
            <div className="flex justify-end p-4">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof MobileNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Visitors: Create account and Sign in first, then the site's sections. */
export const SignedOut: Story = {};

/** On /find/organizations: Organizations is marked as the current page. */
export const SignedOutOnFind: Story = {
    args: {
        links: [{ ...publicLinks[0], current: 'page' }, publicLinks[1]],
    },
};

export const SignedIn: Story = {
    args: { links: signedInLinks, account },
};

/** No organizations yet, no username (mid-setup): those sections are left out. */
export const SignedInNewAccount: Story = {
    args: {
        links: signedInLinks,
        account: { ...account, organizations: [], username: undefined },
    },
};

/** More organizations than the menu lists: "See all" goes to the dashboard. Long names wrap. */
export const SignedInManyOrganizations: Story = {
    args: {
        links: signedInLinks,
        account: {
            ...account,
            organizations: manyOrganizations,
            moreOrganizations: true,
        },
    },
};

/** Super users also get Admin. */
export const SuperUser: Story = {
    args: { links: signedInLinks, account: { ...account, isAdmin: true } },
};

/** Closed: just the Menu button. */
export const Closed: Story = { args: { defaultOpen: false } };
