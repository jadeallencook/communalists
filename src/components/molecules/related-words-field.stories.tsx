import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { RelatedWordsField } from './related-words-field';

const meta = {
    title: 'Components/Molecules/RelatedWordsField',
    component: RelatedWordsField,
    args: {
        id: 'definition-related',
        selected: [
            { slug: 'solidarity', word: 'Solidarity' },
            { slug: 'mutual-aid', word: 'Mutual Aid' },
        ],
        query: '',
        onQueryChange: fn(),
        results: [],
        onAdd: fn(),
        onRemove: fn(),
        atMax: false,
        max: 10,
        change: null,
        hasOptions: true,
    },
} satisfies Meta<typeof RelatedWordsField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two words linked, nothing typed: no list until someone types. */
export const Linked: Story = {};

/** Nothing linked yet. */
export const Empty: Story = { args: { selected: [] } };

/** Typing shows matches to add. */
export const Searching: Story = {
    args: {
        query: 'food',
        results: [
            { slug: 'food-pantry', word: 'Food Pantry' },
            { slug: 'food-not-bombs', word: 'Food Not Bombs' },
            { slug: 'community-food-bank', word: 'Community Food Bank' },
        ],
    },
};

export const NoMatch: Story = { args: { query: 'zzz' } };

/** The most allowed are linked: typing explains why nothing can be added. */
export const AtMax: Story = {
    args: {
        query: 'a',
        atMax: true,
        max: 2,
    },
};

/** A long word, to check wrapping on phones and at 200% zoom. */
export const LongWord: Story = {
    args: {
        selected: [
            {
                slug: 'clt',
                word: 'Community land trust and cooperative housing association',
            },
        ],
    },
};

export const WithError: Story = {
    args: { error: 'Choose 10 related words or fewer.' },
};

export const Vietnamese: Story = {
    globals: { locale: 'vi' },
    args: {
        selected: [{ slug: 'solidarity', word: 'Đoàn kết' }],
        query: 'tương',
        results: [{ slug: 'mutual-aid', word: 'Tương trợ' }],
    },
};
