import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { LocaleSwitcher } from './locale-switcher';

const meta = {
    title: 'Components/Molecules/Locale Switcher',
    component: LocaleSwitcher,
    parameters: {
        docs: {
            description: {
                component:
                    'Lists each language in its own script. Use the Locale toolbar to see it from each locale.',
            },
        },
    },
} satisfies Meta<typeof LocaleSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
