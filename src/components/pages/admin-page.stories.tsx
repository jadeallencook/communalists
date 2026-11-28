import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import {
    activity,
    recent,
    analytics,
    emptyOverview,
    organizations,
    overview,
} from '@/components/organisms/admin-fixtures';

import { AdminPage, AdminPageLoading } from './admin-page';

const meta = {
    title: 'Pages/Admin',
    component: AdminPage,
    parameters: { layout: 'fullscreen' },
    args: {
        locale: 'en',
        asOf: 'Nov 27, 2026, 10:30 AM',
        overview,
        analytics,
        organizations,
        activity,
        definitionCount: 12,
        formAction: fn(),
        restoreAction: fn(),
        deleted: [
            {
                orgId: 'org9',
                name: 'Downtown Free Laundry',
                deletedOn: 'Nov 24, 2026',
                restoreUntil: 'Dec 24, 2026',
            },
        ],
        claims: [
            {
                orgId: 'org1',
                uid: 'priya',
                orgName: 'Eastside Shower Day',
                handle: 'eastside-shower-day',
                intent: 'claim',
                role: 'Volunteer coordinator',
                message:
                    'I run the Wednesday shower day. Call the church office on the number on our website and ask for me.',
                claimantName: 'Priya Patel',
                claimantUsername: 'priya-patel',
                claimantEmail: 'priya.patel@example.com',
                requestedOn: 'Nov 22, 2026',
                daysWaiting: 5,
            },
            {
                orgId: 'org2',
                uid: 'daniel',
                orgName: 'Westside Community Meal',
                handle: 'westside-community-meal',
                intent: 'remove',
                role: 'Pastor',
                message:
                    "We'd rather not be listed. You can reach me through the church office.",
                claimantName: 'Daniel Park',
                claimantUsername: 'daniel-park',
                claimantEmail: 'daniel.park@example.com',
                requestedOn: 'Nov 23, 2026',
                daysWaiting: 0,
            },
        ],
    },
} satisfies Meta<typeof AdminPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithRequests: Story = {};
export const Empty: Story = {
    args: {
        claims: [],
        overview: emptyOverview,
        analytics: { status: 'notConfigured' },
        organizations: {
            ...organizations,
            gapCounts: {
                contact: 0,
                phone: 0,
                email: 0,
                website: 0,
                address: 0,
            },
            missing: [],
            recent: [],
        },
        activity: {
            activity: {
                added: 0,
                edited: 0,
                claims: 0,
                lifecycle: 0,
                words: 0,
                exports: 0,
                comments: 2,
            },
            log: [],
        },
        deleted: [],
        definitionCount: 0,
    },
};
/** After restoring: the organization leaves the list and the result is announced. */
export const Restored: Story = {
    args: {
        deleted: [],
        restoreNotice: 'Restored. The page and its members are back.',
        restoreKey: 1,
    },
};
/** After approving: the request is gone and the result is announced. */
export const Approved: Story = {
    args: {
        claims: [],
        notice: 'Approved. They now own the organization.',
        resultKey: 1,
    },
};
export const Error: Story = {
    args: {
        error: 'Someone already decided that request. The list now shows the latest.',
        resultKey: 1,
    },
};
/** A search for "oak": the results and how many were found are announced. */
export const Searching: Story = {
    args: {
        organizations: {
            ...organizations,
            query: 'oak',
            results: recent.slice(1, 2),
        },
    },
};
export const Loading: Story = { render: () => <AdminPageLoading /> };

/** The counts failed (an index still building): those sections say so, the rest works. */
export const CountsUnavailable: Story = {
    args: {
        asOf: undefined,
        overview: null,
        definitionCount: undefined,
        organizations: { ...organizations, gapCounts: null, missing: null },
        activity: { activity: null, log: null },
    },
};
