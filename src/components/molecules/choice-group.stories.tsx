import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { ChoiceGroup } from './choice-group';

const meta = {
    title: 'Components/Molecules/Choice Group',
    component: ChoiceGroup,
    args: {
        name: 'joinPolicy',
        legend: 'Who can join',
        kind: 'radio',
        defaultValue: 'request',
        options: [
            {
                value: 'request',
                label: 'Request to join',
                description: 'People ask; owners and moderators approve',
            },
            {
                value: 'open',
                label: 'Open',
                description: 'Anyone can join right away',
            },
            {
                value: 'invite',
                label: 'Invite only',
                description: 'Only people you invite can join',
            },
        ],
    },
    decorators: [
        (Story) => (
            <div className="max-w-xl">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ChoiceGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Radio: Story = {};
export const Checkboxes: Story = {
    args: {
        name: 'languages',
        legend: 'Languages spoken',
        kind: 'checkbox',
        columns: true,
        defaultValue: ['en', 'vi'],
        hint: 'The languages your group can help people in.',
        options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'vi', label: 'Vietnamese' },
            { value: 'zh', label: 'Chinese' },
            { value: 'tl', label: 'Tagalog' },
            { value: 'ko', label: 'Korean' },
        ],
    },
};
export const WithError: Story = {
    args: {
        kind: 'checkbox',
        name: 'languages',
        defaultValue: [],
        error: 'Choose at least one language.',
    },
};

/** Controlled checkboxes with a cap: at 3, the rest are disabled. */
export const WithMax: Story = {
    args: {
        name: 'focusAreas',
        legend: 'What does your group work on?',
        kind: 'checkbox',
        columns: true,
        max: 3,
        hint: 'Choose up to 3.',
        options: [
            { value: 'general', label: 'General' },
            { value: 'food', label: 'Food' },
            { value: 'housing', label: 'Housing' },
            { value: 'transportation', label: 'Transportation' },
            { value: 'technology', label: 'Technology' },
            { value: 'health', label: 'Health' },
        ],
    },
    render: function Render(args) {
        const [selected, setSelected] = useState(['food', 'housing', 'health']);
        return (
            <ChoiceGroup
                {...args}
                selected={selected}
                onSelectedChange={setSelected}
            />
        );
    },
};
