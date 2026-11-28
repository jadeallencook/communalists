import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import {
    mutualAidValues,
    relatedField,
} from '@/components/organisms/definition-fixtures';
import { DefinitionForm } from '@/components/organisms/definition-form';

import { AdminDefinitionEditPage } from './admin-definition-edit-page';

const meta = {
    title: 'Pages/Admin Definition Edit',
    component: AdminDefinitionEditPage,
    parameters: { layout: 'fullscreen' },
    args: {
        mode: 'create',
        form: (
            <DefinitionForm
                mode="create"
                related={relatedField({ selected: [] })}
                locale="en"
                state={{}}
                formAction={fn()}
            />
        ),
    },
} satisfies Meta<typeof AdminDefinitionEditPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Add: Story = {};
export const Edit: Story = {
    args: {
        mode: 'edit',
        slug: 'mutual-aid',
        word: 'Mutual aid',
        form: (
            <DefinitionForm
                mode="edit"
                initial={mutualAidValues}
                related={relatedField()}
                locale="en"
                state={{}}
                formAction={fn()}
            />
        ),
    },
};

/** Opened from the word's page (Edit there): the back link returns to it. */
export const EditFromPage: Story = {
    args: { ...Edit.args, returnTo: 'page' },
};
