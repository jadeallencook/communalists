import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import {
    duplicateRow,
    problemRow,
    readyRow,
    repeatedRow,
} from '@/components/organisms/import-row-fixtures';

import { AdminImportPage } from './admin-import-page';

const rows = [
    duplicateRow,
    readyRow,
    problemRow,
    {
        ...readyRow,
        line: 12,
        name: 'Martin de Porres House of Hospitality',
        handle: 'martin-de-porres-house',
        removed: true,
    },
    repeatedRow,
];

const meta = {
    title: 'Pages/Admin import',
    component: AdminImportPage,
    parameters: { layout: 'fullscreen' },
    args: {
        fileAction: fn(),
        onExpandedChange: fn(),
        onEdit: fn(),
        onRemove: fn(),
        onRestore: fn(),
        onDownload: fn(),
        onImport: fn(),
        onEditClose: fn(),
        existingHref: '/api/admin/organizations',
    },
} satisfies Meta<typeof AdminImportPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Before a file is chosen. */
export const Empty: Story = {};

export const FileError: Story = {
    args: { error: 'The file is missing these columns: focusAreas, placeId' },
};

export const Reading: Story = { args: { busy: true } };

/** Every row, with problems explained, one removed (with Undo), and the actions above and below. */
export const Review: Story = {
    args: {
        fileName: 'bay-area-mutual-aid-organizations.csv',
        rows,
        ignoredColumns: ['mastodon'],
        expandedLines: [5],
        resultKey: 1,
    },
};

export const NothingReady: Story = {
    args: {
        fileName: 'research.csv',
        rows: [problemRow, duplicateRow],
        resultKey: 1,
    },
};

export const Adding: Story = {
    args: { ...Review.args, importing: true },
};

/** The edit dialog; in the app the create form fills it. */
export const Editing: Story = {
    args: {
        ...Review.args,
        editing: {
            line: 8,
            name: 'Town Fridges',
            form: (
                <p className="text-sm text-muted-foreground">
                    (The create organization form, filled in from the row.)
                </p>
            ),
        },
    },
};

/** After adding: the new pages, with what's left to fix still below. */
export const Added: Story = {
    args: {
        fileName: 'bay-area-mutual-aid-organizations.csv',
        rows: [duplicateRow, problemRow],
        outcomes: [
            {
                line: 5,
                name: 'San Francisco Food Not Bombs',
                status: 'created',
                handle: 'san-francisco-food-not-bombs',
            },
            { line: 2, name: 'South Bay Mutual Aid', status: 'skipped' },
            { line: 8, name: 'Town Fridges', status: 'skipped' },
        ],
        resultKey: 2,
    },
};
