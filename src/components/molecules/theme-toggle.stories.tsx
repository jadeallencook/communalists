import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ThemeOptions, ThemeToggle } from './theme-toggle';

const meta = {
    title: 'Components/Molecules/Theme Toggle',
    component: ThemeToggle,
    parameters: {
        docs: {
            description: {
                component:
                    'Light / dark / system menu. In Storybook, switch themes with the Theme toolbar instead.',
            },
        },
    },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The phone menu's version: three buttons, the chosen one pressed. */
export const Options: Story = { render: () => <ThemeOptions /> };
