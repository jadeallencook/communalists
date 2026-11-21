import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

import { FieldGroup } from '@/components/atoms/field';
import { sampleOptions, samplePlaces } from '@/lib/places/sample';
import { searchPlaces } from '@/lib/places/search';
import type { PlaceOption } from '@/lib/places/types';

import { LocationField } from './location-field';

const meta = {
    title: 'Components/Molecules/Location Field',
    component: LocationField,
    args: {
        countries: [{ code: 'US', name: 'United States' }],
        country: 'US',
        onCountryChange: fn(),
        query: '',
        onQueryChange: fn(),
        options: [],
        selected: null,
        onSelect: fn(),
    },
    decorators: [
        (Story) => (
            <FieldGroup className="max-w-md">
                <Story />
            </FieldGroup>
        ),
    ],
} satisfies Meta<typeof LocationField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NothingChosen: Story = {};

export const Selected: Story = {
    args: { selected: { id: '5392171', label: 'San Jose, California' } },
};

export const ResultsOpen: Story = {
    args: { query: 'san', options: sampleOptions, defaultOpen: true },
};

export const Searching: Story = {
    args: { query: 'oakl', loading: true, defaultOpen: true },
};

export const NoMatches: Story = {
    args: { query: 'zzqx', defaultOpen: true },
};

export const SearchFailed: Story = {
    args: { query: 'san', failed: true, defaultOpen: true },
};

export const WithError: Story = {
    args: { error: 'Choose your city from the list.' },
};

/** Searches the sample dataset as you type, so the whole interaction works. */
export const Interactive: Story = {
    render: function Render(args) {
        const [query, setQuery] = useState('');
        const [selected, setSelected] = useState<PlaceOption | null>(null);
        return (
            <LocationField
                {...args}
                query={query}
                onQueryChange={setQuery}
                options={searchPlaces(samplePlaces, query)}
                selected={selected}
                onSelect={setSelected}
            />
        );
    },
};
