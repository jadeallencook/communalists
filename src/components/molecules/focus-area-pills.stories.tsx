import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

import {
    FocusAreaPills,
    type FocusAreaOption,
    type FocusAreaPillsProps,
} from './focus-area-pills';

const options: FocusAreaOption[] = [
    { value: 'food', label: 'Food' },
    { value: 'housing', label: 'Housing' },
    { value: 'health', label: 'Health' },
    { value: 'general', label: 'General' },
    { value: 'education', label: 'Education' },
    { value: 'legal', label: 'Legal' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'hygiene', label: 'Hygiene' },
];

const meta = {
    title: 'Components/Molecules/Focus Area Pills',
    component: FocusAreaPills,
    args: { options, selected: null, onSelect: fn() },
    decorators: [
        (Story) => (
            <div className="max-w-xl">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof FocusAreaPills>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click a pill to pick it, again to clear it. */
export const Interactive: Story = {
    render: function Render(args: FocusAreaPillsProps) {
        const [selected, setSelected] = useState<string | null>(null);
        return (
            <FocusAreaPills
                {...args}
                selected={selected}
                onSelect={(value) => {
                    setSelected(value);
                    args.onSelect(value);
                }}
            />
        );
    },
};
export const Selected: Story = { args: { selected: 'housing' } };
/** Narrow space: the pills wrap onto more lines, each as wide as its label. */
export const Narrow: Story = {
    decorators: [
        (Story) => (
            <div className="max-w-60">
                <Story />
            </div>
        ),
    ],
};
/** Long labels (Vietnamese). */
export const LongLabels: Story = {
    args: {
        options: [
            { value: 'food', label: 'Thực phẩm' },
            { value: 'housing', label: 'Nhà ở' },
            { value: 'health', label: 'Sức khỏe' },
            { value: 'general', label: 'Hỗ trợ tổng quát' },
            { value: 'education', label: 'Giáo dục' },
            { value: 'legal', label: 'Pháp lý' },
            { value: 'clothing', label: 'Quần áo' },
            { value: 'hygiene', label: 'Vệ sinh cá nhân' },
        ],
    },
};
