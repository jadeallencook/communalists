import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { RelatedWordsField } from '@/components/molecules/related-words-field';

import { useRelatedWords } from './use-related-words';

const options = [
    { slug: 'food-pantry', word: 'Food Pantry' },
    { slug: 'free-fridge', word: 'Free Fridge' },
    { slug: 'harm-reduction', word: 'Harm Reduction' },
    { slug: 'mutual-aid', word: 'Mutual Aid' },
    { slug: 'mutual-aid-network', word: 'Mutual Aid Network' },
    { slug: 'organizer', word: 'Organizer' },
    { slug: 'repair-cafe', word: 'Repair Café' },
    { slug: 'solidarity', word: 'Solidarity' },
    { slug: 'tenant-union', word: 'Tenant Union' },
];

function Demo({ initial, max }: { initial: string[]; max: number }) {
    const picker = useRelatedWords({ options, initial, max });
    return (
        <div className="flex max-w-xl flex-col gap-4">
            <RelatedWordsField {...picker} id="definition-related" />
            <pre className="rounded-lg bg-muted p-4 text-xs">
                related: {JSON.stringify(picker.selected.map((w) => w.slug))}
            </pre>
        </div>
    );
}

const meta = {
    title: 'Hooks/useRelatedWords',
    component: Demo,
    args: { initial: ['solidarity'], max: 10 },
    parameters: {
        docs: {
            description: {
                component:
                    'Type to find words ("cafe" finds Repair Café), choose one to add it, and Remove to take it off. Words already linked aren\'t offered again.',
            },
        },
    },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A low limit, to try what happens at the most allowed. */
export const LowLimit: Story = { args: { max: 2 } };

/** A slug that's no longer a word is dropped. */
export const UnknownSlug: Story = { args: { initial: ['solidarity', 'gone'] } };
