import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { CreateOrganizationForm } from '@/components/organisms/create-organization-form';
import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';

import {
    EditOrganizationPage,
    EditOrganizationPageLoading,
} from './edit-organization-page';

const meta = {
    title: 'Pages/Edit Organization',
    component: EditOrganizationPage,
    parameters: { layout: 'fullscreen' },
    args: {
        name: 'South Bay Mutual Aid',
        handle: 'sbma',
        form: (
            <CreateOrganizationForm
                mode="edit"
                orgId="org1"
                state={{
                    values: {
                        description: 'Neighbors helping neighbors.',
                        languages: ['en', 'es'],
                        joinPolicy: 'request',
                        visibility: 'listed',
                        memberListVisibility: 'members',
                    },
                }}
                formAction={fn()}
                locale="en"
                name="South Bay Mutual Aid"
                onNameChange={fn()}
                handle="sbma"
                onHandleChange={fn()}
                handleStatus={{ state: 'current' }}
                focusAreas={['general', 'food']}
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
                languageOptions={[
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Spanish' },
                    { value: 'vi', label: 'Vietnamese' },
                    { value: 'zh', label: 'Chinese' },
                ]}
            />
        ),
    },
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
} satisfies Meta<typeof EditOrganizationPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = {
    render: () => <EditOrganizationPageLoading />,
};
