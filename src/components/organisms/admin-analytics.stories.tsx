import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { AdminAnalytics } from './admin-analytics';
import { analytics } from './admin-fixtures';

const meta = {
    title: 'Components/Organisms/AdminAnalytics',
    component: AdminAnalytics,
    parameters: { layout: 'padded' },
    args: analytics,
} satisfies Meta<typeof AdminAnalytics>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Connected: Story = {};

/** No previous period from Umami: no comparison lines. */
export const NoComparison: Story = {
    args: { ...analytics, previous: undefined },
};

export const NoTrafficYet: Story = {
    args: {
        ...analytics,
        visitors: 0,
        pageviews: 0,
        organizations: [],
        cities: [],
    },
};

/** UMAMI_API_KEY isn't set (local development, previews). */
export const NotConfigured: Story = { args: { status: 'notConfigured' } };

/** Umami didn't answer or answered something unexpected. */
export const Error: Story = { args: { status: 'error' } };
