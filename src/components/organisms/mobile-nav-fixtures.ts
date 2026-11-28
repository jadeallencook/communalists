import { fn } from 'storybook/test';

import type { NavLinkData } from '@/components/molecules/header-links';

import type { MobileNavAccount } from './mobile-nav';

export const publicLinks: NavLinkData[] = [
    { key: 'organizations', href: '/find/organizations' },
    { key: 'dictionary', href: '/dictionary' },
    { key: 'graphics', href: '/graphics' },
];

export const signedInLinks: NavLinkData[] = [
    ...publicLinks,
    { key: 'dashboard', href: '/dashboard' },
];

export const account: MobileNavAccount = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    locale: 'en',
    username: 'ada-lovelace',
    organizations: [
        { name: 'Oakland Auto Club', handle: 'oakland-auto-club' },
        { name: 'South Bay Mutual Aid', handle: 'south-bay-mutual-aid' },
    ],
    signOutAction: fn(),
};

export const manyOrganizations = [
    { name: 'East Oakland Collective', handle: 'east-oakland-collective' },
    { name: 'Food Not Bombs San José', handle: 'fnb-san-jose' },
    { name: 'Oakland Auto Club', handle: 'oakland-auto-club' },
    {
        name: 'Santa Clara County Tenant Union and Mutual Aid Network',
        handle: 'sccounty-tenants',
    },
    { name: 'South Bay Mutual Aid', handle: 'south-bay-mutual-aid' },
];
