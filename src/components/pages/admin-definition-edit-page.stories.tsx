import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import {
    mutualAidValues,
    relatedOptions,
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
                relatedOptions={relatedOptions}
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
                relatedOptions={relatedOptions}
                locale="en"
                state={{}}
                formAction={fn()}
            />
        ),
    },
};
