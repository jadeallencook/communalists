import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { StepBar } from './step-bar';

const meta = {
    title: 'Components/Molecules/StepBar',
    component: StepBar,
    args: {
        label: 'Steps',
        steps: [
            { value: 'template', label: "What's it for" },
            { value: 'words', label: 'Words' },
            { value: 'pictures', label: 'Photo and logo' },
            { value: 'look', label: 'Look' },
        ],
        current: 'words',
        onChange: fn(),
    },
    parameters: {
        docs: {
            description: {
                component:
                    'Numbered steps people can jump between (the graphics editor uses it). The current step has `aria-current="step"`; two rows on narrow screens.',
            },
        },
    },
} satisfies Meta<typeof StepBar<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Middle: Story = {};
export const WithDoneSteps: Story = {
    args: { current: 'look', done: ['template', 'words', 'pictures'] },
};
/** Spanish labels run long; they wrap inside their buttons. */
export const LongLabels: Story = {
    args: {
        steps: [
            { value: 'template', label: 'Para qué es' },
            { value: 'words', label: 'Texto' },
            { value: 'pictures', label: 'Foto y logo' },
            { value: 'look', label: 'Estilo' },
        ],
    },
};
