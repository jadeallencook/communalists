import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { AccountMenu } from '@/components/molecules/account-menu';
import { NavLinks } from '@/components/molecules/header-links';
import { CreateOrganizationForm } from '@/components/organisms/create-organization-form';
import { languageOptions } from '@/components/organisms/create-organization-form.stories';
import { SiteFooter } from '@/components/organisms/site-footer';
import { signedInLinks } from '@/components/organisms/mobile-nav-fixtures';
import { SiteHeader } from '@/components/organisms/site-header';

import {
    CreateOrganizationPage,
    CreateOrganizationPageLoading,
} from './create-organization-page';

const form = (
    <CreateOrganizationForm
        state={{}}
        formAction={fn()}
        locale="en"
        name=""
        onNameChange={fn()}
        handle=""
        onHandleChange={fn()}
        handleStatus={{ state: 'empty' }}
        focusAreas={[]}
        onFocusAreasChange={fn()}
        reach="local"
        onReachChange={fn()}
        socials={[]}
        onSocialsChange={fn()}
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
        languageOptions={languageOptions}
    />
);

const meta = {
    title: 'Pages/Create Organization',
    component: CreateOrganizationPage,
    parameters: { layout: 'fullscreen' },
    args: { form },
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
} satisfies Meta<typeof CreateOrganizationPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = {
    args: { form: null },
    render: () => <CreateOrganizationPageLoading />,
};
