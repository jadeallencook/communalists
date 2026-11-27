import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { mutualAidValues, relatedOptions } from './definition-fixtures';
import { DefinitionForm } from './definition-form';

const meta = {
    title: 'Components/Organisms/Definition Form',
    component: DefinitionForm,
    args: {
        mode: 'create',
        relatedOptions,
        locale: 'en',
        state: {},
        formAction: fn(),
    },
} satisfies Meta<typeof DefinitionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Adding a word: every language is empty and the address can be typed. */
export const Create: Story = {};

/** Editing: the address is fixed, so shared links keep working. */
export const Edit: Story = {
    args: { mode: 'edit', initial: mutualAidValues },
};

/** After a save with problems: the summary takes focus and links to each field. */
export const Errors: Story = {
    args: {
        state: {
            at: 1,
            fieldErrors: {
                slug: 'slugFormat',
                'vi.word': 'wordRequired',
                'zh.definition': 'definitionRequired',
                'es.definition': 'definitionTooLong',
            },
            values: {
                ...mutualAidValues,
                slug: 'Mutual Aid',
                text: {
                    ...mutualAidValues.text,
                    vi: { word: '', definition: '', details: '' },
                    zh: { word: '互助', definition: '', details: '' },
                },
            },
        },
    },
};

/** The address is already used by another word. */
export const SlugTaken: Story = {
    args: {
        state: { at: 1, formError: 'slugTaken', values: mutualAidValues },
    },
};

/** The first word: nothing to link to yet. */
export const NoOtherWords: Story = { args: { relatedOptions: [] } };

export const Saving: Story = {
    args: { mode: 'edit', initial: mutualAidValues, pending: true },
};

/** The form's labels in Vietnamese (the word fields stay per language). */
export const Vietnamese: Story = {
    args: { mode: 'edit', initial: mutualAidValues },
    globals: { locale: 'vi' },
};
