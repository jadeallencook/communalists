import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { AccountSetupForm } from '@/components/organisms/account-setup-form';
import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';

import {
    AccountSetupPage,
    AccountSetupPageLoading,
} from './account-setup-page';

const form = (name?: string) => (
    <AccountSetupForm
        state={{}}
        formAction={fn()}
        locale="en"
        next="/dashboard"
        defaults={{ name, preferredLocale: 'en' }}
        languages={[
            { code: 'en', name: 'English' },
            { code: 'es', name: 'Español' },
            { code: 'vi', name: 'Tiếng Việt' },
            { code: 'zh', name: '中文' },
        ]}
        location={{
            countries: [{ code: 'US', name: 'United States' }],
            country: 'US',
            onCountryChange: fn(),
            query: '',
            onQueryChange: fn(),
            options: [],
            selected: null,
            onSelect: fn(),
        }}
    />
);

const meta = {
    title: 'Pages/Account Setup',
    component: AccountSetupPage,
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
} satisfies Meta<typeof AccountSetupPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AfterSignUp: Story = { args: { variant: 'new', form: form() } };

export const ReturningAccount: Story = {
    args: { variant: 'returning', form: form('Ada Lovelace') },
};

export const Loading: Story = {
    args: { form: null },
    render: () => <AccountSetupPageLoading />,
};
