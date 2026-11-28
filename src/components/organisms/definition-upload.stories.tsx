import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { DefinitionUpload } from './definition-upload';

// Every result state is in Pages/Admin Definition Upload, which renders this.
const meta = {
    title: 'Components/Organisms/Definition Upload',
    component: DefinitionUpload,
    args: {
        locale: 'en',
        checkAction: fn(),
        check: {},
        saveAction: fn(),
        save: {},
    },
} satisfies Meta<typeof DefinitionUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

/** On the upload page: any word's file. */
export const AnyWord: Story = {};

/** On a word's edit page: only that word's file, headings one level down. */
export const OneWord: Story = {
    args: { slug: 'moderator', headingLevel: 3 },
};

/** A file for another word, uploaded on Moderator's edit page. */
export const OtherWord: Story = {
    args: {
        slug: 'moderator',
        headingLevel: 3,
        check: {
            at: 1,
            fileName: 'member.csv',
            fileProblem: 'otherWord',
            fileSlug: 'member',
        },
    },
};
