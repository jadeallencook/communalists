import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { DefinitionEditBar } from './definition-edit-bar';

const meta = {
    title: 'Components/Molecules/DefinitionEditBar',
    component: DefinitionEditBar,
    args: { slug: 'mutual-aid', word: 'Mutual Aid' },
} satisfies Meta<typeof DefinitionEditBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** What a super user sees on a word's page. */
export const Default: Story = {};

/** Back from the edit form: "Saved" is announced and takes focus. */
export const Saved: Story = { args: { saved: true } };

/** A long word, to check wrapping on phones and at 200% zoom. */
export const LongWord: Story = {
    args: {
        word: 'Community land trust and cooperative housing association',
    },
};

export const Spanish: Story = {
    globals: { locale: 'es' },
    args: { word: 'Ayuda mutua', saved: true },
};
