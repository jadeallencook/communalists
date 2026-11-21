import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ThemeToggle } from './theme-toggle';

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
