import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

import {
    ProfileSettingsForm,
    type ProfileFormValue,
} from './profile-settings-form';

const empty: ProfileFormValue = {
    visibility: 'groups',
    pronouns: '',
    bio: '',
    languages: [],
    showArea: false,
    website: '',
    socials: [],
    groupsShow: true,
    shownGroups: ['sbma', 'auto', 'tenants'],
    endorsementsShow: true,
};
const filled: ProfileFormValue = {
    ...empty,
    visibility: 'public',
    pronouns: 'she/her',
    bio: 'Organizer with South Bay Mutual Aid. I drive the Tuesday grocery route.',
    languages: ['en', 'es'],
    showArea: true,
    website: 'example.com',
    socials: [{ platform: 'instagram', handle: 'example' }],
    shownGroups: ['sbma', 'auto'],
};
const groups = [
    { orgId: 'sbma', name: 'South Bay Mutual Aid' },
    { orgId: 'auto', name: 'Oakland Auto Club' },
    { orgId: 'tenants', name: 'Alum Rock Tenants Union' },
];
const endorsements = [
    {
        orgId: 'garden',
        name: 'Eastside Community Garden',
        handle: 'eastside-garden',
    },
    {
        orgId: 'tools',
        name: 'San José Tool Library',
        handle: 'sj-tool-library',
    },
];
const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'vi', label: 'Vietnamese' },
    { value: 'zh', label: 'Chinese' },
];

function Demo(props: {
    start: ProfileFormValue;
    state?: object;
    endorsements?: typeof endorsements | null;
}) {
    const [value, setValue] = useState(props.start);
    return (
        <ProfileSettingsForm
            value={value}
            onChange={setValue}
            state={props.state ?? {}}
            formAction={fn()}
            areaLabel="San Jose, California"
            groups={groups}
            endorsements={
                props.endorsements === undefined ? [] : props.endorsements
            }
            languageOptions={languageOptions}
        />
    );
}

const meta = {
    title: 'Components/Organisms/Profile Settings Form',
    component: ProfileSettingsForm,
    args: {
        value: empty,
        onChange: fn(),
        state: {},
        formAction: fn(),
        areaLabel: 'San Jose, California',
        groups,
        endorsements: [],
        languageOptions,
    },
    decorators: [
        (Story) => (
            <div className="max-w-2xl">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ProfileSettingsForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A new profile: everything empty, shared with groups by default. */
export const Empty: Story = { render: () => <Demo start={empty} /> };
/** Filled in, with the tenants union hidden, and two endorsements. */
export const Filled: Story = {
    render: () => <Demo start={filled} endorsements={endorsements} />,
};
/** Their endorsements couldn't be loaded; the rest of the form still works. */
export const EndorsementsFailed: Story = {
    render: () => <Demo start={filled} endorsements={null} />,
};
export const WithErrors: Story = {
    render: () => (
        <Demo
            start={{ ...filled, website: 'not a url' }}
            state={{
                fieldErrors: {
                    website: 'invalidUrl',
                    socials: 'socialMismatch',
                },
            }}
        />
    ),
};
export const Saved: Story = {
    render: () => <Demo start={filled} state={{ saved: true }} />,
};
