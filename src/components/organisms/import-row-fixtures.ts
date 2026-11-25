import type { ImportRowCardProps } from './import-row-card';

// Import rows for Storybook (ImportRowCard, AdminImportPage), taken from the
// Bay Area research file. One ready, one with mistakes, one already listed.

type Row = Omit<
    ImportRowCardProps,
    'expanded' | 'onExpandedChange' | 'onEdit' | 'onRemove' | 'onRestore'
>;

export const readyRow: Row = {
    line: 5,
    name: 'San Francisco Food Not Bombs',
    placeLabel: 'San Francisco, California',
    handle: 'san-francisco-food-not-bombs',
    verification: 'official site',
    notes: 'Two crews: Friday (used here) and Wednesday. The serving schedule page had an out-of-date complaint from 2024; the homepage says it was updated in February 2026.',
    sources: ['https://sffnb.org/serving-schedule'],
    problems: [],
    preview: {
        name: 'San Francisco Food Not Bombs',
        handle: 'san-francisco-food-not-bombs',
        focusAreas: ['food'],
        description:
            'Cooks and shares free vegetarian meals every week: Wednesdays at the 16th and Mission BART plaza, and Fridays at 65 9th Street.',
        place: 'San Francisco, California',
        reach: { scope: 'local', radiusMiles: 10 },
        languages: ['en'],
        streetAddress: '65 9th St, San Francisco, CA',
        website: 'https://sffnb.org/',
        contactEmail: 'fnbsanfrancisco@gmail.com',
        phone: { text: '(415) 890-3184', href: 'tel:+14158903184' },
        socials: [
            { platform: 'instagram', handle: 'foodnotbombs_sf' },
            { platform: 'x', handle: 'sffoodnotbombs' },
        ],
    },
};

export const problemRow: Row = {
    line: 8,
    name: 'Town Fridges',
    placeLabel: 'Oakland, California',
    handle: 'town-fridges',
    verification: 'community wiki',
    notes: 'No single address: about 13 fridges. No website or email found.',
    sources: ['https://localwiki.org/oakland/Town_Fridges'],
    problems: [
        { column: 'focusAreas', key: 'focusAreasRequired', value: 'mutualAid' },
        {
            column: 'socials',
            key: 'socialPlatform',
            value: 'mastodon:@townfridges@mastodon.social',
        },
        { column: 'radiusMiles', key: 'radiusRequired', value: '30' },
    ],
    preview: {
        name: 'Town Fridges',
        handle: 'town-fridges',
        focusAreas: ['food'],
        description:
            'A volunteer network that keeps free outdoor fridges stocked with food and drinks for anyone who needs them, across Oakland, Berkeley and Alameda.',
        place: 'Oakland, California',
        reach: { scope: 'local' },
        languages: ['en'],
        socials: [{ platform: 'instagram', handle: 'townfridges' }],
    },
};

export const duplicateRow: Row = {
    line: 2,
    name: 'South Bay Mutual Aid',
    placeLabel: 'San Jose, California',
    handle: 'south-bay-mutual-aid',
    verification: 'official site',
    notes: 'Also on Mastodon, which the app has no platform for.',
    sources: ['https://southbaymutualaid.org/aboutsbma'],
    problems: [
        {
            column: 'name',
            key: 'sameName',
            value: 'South Bay Mutual Aid',
            match: {
                name: 'South Bay Mutual Aid',
                handle: 'sbma',
                place: 'San Jose, California',
                unclaimed: false,
            },
        },
    ],
    preview: {
        name: 'South Bay Mutual Aid',
        handle: 'south-bay-mutual-aid',
        focusAreas: ['general', 'food', 'clothing'],
        description:
            'A coalition of neighbors in Santa Clara and San Mateo counties. Runs a monthly free store and a community garden.',
        place: 'San Jose, California',
        reach: { scope: 'local', radiusMiles: 50 },
        languages: ['en', 'es'],
        website: 'https://southbaymutualaid.org/',
        socials: [{ platform: 'instagram', handle: 'southbaymutualaid' }],
    },
};

export const repeatedRow: Row = {
    ...readyRow,
    line: 31,
    problems: [
        {
            column: 'name',
            key: 'duplicateInFile',
            value: 'San Francisco Food Not Bombs',
            otherLine: 5,
        },
    ],
};
