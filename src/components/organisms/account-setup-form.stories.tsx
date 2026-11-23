import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { AccountSetupForm } from './account-setup-form';

const location = {
    countries: [{ code: 'US' as const, name: 'United States' }],
    country: 'US' as const,
    onCountryChange: fn(),
    query: '',
    onQueryChange: fn(),
    options: [],
    selected: null,
    onSelect: fn(),
};
const sanJose = { id: '5392171', label: 'San Jose, California' };
const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'zh', name: '中文' },
];

const meta = {
    title: 'Components/Organisms/Account Setup Form',
    component: AccountSetupForm,
    args: {
        state: {},
        formAction: fn(),
        pending: false,
        locale: 'en',
        next: '/dashboard',
        defaults: { preferredLocale: 'en' },
        languages,
        location,
    },
    decorators: [
        (Story) => (
            <div className="max-w-md">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof AccountSetupForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Straight from sign-up: nothing answered yet. */
export const Empty: Story = {};

/** A prototype account: the name came from Firebase Auth, the city is missing. */
export const PartlyAnswered: Story = {
    args: { defaults: { name: 'Ada Lovelace', preferredLocale: 'es' } },
};

export const FieldErrors: Story = {
    args: {
        state: {
            fieldErrors: { name: 'required', placeId: 'placeRequired' },
            values: { name: '' },
        },
    },
};

export const ServerError: Story = {
    args: {
        location: { ...location, selected: sanJose },
        defaults: { name: 'Ada Lovelace', preferredLocale: 'en' },
        state: { formError: 'generic' },
    },
};

export const Submitting: Story = {
    args: {
        location: { ...location, selected: sanJose },
        defaults: { name: 'Ada Lovelace', preferredLocale: 'en' },
        pending: true,
    },
};

/** Account settings: edit and stay on the page. */
export const SettingsMode: Story = {
    args: {
        mode: 'settings',
        next: undefined,
        location: { ...location, selected: sanJose },
        defaults: { name: 'Ada Lovelace', preferredLocale: 'es' },
    },
};

export const SettingsSaved: Story = {
    args: {
        mode: 'settings',
        next: undefined,
        location: { ...location, selected: sanJose },
        defaults: { name: 'Ada Lovelace', preferredLocale: 'es' },
        state: { saved: true, values: { name: 'Ada Lovelace' } },
    },
};
