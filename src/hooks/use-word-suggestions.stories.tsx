import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { WordSuggestions } from '@/components/molecules/word-suggestions';
import type { DefinitionPreview } from '@/lib/definitions';

import { useWordSuggestions } from './use-word-suggestions';

const words: Record<string, DefinitionPreview> = {
    'mutual-aid': { word: 'Mutual Aid', definition: '…', lang: 'en' },
    'mutual-aid-network': {
        word: 'Mutual Aid Network',
        definition: '…',
        lang: 'en',
    },
    solidarity: { word: 'Solidarity', definition: '…', lang: 'en' },
    'repair-cafe': { word: 'Repair Café', definition: '…', lang: 'en' },
};
const works = () => Promise.resolve(words);
const fails = () => Promise.reject(new Error('offline'));

function Demo({ address, broken }: { address: string; broken: boolean }) {
    const suggestions = useWordSuggestions(
        address,
        'en',
        broken ? fails : works
    );
    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm">
                Address: <code>/dictionary/{address}</code>
            </p>
            <WordSuggestions words={suggestions} />
            <pre className="rounded-lg bg-muted p-4 text-xs">
                {JSON.stringify(suggestions.map((s) => s.slug))}
            </pre>
        </div>
    );
}

const meta = {
    title: 'Hooks/useWordSuggestions',
    component: Demo,
    args: { address: 'mutal-aid', broken: false },
    parameters: {
        docs: {
            description: {
                component:
                    'Close words for an address that isn’t a word: words it starts or is part of, then near spellings (`closestWords`). Uses the marked-words list. Empty while loading or if it can’t load. This demo fakes the list.',
            },
        },
    },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Typo: Story = {};
export const PartOfAWord: Story = { args: { address: 'cafe' } };
export const NothingClose: Story = { args: { address: 'unknown' } };
/** The list can't load: no suggestions, and the page still works. */
export const ListFails: Story = { args: { broken: true } };
