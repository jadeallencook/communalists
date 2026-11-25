import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { sampleOrgPhoto } from '@/components/molecules/photo-fixtures';
import { CreateOrganizationForm } from '@/components/organisms/create-organization-form';
import { PhotoEditor } from '@/components/organisms/photo-editor';
import { DeleteOrganizationSection } from '@/components/organisms/delete-organization-section';
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
        photo: (
            <PhotoEditor
                variant="field"
                name="South Bay Mutual Aid"
                photoUrl={sampleOrgPhoto}
                shape="rounded"
                audience="org"
                saveAction={fn(async () => ({
                    ok: true as const,
                    removed: false,
                }))}
            />
        ),
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
/** Owners also see Delete organization at the end. */
export const AsOwner: Story = {
    args: {
        deleteSection: (
            <DeleteOrganizationSection
                name="South Bay Mutual Aid"
                orgId="org1"
                locale="en"
                typed=""
                onTypedChange={fn()}
                confirmed={false}
                formAction={fn()}
            />
        ),
    },
};
export const Loading: Story = {
    render: () => <EditOrganizationPageLoading />,
};
