import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import {
    mutualAidValues,
    relatedField,
} from '@/components/organisms/definition-fixtures';
import { DefinitionForm } from '@/components/organisms/definition-form';
import { DefinitionRemove } from '@/components/organisms/definition-remove';
import { DefinitionUpload } from '@/components/organisms/definition-upload';

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
        upload: (
            <DefinitionUpload
                locale="en"
                slug="mutual-aid"
                headingLevel={3}
                checkAction={fn()}
                check={{}}
                saveAction={fn()}
                save={{}}
            />
        ),
        remove: (
            <DefinitionRemove
                slug="mutual-aid"
                word="Mutual aid"
                locale="en"
                formAction={fn()}
                state={{}}
            />
        ),
    },
};

/** A file for another word was uploaded on this word's page. */
export const UploadOtherWord: Story = {
    args: {
        ...Edit.args,
        upload: (
            <DefinitionUpload
                locale="en"
                slug="mutual-aid"
                headingLevel={3}
                checkAction={fn()}
                check={{
                    at: 1,
                    fileName: 'moderator.csv',
                    fileProblem: 'otherWord',
                    fileSlug: 'moderator',
                }}
                saveAction={fn()}
                save={{}}
            />
        ),
    },
};

/** Opened from the word's page (Edit there): the back link returns to it. */
export const EditFromPage: Story = {
    args: { ...Edit.args, returnTo: 'page' },
};
