import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
    BookOpenIcon,
    CalendarDaysIcon,
    ClipboardListIcon,
    UsersIcon,
} from 'lucide-react';

import { FeatureGrid } from './feature-grid';

const meta = {
    title: 'Components/Organisms/Feature Grid',
    component: FeatureGrid,
    parameters: { layout: 'fullscreen' },
    args: {
        title: 'Built for mutual aid',
        intro: 'Communalists is a free platform where neighbors organize.',
        note: 'Available in English, Español, Tiếng Việt and 中文.',
        features: [
            {
                id: 'organizations',
                icon: UsersIcon,
                title: 'Organizations',
                description: 'Start a group or join one near you.',
            },
            {
                id: 'requests',
                icon: ClipboardListIcon,
                title: 'Requests',
                description: 'Take requests and track them on a shared board.',
            },
            {
                id: 'library',
                icon: BookOpenIcon,
                title: 'Library',
                description: 'Lend tools and always know who has what.',
            },
            {
                id: 'planning',
                icon: CalendarDaysIcon,
                title: 'Calendars and documents',
                description: 'Plan events and keep knowledge in one place.',
            },
        ],
        footnote: 'Communalists is in early development.',
    },
} satisfies Meta<typeof FeatureGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TwoFeatures: Story = {
    args: {
        note: undefined,
        footnote: undefined,
        features: [
            {
                id: 'requests',
                icon: ClipboardListIcon,
                title: 'Requests',
                description: 'Take requests and track them on a shared board.',
            },
            {
                id: 'library',
                icon: BookOpenIcon,
                title: 'Library',
                description: 'Lend tools and always know who has what.',
            },
        ],
    },
};
