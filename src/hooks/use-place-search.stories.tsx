import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { Input } from '@/components/atoms/input';
import { sampleSearch } from '@/lib/places/sample';

import { usePlaceSearch } from './use-place-search';

const slowSearch = sampleSearch(600);
const failingSearch = () => Promise.reject(new Error('Network down'));

function UsePlaceSearchDemo({ fails = false }: { fails?: boolean }) {
    const [query, setQuery] = useState('san');
    const output = usePlaceSearch('US', query, {
        search: fails ? failingSearch : slowSearch,
    });
    return (
        <div className="grid max-w-3xl gap-6 md:grid-cols-2">
            <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="City search"
                placeholder="Try: san, oak, springfield il"
            />
            <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">
                {JSON.stringify(output, null, 2)}
            </pre>
        </div>
    );
}

const meta = {
    title: 'Hooks/usePlaceSearch',
    component: UsePlaceSearchDemo,
    parameters: {
        docs: {
            description: {
                component:
                    'Debounced type-ahead city search. Cancels stale requests and keeps the last results while new ones load. The app searches /api/places; this demo searches a sample dataset with a 600 ms fake delay.',
            },
        },
    },
} satisfies Meta<typeof UsePlaceSearchDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {};
export const RequestFails: Story = { args: { fails: true } };
