import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { parseDirectorySearch } from '@/lib/organizations/directory';

import { OrganizationFilters } from './organization-filters';

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

const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'vi', label: 'Vietnamese' },
    { value: 'zh', label: 'Chinese' },
    { value: 'tl', label: 'Tagalog' },
    { value: 'ko', label: 'Korean' },
];

const meta = {
    title: 'Components/Organisms/Organization Filters',
    component: OrganizationFilters,
    args: {
        action: '/en/find',
        search: parseDirectorySearch({ country: 'US', placeId: '5392171' }),
        location,
        languageOptions,
        onFiltersChange: fn(),
    },
    decorators: [
        (Story) => (
            <div className="max-w-72">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof OrganizationFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Defaults: 25 mi, every kind of group, no focus area or language chosen (groups folded). */
export const Default: Story = {};

/** Some filters chosen: their groups open, with a count. */
export const Filtered: Story = {
    args: {
        search: parseDirectorySearch({
            country: 'US',
            placeId: '5392171',
            radius: '50',
            focusAreas: ['food', 'housing'],
            languages: ['vi'],
            reach: ['local'],
        }),
    },
};

/** No city yet (a signed-out visitor). */
export const NoCity: Story = {
    args: {
        search: parseDirectorySearch({}),
        location: { ...location, selected: null },
    },
};
