import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BookOpenIcon, ClipboardListIcon } from 'lucide-react';

import { FeatureCard } from './feature-card';

const meta = {
    title: 'Components/Molecules/Feature Card',
    component: FeatureCard,
    args: {
        icon: ClipboardListIcon,
        title: 'Requests',
        description:
            'Take requests through a public form and track each one on a shared board until it is fulfilled.',
    },
    decorators: [
        (Story) => (
            <div className="max-w-xs">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof FeatureCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongText: Story = {
    args: {
        icon: BookOpenIcon,
        title: 'Library',
        description:
            'Lend tools and supplies within your group, and always know who has what, when it is due back, and who is waiting for it next.',
    },
};
