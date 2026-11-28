import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import {
    AdminCommentsPage,
    AdminCommentsPageLoading,
    type AdminReportedComment,
} from './admin-comments-page';

const items: AdminReportedComment[] = [
    {
        key: 'definition~mutual-aid~c4',
        on: { label: 'Mutual Aid', href: '/dictionary/mutual-aid', lang: 'en' },
        text: 'Buy cheap watches at example.com, best prices!!!',
        lang: 'en',
        author: 'Someone',
        postedOn: 'Nov 15, 2026',
        votes: 0,
        reports: 3,
        reasons: [
            { reason: 'spam', count: 2 },
            { reason: 'other', count: 1 },
        ],
    },
    {
        key: 'definition~solidarity~c9',
        on: { label: 'Solidarity', href: '/dictionary/solidarity', lang: 'en' },
        text: 'La solidaridad no es caridad.\n\nEs caminar juntos.',
        lang: 'es',
        author: 'Luis Hernández',
        postedOn: 'Nov 18, 2026',
        votes: 6,
        reports: 1,
        reasons: [{ reason: 'misinformation', count: 1 }],
    },
    {
        key: 'definition~free-fridge~c2',
        on: {
            label: 'Free Fridge',
            href: '/dictionary/free-fridge',
            lang: 'en',
        },
        text: null,
        lang: 'en',
        author: null,
        votes: 0,
        reports: 1,
        reasons: [{ reason: 'harassment', count: 1 }],
    },
];

const meta = {
    title: 'Pages/AdminCommentsPage',
    component: AdminCommentsPage,
    parameters: { layout: 'fullscreen' },
    args: { items, onHide: fn(), onDelete: fn(), onDismiss: fn() },
} satisfies Meta<typeof AdminCommentsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Most reported first; one comment was deleted meanwhile (only Dismiss). */
export const Reports: Story = {};

export const Empty: Story = { args: { items: [] } };

/** After hiding one: announced, with focus on the message. */
export const Hidden: Story = {
    args: {
        items: items.slice(1),
        notice: {
            tone: 'status',
            text: 'Comment hidden. Its report is closed.',
            at: 1,
        },
    },
};

export const Failed: Story = {
    args: {
        notice: {
            tone: 'alert',
            text: 'Something went wrong. Try again.',
            at: 1,
        },
    },
};

export const Busy: Story = {
    args: { busy: new Set(['definition~mutual-aid~c4']) },
};

export const Spanish: Story = { globals: { locale: 'es' } };

export const Loading: Story = { render: () => <AdminCommentsPageLoading /> };
