import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { AdminPage, AdminPageLoading } from './admin-page';

const meta = {
    title: 'Pages/Admin',
    component: AdminPage,
    parameters: { layout: 'fullscreen' },
    args: {
        locale: 'en',
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
            },
        ],
        unclaimed: [
            {
                name: 'Eastside Shower Day',
                handle: 'eastside-shower-day',
                focusAreas: ['hygiene', 'health'],
                detail: 'San Jose, California',
            },
            {
                name: 'Westside Community Meal',
                handle: 'westside-community-meal',
                focusAreas: ['food'],
                detail: 'San Jose, California',
            },
        ],
        log: [
            {
                id: '1',
                action: 'createUnclaimed',
                orgName: 'Westside Community Meal',
                actorName: 'Jordan Lee',
                on: 'Nov 21, 2026',
            },
            {
                id: '2',
                action: 'approveClaim',
                orgName: 'Little Saigon Food Pantry',
                actorName: 'Jordan Lee',
                targetName: 'Thanh Nguyễn',
                on: 'Nov 20, 2026',
            },
            {
                id: '3',
                action: 'createDefinition',
                orgName: '',
                actorName: 'Jordan Lee',
                word: 'Mutual aid',
                on: 'Nov 19, 2026',
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
        unclaimed: [],
        deleted: [],
        log: [],
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
export const Loading: Story = { render: () => <AdminPageLoading /> };
