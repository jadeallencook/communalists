import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { OrganizationFilters } from '@/components/organisms/organization-filters';
import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';
import type {
    DirectoryOrganization,
    DirectoryResults,
} from '@/lib/organizations/directory';
import { parseDirectorySearch } from '@/lib/organizations/directory';

import {
    FindOrganizationsPage,
    FindOrganizationsPageLoading,
} from './find-organizations-page';

const search = parseDirectorySearch({ country: 'US', placeId: '5392171' });

const filters = (
    <OrganizationFilters
        action="/en/find"
        search={search}
        location={{
            countries: [{ code: 'US', name: 'United States' }],
            country: 'US',
            onCountryChange: fn(),
            query: '',
            onQueryChange: fn(),
            options: [],
            selected: { id: '5392171', label: 'San Jose, California' },
            onSelect: fn(),
        }}
        languageOptions={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'vi', label: 'Vietnamese' },
            { value: 'zh', label: 'Chinese' },
        ]}
        activeFilters={0}
        onFiltersChange={fn()}
    />
);

const org = (
    name: string,
    handle: string,
    focusAreas: DirectoryOrganization['focusAreas'],
    label: string,
    reach: DirectoryOrganization['reach'] = 'local'
): DirectoryOrganization => ({
    id: handle,
    name,
    handle,
    focusAreas,
    location: { label, country: 'US', lat: 0, lng: 0 },
    reach,
    languages: ['en'],
    joinPolicy: 'request',
    memberCount: 4,
    description:
        'Neighbors helping neighbors: groceries, rides and help finding housing.',
    website: 'https://example.org',
    socials: [{ platform: 'instagram', handle: 'example' }],
});

const results: DirectoryResults = {
    local: [
        {
            org: org(
                'South Bay Mutual Aid',
                'sbma',
                ['general', 'food', 'housing'],
                'San Jose, California'
            ),
            distanceMiles: 0,
        },
        {
            org: org(
                'Santa Clara Community Garden',
                'sc-community-garden',
                ['environment', 'food'],
                'Santa Clara, California'
            ),
            distanceMiles: 3,
        },
        {
            org: org(
                'Fremont Childcare Co-op',
                'fremont-childcare',
                ['childcare', 'education'],
                'Fremont, California'
            ),
            distanceMiles: 15,
        },
    ],
    national: [],
    international: [
        {
            org: org(
                'Mutual Aid Disaster Network',
                'disaster-network',
                ['disasterRelief', 'health'],
                'Oakland, California',
                'international'
            ),
            distanceMiles: 39,
        },
    ],
};

const meta = {
    title: 'Pages/Find Organizations',
    component: FindOrganizationsPage,
    parameters: { layout: 'fullscreen' },
    args: {
        filters,
        results,
        cityLabel: 'San Jose, California',
        radiusMiles: 25,
        reach: ['local', 'national', 'international'],
        canCreate: true,
    },
    decorators: [
        (Story) => (
            <>
                <SiteHeader />
                <main>
                    <Story />
                </main>
                <SiteFooter />
            </>
        ),
    ],
} satisfies Meta<typeof FindOrganizationsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Local results closest first; an empty Nationwide section says so. */
export const WithResults: Story = {};

/** Signed out with no city chosen yet. */
export const NoCity: Story = {
    args: { results: null, cityLabel: undefined, canCreate: false },
};

/** Signed out with no city chosen: San Francisco as a labelled starting point. */
export const DefaultCity: Story = {
    args: {
        cityLabel: 'San Francisco, California',
        defaultCity: true,
        canCreate: false,
    },
};

/** Nothing matches the filters. */
export const NoMatches: Story = {
    args: { results: { local: [], national: [], international: [] } },
};

/** Only local groups chosen. */
export const LocalOnly: Story = { args: { reach: ['local'] } };

/** A filter changed: old results dim until new ones arrive. */
export const Updating: Story = { args: { pending: true } };

export const Loading: Story = {
    render: () => <FindOrganizationsPageLoading />,
};
