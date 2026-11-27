import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { AccountMenu } from '@/components/molecules/account-menu';
import {
    SignedInLinks,
    SignedOutLinks,
} from '@/components/molecules/header-links';
import { HeroSearch } from '@/components/organisms/hero-search';
import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';

import { HomePage } from './home-page';

const location = {
    countries: [{ code: 'US' as const, name: 'United States' }],
    country: 'US' as const,
    onCountryChange: fn(),
    query: '',
    onQueryChange: fn(),
    options: [],
    onSelect: fn(),
};

const search = (city: { id: string; label: string } | null) => (
    <HeroSearch
        action="/en/find"
        focusArea={{
            options: [
                { value: 'food', label: 'Food' },
                { value: 'housing', label: 'Housing' },
                { value: 'health', label: 'Health' },
                { value: 'general', label: 'General' },
                { value: 'education', label: 'Education' },
                { value: 'legal', label: 'Legal' },
            ],
            shown: 4,
            selected: null,
            onSelect: fn(),
        }}
        location={{ ...location, selected: city }}
        onSubmit={(event) => event.preventDefault()}
    />
);

const meta = {
    title: 'Pages/Home',
    component: HomePage,
    args: { heroSearch: search(null) },
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

/** Signed in: the search starts on the profile's city, and no sign-up band. */
export const SignedIn: Story = {
    args: {
        heroSearch: search({ id: '5378538', label: 'Oakland, California' }),
        join: null,
    },
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
