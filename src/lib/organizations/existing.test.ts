import { describe, expect, it } from 'vitest';

import {
    EXISTING_COLUMNS,
    existingFromDocument,
    existingToCsv,
    findKnown,
    nameKey,
    readKnownFile,
    socialKeys,
    websiteKey,
} from './existing';

const doc = {
    name: 'South Bay Mutual Aid',
    handle: 'south-bay-mutual-aid',
    status: 'active',
    claimStatus: 'unclaimed',
    visibility: 'listed',
    location: { placeId: '5392171', label: 'San Jose, California', lat: 1 },
    website: 'https://southbay.example.org/',
    phone: '+14085550123',
    socials: [{ platform: 'instagram', handle: 'southbayaid' }],
    createdBy: 'uid-123',
    description: 'Not exported',
};

describe('existingFromDocument', () => {
    it('keeps the organization details and nothing else', () => {
        const row = existingFromDocument(doc);
        expect(Object.keys(row)).toEqual([...EXISTING_COLUMNS]);
        expect(row).toMatchObject({
            placeId: '5392171',
            placeLabel: 'San Jose, California',
            claimStatus: 'unclaimed',
            socials: 'instagram:southbayaid',
            contactEmail: '',
        });
        expect(JSON.stringify(row)).not.toContain('uid-123');
    });

    it('calls an organization without the unclaimed mark claimed', () => {
        expect(
            existingFromDocument({ ...doc, claimStatus: undefined }).claimStatus
        ).toBe('claimed');
    });
});

describe('existingToCsv and readKnownFile', () => {
    it('round-trips, quoting commas and defusing formulas', () => {
        const rows = [
            existingFromDocument({ ...doc, name: 'Food, Not Bombs' }),
            existingFromDocument({ ...doc, name: '=HYPERLINK("x")' }),
        ];
        const csv = existingToCsv(rows);
        expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
        expect(csv).toContain(`'+14085550123`);
        const known = readKnownFile(csv, 'existing.csv');
        expect(known.map((k) => k.name).sort()).toEqual([
            '=HYPERLINK("x")',
            'Food, Not Bombs',
        ]);
        expect(known[0]).toMatchObject({
            phone: '+14085550123',
            source: 'existing.csv',
            line: 2,
        });
    });

    it('reads any file with a name column, and nothing from one without', () => {
        expect(
            readKnownFile('name,reason\nOld Pantry,closed in 2024\n', 'r.csv')
        ).toMatchObject([{ name: 'Old Pantry', reason: 'closed in 2024' }]);
        expect(readKnownFile('title\nx\n', 'r.csv')).toEqual([]);
    });
});

describe('keys', () => {
    it('folds names', () => {
        expect(nameKey('The Café & Pantry, Inc.')).toBe('cafe and pantry inc');
    });

    it('compares websites by host and path', () => {
        expect(websiteKey('http://www.Example.org/Pantry/')).toBe(
            'example.org/pantry'
        );
        expect(websiteKey('example.org')).toBe('example.org');
        expect(websiteKey('not a site')).toBe('');
    });

    it('reads socials leniently', () => {
        expect(socialKeys('instagram:@SJAid; x:sjaid;bad;tiktok:')).toEqual([
            'instagram:sjaid',
            'x:sjaid',
        ]);
    });
});

describe('findKnown', () => {
    const known = readKnownFile(
        existingToCsv([
            existingFromDocument(doc),
            existingFromDocument({
                ...doc,
                name: 'Oakland Auto Club',
                website: '',
                phone: '',
                socials: [],
            }),
        ]),
        'existing.csv'
    );

    it('finds the same website, social, name or phone', () => {
        const reason = (c: Parameters<typeof findKnown>[0]) =>
            findKnown(c, known)[0]?.reason;
        expect(reason({ name: 'X', website: 'southbay.example.org' })).toBe(
            'website'
        );
        expect(reason({ name: 'X', socials: 'instagram:SouthBayAid' })).toBe(
            'social'
        );
        expect(reason({ name: 'south bay mutual-aid' })).toBe('name');
        expect(reason({ name: 'X', phone: '(408) 555-0123' })).toBe('phone');
    });

    it('flags a similar name as a maybe', () => {
        expect(
            findKnown({ name: 'Oakland Auto Club Tool Library' }, known)[0]
        ).toMatchObject({ reason: 'similarName' });
    });

    it('ignores one-word overlaps and unrelated groups', () => {
        expect(findKnown({ name: 'Oakland' }, known)).toEqual([]);
        expect(findKnown({ name: 'Fresno Free Fridge' }, known)).toEqual([]);
    });
});
