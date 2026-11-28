import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { AdminDefinitionUploadPage } from './admin-definition-upload-page';

const meta = {
    title: 'Pages/Admin Definition Upload',
    component: AdminDefinitionUploadPage,
    parameters: { layout: 'fullscreen' },
    args: {
        locale: 'en',
        checkAction: fn(),
        check: {},
        saveAction: fn(),
        save: {},
    },
} satisfies Meta<typeof AdminDefinitionUploadPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const base = {
    slug: 'mutual-aid-network',
    word: 'Mutual Aid Network',
    problems: [],
    changes: [],
    relatedIgnored: false,
};

/** Before choosing a file. */
export const Start: Story = {};

/** A checked file: each changed field, now and new, ready to update. */
export const Ready: Story = {
    args: {
        check: {
            at: 1,
            fileName: 'mutual-aid-network.csv',
            text: 'slug\n',
            updatedAt: 1_764_000_000_000,
            result: {
                ...base,
                status: 'ready',
                relatedIgnored: true,
                changes: [
                    {
                        field: 'en.definition',
                        before: "People and groups in an area who connect to share help and resources, so a need one group can't meet can reach someone who can.",
                        after: "Neighbors in one area who organize to meet each other's needs, connecting people who ask for help with people who can give it. It's run by its members, not by an agency or charity.",
                    },
                    {
                        field: 'en.details',
                        before: '',
                        after: 'Instead of one person helping a friend, a network is many people who agree to look out for each other.\n\nA network is different from a single project.',
                    },
                    {
                        field: 'zh.definition',
                        before: '一个地区的个人和团体相互联系，分享帮助和资源。',
                        after: '同一地区的邻居组织起来，满足彼此的需要，把求助的人和能帮忙的人联系起来。',
                    },
                ],
            },
        },
    },
};

/** The file matches the word as it is. */
export const Unchanged: Story = {
    args: {
        check: {
            at: 1,
            fileName: 'mutual-aid-network.csv',
            result: { ...base, status: 'unchanged' },
        },
    },
};

/** No word has that address: points to the import. */
export const NotFound: Story = {
    args: {
        check: {
            at: 1,
            fileName: 'tool-share.csv',
            result: {
                ...base,
                slug: 'tool-share',
                word: 'Tool Share',
                status: 'notFound',
            },
        },
    },
};

/** The file breaks the form's rules. */
export const Problems: Story = {
    args: {
        check: {
            at: 1,
            fileName: 'mutual-aid-network.csv',
            ignoredColumns: ['notes'],
            result: {
                ...base,
                status: 'problems',
                problems: [
                    { field: 'vi.word', key: 'wordRequired' },
                    { field: 'es.definition', key: 'definitionTooLong' },
                ],
            },
        },
    },
};

/** More than one row, or not a CSV in the right shape. */
export const FileProblem: Story = {
    args: {
        check: { at: 1, fileName: 'starter.csv', fileProblem: 'notOneRow' },
    },
};

/** Someone saved the word after the file was checked. */
export const ChangedMeanwhile: Story = {
    args: { ...Ready.args, save: { at: 2, error: 'changed' } },
};

/** Saving. */
export const Updating: Story = {
    args: { ...Ready.args, savePending: true },
};
