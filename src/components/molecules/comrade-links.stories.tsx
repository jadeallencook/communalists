import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { manyComrades } from '@/components/organisms/profile-fixtures';

import { ComradeLinks } from './comrade-links';
import { SAMPLE_PHOTO } from './photo-fixtures';

const meta = {
    title: 'Components/Molecules/Comrade Links',
    component: ComradeLinks,
    args: {
        comrades: [
            {
                uid: 'a',
                name: 'Luis Hernández',
                username: 'luis-hernandez',
                photo: SAMPLE_PHOTO,
            },
            { uid: 'b', name: 'Aisha Mohamed', username: 'aisha-mohamed' },
        ],
    },
    decorators: [
        (Story) => (
            <div className="max-w-2xl">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ComradeLinks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Two: Story = {};
export const Many: Story = { args: { comrades: manyComrades } };
