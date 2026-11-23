import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { AccountMenu } from '@/components/molecules/account-menu';
import { SignedInLinks } from '@/components/molecules/header-links';
import { AccountSetupForm } from '@/components/organisms/account-setup-form';
import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';
import type { AccountSetupState } from '@/lib/validation/account-setup';

import {
    AccountSettingsPage,
    AccountSettingsPageLoading,
} from './account-settings-page';

const form = (state: AccountSetupState = {}) => (
    <AccountSetupForm
        mode="settings"
        state={state}
        formAction={fn()}
        locale="en"
        defaults={{ name: 'Ada Lovelace', preferredLocale: 'es' }}
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
            selected: { id: '5392171', label: 'San Jose, California' },
            onSelect: fn(),
        }}
    />
);

const meta = {
    title: 'Pages/Account Settings',
    component: AccountSettingsPage,
    parameters: { layout: 'fullscreen' },
    args: { email: 'ada@example.com', form: form() },
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
} satisfies Meta<typeof AccountSettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Saved: Story = {
    args: { form: form({ saved: true, values: { name: 'Ada Lovelace' } }) },
};
export const WithErrors: Story = {
    args: {
        form: form({
            fieldErrors: { name: 'required' },
            values: { name: '' },
        }),
    },
};
export const Loading: Story = {
    args: { form: null },
    render: () => <AccountSettingsPageLoading />,
};
