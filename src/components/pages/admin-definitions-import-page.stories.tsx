import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { AdminDefinitionsImportPage } from './admin-definitions-import-page';

const meta = {
    title: 'Pages/Admin Definitions Import',
    component: AdminDefinitionsImportPage,
    parameters: { layout: 'fullscreen' },
    args: {
        locale: 'en',
        templateHref: 'data:text/csv;charset=utf-8,slug',
        checkAction: fn(),
        check: {},
        addAction: fn(),
        add: {},
    },
} satisfies Meta<typeof AdminDefinitionsImportPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Before choosing a file. */
export const Start: Story = {};

/** A checked file: ready rows, one already there, and rows to fix. */
export const Checked: Story = {
    args: {
        check: {
            at: 1,
            fileName: 'starter.csv',
            text: 'slug\n',
            ignoredColumns: ['notes'],
            rows: [
                {
                    line: 2,
                    slug: 'mutual-aid',
                    word: 'Mutual aid',
                    status: 'ready',
                    problems: [],
                },
                {
                    line: 3,
                    slug: 'solidarity',
                    word: 'Solidarity',
                    status: 'exists',
                    problems: [],
                },
                {
                    line: 4,
                    slug: 'free-fridge',
                    word: 'Free fridge',
                    status: 'problems',
                    problems: [
                        { field: 'vi.word', key: 'wordRequired' },
                        { field: 'es.definition', key: 'definitionTooLong' },
                        {
                            field: 'related',
                            key: 'relatedUnknown',
                            value: 'community-fridge',
                        },
                    ],
                },
                {
                    line: 5,
                    slug: 'free-fridge',
                    word: 'Free fridge',
                    status: 'problems',
                    problems: [{ field: 'slug', key: 'slugRepeated' }],
                },
            ],
        },
    },
};

/** Every row is already in the dictionary or needs fixing. */
export const NothingReady: Story = {
    args: {
        check: {
            at: 1,
            fileName: 'starter.csv',
            rows: [
                {
                    line: 2,
                    slug: 'mutual-aid',
                    word: 'Mutual aid',
                    status: 'exists',
                    problems: [],
                },
            ],
        },
    },
};

export const MissingColumns: Story = {
    args: {
        check: {
            at: 1,
            fileName: 'words.csv',
            fileProblem: 'missingColumns',
            columns: ['vi_word', 'vi_definition'],
        },
    },
};

/** Someone added one of the words while this file was being reviewed. */
export const AddFailed: Story = {
    args: {
        ...Checked.args,
        add: { at: 2, error: 'changed' },
    },
};

export const Checking: Story = { args: { checkPending: true } };

export const Spanish: Story = {
    ...Checked,
    globals: { locale: 'es' },
};
