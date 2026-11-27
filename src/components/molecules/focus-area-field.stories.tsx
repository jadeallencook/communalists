import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

import {
    FocusAreaField,
    type FocusAreaFieldProps,
    type FocusAreaOption,
} from './focus-area-field';

const options: FocusAreaOption[] = [
    { value: 'food', label: 'Food' },
    { value: 'housing', label: 'Housing' },
    { value: 'health', label: 'Health' },
    { value: 'general', label: 'General' },
    { value: 'education', label: 'Education' },
    { value: 'legal', label: 'Legal' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'hygiene', label: 'Hygiene' },
    { value: 'disasterRelief', label: 'Disaster relief' },
    { value: 'other', label: 'Other' },
];

const meta = {
    title: 'Components/Molecules/Focus Area Field',
    component: FocusAreaField,
    args: { options, selected: null, onSelect: fn() },
    decorators: [
        (Story) => (
            <div className="flex max-w-sm flex-col gap-4">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof FocusAreaField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing chosen: "Any focus area". */
export const Empty: Story = {};
/** Chosen, with a button to clear it. */
export const Chosen: Story = { args: { selected: 'housing' } };
/** Open: every focus area, most common first. Type to narrow it. */
export const Open: Story = { args: { defaultOpen: true } };
/** A long translated label stays on one line. */
export const LongLabel: Story = {
    args: {
        options: [
            {
                value: 'disasterRelief',
                label: 'Ayuda en caso de desastres naturales y emergencias',
            },
        ],
        selected: 'disasterRelief',
    },
};
function InteractiveDemo(args: FocusAreaFieldProps) {
    const [selected, setSelected] = useState<string | null>(null);
    return (
        <FocusAreaField {...args} selected={selected} onSelect={setSelected} />
    );
}

/** Working: pick one, clear it. */
export const Interactive: Story = {
    render: (args) => <InteractiveDemo {...args} />,
};
