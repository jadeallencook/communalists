import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { DefinitionRemove } from './definition-remove';

const meta = {
    title: 'Components/Organisms/Definition Remove',
    component: DefinitionRemove,
    args: {
        slug: 'owner',
        word: 'Owner',
        locale: 'en',
        formAction: fn(),
        state: {},
    },
} satisfies Meta<typeof DefinitionRemove>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The section; its button opens the confirmation. */
export const Default: Story = {};

/** Removing, with the confirmation open. */
export const Removing: Story = { args: { pending: true } };

/** Someone removed it first. Shown inside the confirmation. */
export const AlreadyGone: Story = {
    args: { state: { error: 'notFound', at: 1 } },
};

/** A long word wraps. */
export const LongWord: Story = {
    args: {
        word: 'Community Land Trust and Neighborhood Housing Cooperative',
    },
};
