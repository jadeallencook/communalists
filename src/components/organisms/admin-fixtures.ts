import type { AdminActivityProps } from './admin-activity';
import type { AdminAnalyticsProps } from './admin-analytics';
import type {
    AdminOrganizationItem,
    AdminOrganizationsProps,
} from './admin-organizations';
import type { AdminOverviewProps } from './admin-overview';

// Mock super-user dashboard data for Storybook (AdminOverview,
// AdminOrganizations, AdminActivity, AdminPage): roughly what production
// looks like after the Bay Area import.

const weekLabels = [
    'Sep 5',
    'Sep 12',
    'Sep 19',
    'Sep 26',
    'Oct 3',
    'Oct 10',
    'Oct 17',
    'Oct 24',
    'Oct 31',
    'Nov 7',
    'Nov 14',
    'Nov 21',
];
const series = {
    users: [0, 1, 0, 2, 1, 3, 2, 4, 3, 6, 5, 9],
    organizations: [0, 0, 1, 0, 2, 0, 0, 0, 1, 2, 486, 28],
    claims: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 3],
};

export const overview: AdminOverviewProps = {
    organizations: {
        active: 521,
        unclaimed: 509,
        archived: 4,
        claimed: 5,
        addedLast30: 516,
        addedPrevious30: 3,
        claimedLast30: 4,
    },
    users: { total: 36, last7: 9, last30: 23, previous30: 8 },
    claims: {
        approved: 5,
        denied: 1,
        receivedLast30: 6,
        receivedPrevious30: 0,
    },
    trends: weekLabels.map((label, i) => ({
        label,
        users: series.users[i],
        organizations: series.organizations[i],
        claims: series.claims[i],
    })),
};

export const emptyOverview: AdminOverviewProps = {
    organizations: {
        active: 0,
        unclaimed: 0,
        archived: 0,
        claimed: 0,
        addedLast30: 0,
        addedPrevious30: 0,
        claimedLast30: 0,
    },
    users: { total: 0, last7: 0, last30: 0, previous30: 0 },
    claims: {
        approved: 0,
        denied: 0,
        receivedLast30: 0,
        receivedPrevious30: 0,
    },
    trends: weekLabels.map((label) => ({
        label,
        users: 0,
        organizations: 0,
        claims: 0,
    })),
};

const org = (
    name: string,
    handle: string,
    more: Partial<AdminOrganizationItem> = {}
): AdminOrganizationItem => ({
    id: handle,
    name,
    handle,
    place: 'San Jose, California',
    unclaimed: true,
    archived: false,
    addedOn: 'Nov 18, 2026',
    missingDetails: [],
    ...more,
});

export const missingContact: AdminOrganizationItem[] = [
    org('Eastside Shower Day', 'eastside-shower-day', {
        missingDetails: ['contact', 'phone', 'email', 'website', 'address'],
    }),
    org('Westside Community Meal', 'westside-community-meal', {
        place: 'Oakland, California',
        missingDetails: ['contact', 'phone', 'email', 'website'],
    }),
];

export const recent: AdminOrganizationItem[] = [
    org('Downtown Free Laundry', 'downtown-free-laundry', {
        addedOn: 'Nov 26, 2026',
        missingDetails: ['email', 'address'],
    }),
    org('Oakland Auto Club', 'oakland-auto-club', {
        place: 'Oakland, California',
        unclaimed: false,
        addedOn: 'Nov 25, 2026',
    }),
    org('Mistake Pantry', 'mistake-pantry', {
        unclaimed: false,
        archived: true,
        addedOn: 'Nov 24, 2026',
    }),
];

export const organizations: AdminOrganizationsProps = {
    searchLimit: 10,
    gap: 'contact',
    gapCounts: {
        contact: 62,
        phone: 210,
        email: 301,
        website: 88,
        address: 145,
    },
    missing: missingContact,
    recent,
};

export const activity: AdminActivityProps = {
    activity: {
        added: 516,
        edited: 14,
        claims: 6,
        lifecycle: 2,
        words: 9,
        exports: 3,
        comments: 2,
    },
    log: [
        {
            id: '2',
            action: 'approveClaim',
            orgName: 'Little Saigon Food Pantry',
            actorName: 'Jordan Lee',
            targetName: 'Thanh Nguyễn',
            on: 'Nov 20, 2026',
        },
        {
            id: '4',
            action: 'denyClaim',
            orgName: 'Westside Community Meal',
            actorName: 'Jordan Lee',
            targetName: 'Maya Thompson',
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
};

export const analytics: Extract<AdminAnalyticsProps, { status: 'ok' }> = {
    status: 'ok',
    asOf: 'Nov 27, 2026, 10:30 AM',
    visitors: 1284,
    pageviews: 5610,
    previous: { visitors: 902, pageviews: 4100 },
    radiusMiles: 25,
    organizations: [
        { handle: 'sbma', name: 'South Bay Mutual Aid', views: 412 },
        { handle: 'oakland-auto-club', name: 'Oakland Auto Club', views: 198 },
        { handle: 'old-pantry', views: 12 },
    ],
    cities: [
        {
            slug: 'us/ca/oakland',
            label: 'Oakland, California',
            views: 890,
            nearby: 41,
        },
        {
            slug: 'us/ca/fresno',
            label: 'Fresno, California',
            views: 120,
            nearby: 1,
        },
        {
            slug: 'us/ca/stockton',
            label: 'Stockton, California',
            views: 64,
            nearby: 0,
        },
    ],
};
