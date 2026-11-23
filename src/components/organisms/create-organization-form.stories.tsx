import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { CreateOrganizationForm } from './create-organization-form';

const location = {
    countries: [{ code: 'US' as const, name: 'United States' }],
    country: 'US' as const,
    onCountryChange: fn(),
    query: '',
    onQueryChange: fn(),
    options: [],
    selected: { id: '5392171', label: 'San Jose, California' },
    onSelect: fn(),
};

export const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'vi', label: 'Vietnamese' },
    { value: 'zh', label: 'Chinese' },
    { value: 'tl', label: 'Tagalog' },
    { value: 'ko', label: 'Korean' },
];

const meta = {
    title: 'Components/Organisms/Create Organization Form',
    component: CreateOrganizationForm,
    args: {
        state: {},
        formAction: fn(),
        pending: false,
        locale: 'en',
        name: '',
        onNameChange: fn(),
        handle: '',
        onHandleChange: fn(),
        handleStatus: { state: 'empty' },
        focusAreas: [],
        onFocusAreasChange: fn(),
        reach: 'local',
        onReachChange: fn(),
        socials: [],
        onSocialsChange: fn(),
        location,
        languageOptions,
    },
    decorators: [
        (Story) => (
            <div className="max-w-2xl">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof CreateOrganizationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const FilledIn: Story = {
    args: {
        name: 'South Bay Mutual Aid',
        handle: 'south-bay-mutual-aid',
        handleStatus: { state: 'available' },
        socials: [{ platform: 'instagram', url: 'https://instagram.com/sbma' }],
    },
};

export const National: Story = { args: { reach: 'national' } };

export const Errors: Story = {
    args: {
        handle: 'sbma',
        handleStatus: { state: 'unavailable', reason: 'taken' },
        state: {
            fieldErrors: {
                name: 'required',
                focusAreas: 'focusAreasRequired',
                languages: 'languagesRequired',
                website: 'invalidUrl',
                socials: 'socialMismatch',
            },
            values: { website: 'not a url' },
        },
    },
};

export const OwnedLimit: Story = {
    args: { state: { formError: 'ownedLimit' } },
};
export const Submitting: Story = {
    args: {
        pending: true,
        name: 'South Bay Mutual Aid',
        handle: 'sbma',
        handleStatus: { state: 'available' },
    },
};
