import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { ImportRowCard } from './import-row-card';
import {
    duplicateRow,
    problemRow,
    readyRow,
    repeatedRow,
} from './import-row-fixtures';

const meta = {
    title: 'Components/Organisms/Import Row Card',
    component: ImportRowCard,
    args: {
        ...readyRow,
        expanded: false,
        onExpandedChange: fn(),
        onEdit: fn(),
        onRemove: fn(),
        onRestore: fn(),
    },
    decorators: [
        (Story) => (
            <div className="max-w-3xl p-4">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ImportRowCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {};

/** The profile as its page will look, with the research behind it. */
export const Expanded: Story = { args: { expanded: true } };

/** Each problem names the column, says what's wrong, shows the cell and how to fix it. */
export const Problems: Story = { args: { ...problemRow } };

/** Problems, with the partial profile open. */
export const ProblemsExpanded: Story = {
    args: { ...problemRow, expanded: true },
};

/** Already on Communalists: links to the existing page to compare. */
export const AlreadyListed: Story = { args: { ...duplicateRow } };

export const RepeatedInFile: Story = { args: { ...repeatedRow } };

export const Edited: Story = { args: { edited: true } };

export const Removed: Story = { args: { removed: true } };

export const LongName: Story = {
    args: {
        ...readyRow,
        name: 'CALMA (Collective Action for Laborers, Migrants, & Asylum Seekers)',
        handle: 'calma',
    },
};
