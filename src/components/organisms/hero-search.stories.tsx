import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { HeroSearch, HeroSearchPlaceholder } from './hero-search';

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

const focusArea = {
    options: [
        { value: 'food', label: 'Food' },
        { value: 'housing', label: 'Housing' },
        { value: 'health', label: 'Health' },
        { value: 'legal', label: 'Legal' },
    ],
    selected: null,
    onSelect: fn(),
};

const meta = {
    title: 'Components/Organisms/Hero Search',
    component: HeroSearch,
    args: {
        action: '/en/find',
        focusArea,
        location,
        onSubmit: fn((event) => event.preventDefault()),
    },
    parameters: { layout: 'fullscreen' },
    decorators: [
        (Story) => (
            <div className="bg-neutral-800 p-8">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof HeroSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Signed out, or no city on the profile: "Search location". */
export const Empty: Story = {};
/** Signed in with a city: it's filled in. */
export const ProfileCity: Story = {
    args: {
        location: {
            ...location,
            selected: {
                id: '5378538',
                label: 'Oakland, California',
                slug: 'us/ca/oakland',
            },
        },
    },
};
/** A focus area and a city chosen. */
export const Filled: Story = {
    args: {
        focusArea: { ...focusArea, selected: 'housing' },
        location: {
            ...location,
            selected: {
                id: '5392171',
                label: 'San Jose, California',
                slug: 'us/ca/san-jose',
            },
        },
    },
};
/** While the session is checked: a panel-sized skeleton. */
export const Loading: Story = { render: () => <HeroSearchPlaceholder /> };
