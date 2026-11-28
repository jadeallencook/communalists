import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { WordSuggestions } from './word-suggestions';

const meta = {
    title: 'Components/Molecules/WordSuggestions',
    component: WordSuggestions,
    args: {
        words: [
            { slug: 'mutual-aid', word: 'Mutual Aid', lang: 'en' },
            {
                slug: 'mutual-aid-network',
                word: 'Mutual Aid Network',
                lang: 'en',
            },
        ],
    },
} satisfies Meta<typeof WordSuggestions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Suggestions: Story = {};

/** Nothing close (or still loading): renders nothing. */
export const None: Story = { args: { words: [] } };

/** Words shown in the reader's language, each with its `lang`. */
export const Spanish: Story = {
    globals: { locale: 'es' },
    args: { words: [{ slug: 'mutual-aid', word: 'Ayuda mutua', lang: 'es' }] },
};
