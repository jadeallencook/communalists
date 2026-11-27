import { describe, expect, it } from 'vitest';

import {
    checkImportFile,
    checkImportRow,
    formValuesOf,
    IMPORT_MAX_ROWS,
    keepDatabaseProblems,
    previewOf,
    readImportFile,
    toCsv,
    valuesFromForm,
    type ImportProblem,
    type ImportRow,
} from './import';

const places: Record<string, string> = {
    '5392171': 'San Jose, California',
    '5391959': 'San Francisco, California',
};
const findPlace = (country: string, id: string) =>
    country === 'US' && places[id] ? { label: places[id] } : null;

const HEADER =
    'name,handle,focusAreas,description,foundedYear,country,placeId,placeLabel,streetAddress,reach,radiusMiles,languages,website,contactEmail,phone,socials,joinPolicy,visibility,memberListVisibility,verification,notes,sources';

const sbma =
    'South Bay Mutual Aid,south-bay-mutual-aid,general;food;clothing,"A coalition of neighbors, with a free store.",2020,US,5392171,"San Jose, CA",,local,50,en;es,https://southbaymutualaid.org/,southbaymutualaid@gmail.com,,instagram:southbaymutualaid;bluesky:southbaymutualaid.bsky.social,request,listed,members,official site,"Also on Mastodon.",https://southbaymutualaid.org/aboutsbma';

const row = (values: ImportRow['values']): ImportRow => ({
    line: 2,
    values: {
        name: 'Food Not Bombs',
        focusAreas: 'food',
        placeId: '5391959',
        reach: 'local',
        radiusMiles: '10',
        languages: 'en',
        ...values,
    },
});

describe('readImportFile', () => {
    it('refuses an empty file or one missing required columns', () => {
        expect(readImportFile('name,focusAreas\n')).toMatchObject({
            ok: false,
            problem: 'empty',
        });
        expect(readImportFile('name\nGLIDE')).toEqual({
            ok: false,
            problem: 'missingColumns',
            columns: ['focusAreas', 'placeId', 'reach', 'languages'],
        });
    });

    it('refuses too many rows', () => {
        const text = [
            HEADER,
            ...Array.from({ length: IMPORT_MAX_ROWS + 1 }, () => sbma),
        ].join('\n');
        expect(readImportFile(text)).toMatchObject({
            ok: false,
            problem: 'tooManyRows',
        });
    });

    it('reports columns it does not read', () => {
        const file = readImportFile(`${HEADER},mastodon\n${sbma},@x`);
        expect(file).toMatchObject({ ok: true, ignoredColumns: ['mastodon'] });
    });
});

describe('checkImportRow', () => {
    it('accepts a full row from the research CSV', () => {
        const file = checkImportFile(`${HEADER}\n${sbma}`, findPlace);
        expect(file.ok).toBe(true);
        if (!file.ok) return;
        const [checked] = file.rows;
        expect(checked.problems).toEqual([]);
        expect(checked.placeLabel).toBe('San Jose, California');
        expect(checked.sources).toEqual([
            'https://southbaymutualaid.org/aboutsbma',
        ]);
        expect(checked.input).toMatchObject({
            name: 'South Bay Mutual Aid',
            focusAreas: ['general', 'food', 'clothing'],
            languages: ['en', 'es'],
            radiusMiles: 50,
            foundedYear: 2020,
            socials: [
                { platform: 'instagram', handle: 'southbaymutualaid' },
                {
                    platform: 'bluesky',
                    handle: 'southbaymutualaid.bsky.social',
                },
            ],
        });
    });

    it('fills in the defaults: handle from the name, US, listed, request', () => {
        const checked = checkImportRow(row({}), findPlace);
        expect(checked.problems).toEqual([]);
        expect(checked.input).toMatchObject({
            handle: 'food-not-bombs',
            country: 'US',
            joinPolicy: 'request',
            visibility: 'listed',
            memberListVisibility: 'members',
        });
    });

    it('stores a phone number in E.164', () => {
        const checked = checkImportRow(
            row({ phone: '(415) 890-3184' }),
            findPlace
        );
        expect(checked.input?.phone).toBe('+14158903184');
    });

    it('names the column and the problem', () => {
        const checked = checkImportRow(
            row({
                focusAreas: 'food;mutualAid',
                languages: '',
                website: 'not a site',
                foundedYear: '20',
            }),
            findPlace
        );
        expect(checked.input).toBeUndefined();
        expect(checked.problems).toEqual(
            expect.arrayContaining([
                // Only the entry that's wrong, not the whole cell.
                {
                    column: 'focusAreas',
                    key: 'focusAreasRequired',
                    value: 'mutualAid',
                },
                { column: 'languages', key: 'languagesRequired' },
                { column: 'website', key: 'invalidUrl', value: 'not a site' },
                { column: 'foundedYear', key: 'invalidYear', value: '20' },
            ])
        );
    });

    it('needs one of the offered radiuses for a local group', () => {
        expect(
            checkImportRow(row({ radiusMiles: '7' }), findPlace).problems
        ).toEqual([
            { column: 'radiusMiles', key: 'radiusRequired', value: '7' },
        ]);
    });

    it('refuses an unknown social platform', () => {
        const checked = checkImportRow(
            row({ socials: 'instagram:fnb;mastodon:@fnb@mastodon.social' }),
            findPlace
        );
        expect(checked.problems).toContainEqual(
            expect.objectContaining({
                column: 'socials',
                key: 'socialPlatform',
            })
        );
    });

    it('catches an unknown place, or a label for a different city', () => {
        expect(
            checkImportRow(row({ placeId: '999' }), findPlace).problems
        ).toContainEqual(
            expect.objectContaining({ column: 'placeId', key: 'placeNotFound' })
        );
        expect(
            checkImportRow(row({ placeLabel: 'Oakland, CA' }), findPlace)
                .problems
        ).toContainEqual(
            expect.objectContaining({
                column: 'placeLabel',
                key: 'placeMismatch',
            })
        );
        expect(
            checkImportRow(row({ placeLabel: 'San Francisco, CA' }), findPlace)
                .problems
        ).toEqual([]);
    });

    it('refuses countries the app does not support yet', () => {
        expect(
            checkImportRow(row({ country: 'MX' }), findPlace).problems
        ).toContainEqual(
            expect.objectContaining({ column: 'country', key: 'placeRequired' })
        );
    });
});

describe('checkImportFile', () => {
    it('keeps only the first of two rows with the same handle or name', () => {
        const file = checkImportFile(
            `${HEADER}\n${sbma}\n${sbma.replace('south-bay-mutual-aid,', 'sbma-2,')}`,
            findPlace
        );
        if (!file.ok) throw new Error('expected ok');
        expect(file.rows[0].input).toBeDefined();
        expect(file.rows[1].input).toBeUndefined();
        expect(file.rows[1].problems).toContainEqual(
            expect.objectContaining({
                column: 'name',
                key: 'duplicateInFile',
                otherLine: 2,
            })
        );
    });
});

describe('toCsv', () => {
    it('writes every column and reads back the same values', () => {
        const values = {
            name: 'CALMA (Laborers, Migrants, & Asylum Seekers)',
            description: 'Says "hello"\non two lines',
            focusAreas: 'general;labor',
        };
        const file = readImportFile(toCsv([values]));
        if (!file.ok) throw new Error('expected ok');
        expect(file.rows[0].values).toMatchObject(values);
        expect(file.rows[0].values.handle).toBe('');
    });
});

describe('previewOf', () => {
    it('keeps what can be read and leaves out what is wrong', () => {
        const preview = previewOf(
            {
                name: 'Town Fridges',
                focusAreas: 'food;mutualAid',
                languages: 'en;xx',
                reach: 'local',
                radiusMiles: '30',
                phone: '415-890-3184',
                website: 'not a site',
                socials: 'instagram:townfridges;mastodon:@x@y.social',
            },
            'Oakland, California'
        );
        expect(preview).toMatchObject({
            handle: 'town-fridges',
            focusAreas: ['food'],
            languages: ['en'],
            reach: { scope: 'local' },
            phone: { text: '(415) 890-3184', href: 'tel:+14158903184' },
            website: undefined,
            socials: [{ platform: 'instagram', handle: 'townfridges' }],
            place: 'Oakland, California',
        });
    });
});

describe('editing a row with the create form', () => {
    it('round-trips through the form and keeps the research columns', () => {
        const before = {
            ...row({}).values,
            handle: 'fnb-sf',
            socials: 'instagram:fnb;x:fnbsf',
            notes: 'Check hours.',
            sources: 'https://example.org',
        };
        const form = {
            ...formValuesOf(before),
            country: 'US',
            placeId: '5391959',
        };
        const after = valuesFromForm(form, 'San Francisco, California', before);
        expect(after).toMatchObject({
            name: 'Food Not Bombs',
            handle: 'fnb-sf',
            socials: 'instagram:fnb;x:fnbsf',
            placeLabel: 'San Francisco, California',
            notes: 'Check hours.',
            sources: 'https://example.org',
        });
        expect(
            checkImportRow({ line: 2, values: after }, findPlace).problems
        ).toEqual([]);
    });

    it('drops the radius for groups that are not local', () => {
        const form = {
            ...formValuesOf(row({}).values),
            reach: 'national',
            country: 'US',
            placeId: '5391959',
        };
        expect(valuesFromForm(form, '', {}).radiusMiles).toBe('');
    });
});

describe('keepDatabaseProblems', () => {
    const sameName: ImportProblem = {
        column: 'name',
        key: 'sameName',
        match: { name: 'X', handle: 'x', place: 'Y', unclaimed: false },
    };
    it('keeps earlier database problems for rows not checked again', () => {
        const previous = [
            { line: 2, problems: [sameName] },
            { line: 3, problems: [sameName] },
        ];
        const next = [
            { line: 2, problems: [] },
            { line: 3, problems: [] },
        ];
        expect(keepDatabaseProblems(next, previous, new Set([3]))).toEqual([
            { line: 2, problems: [sameName] },
            { line: 3, problems: [] },
        ]);
    });

    it('drops earlier rule problems, which are always checked again', () => {
        const previous = [
            {
                line: 2,
                problems: [
                    { column: 'name', key: 'required' } as ImportProblem,
                ],
            },
        ];
        expect(
            keepDatabaseProblems(
                [{ line: 2, problems: [] }],
                previous,
                new Set()
            )
        ).toEqual([{ line: 2, problems: [] }]);
    });
});
