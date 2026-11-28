import { describe, expect, it } from 'vitest';

import {
    isStricter,
    profileSettingsOf,
    profileSummary,
    profileView,
    profileViewer,
    seesDetails,
    visibleComrades,
    visibleEndorsements,
    visibleGroups,
    visiblePhoto,
    type ProfileComrade,
    type ProfileEndorsement,
    type ProfileGroup,
    type ProfileViewer,
} from './profiles';

const group = (
    orgId: string,
    overrides: Partial<ProfileGroup> = {}
): ProfileGroup => ({
    orgId,
    name: orgId,
    handle: orgId,
    role: 'member',
    listed: true,
    memberList: 'members',
    ...overrides,
});

describe('profileSettingsOf', () => {
    it('is private by default: shares with groups, area off, empty fields', () => {
        expect(profileSettingsOf(undefined)).toEqual({
            visibility: 'groups',
            pronouns: undefined,
            bio: undefined,
            languages: [],
            showArea: false,
            socials: [],
            website: undefined,
            groups: { show: true, hidden: [] },
            endorsements: { show: true },
            comrades: { show: true, requests: 'anyone' },
        });
    });

    it('reads the comrades settings, defaulting unknown values', () => {
        expect(
            profileSettingsOf({ comrades: { show: false, requests: 'groups' } })
                .comrades
        ).toEqual({ show: false, requests: 'groups' });
        expect(
            profileSettingsOf({ comrades: { requests: 'everyone!' } }).comrades
        ).toEqual({ show: true, requests: 'anyone' });
    });

    it('drops unknown values', () => {
        const s = profileSettingsOf({
            visibility: 'everyone!',
            languages: ['vi', 'klingon'],
            showArea: 'yes',
        });
        expect(s.visibility).toBe('groups');
        expect(s.languages).toEqual(['vi']);
        expect(s.showArea).toBe(false);
    });
});

describe('who sees details', () => {
    it('follows the visibility level', () => {
        const viewers = ['self', 'groupmate', 'signedIn', 'public'] as const;
        const see = (v: 'public' | 'groups' | 'name') =>
            viewers.filter((viewer) => seesDetails(v, viewer));
        expect(see('public')).toEqual([...viewers]);
        expect(see('groups')).toEqual(['self', 'groupmate']);
        expect(see('name')).toEqual(['self']);
    });

    it('works out the viewer', () => {
        expect(
            profileViewer({ isSelf: true, signedIn: true, sharesGroup: false })
        ).toBe('self');
        expect(
            profileViewer({
                isSelf: false,
                signedIn: false,
                sharesGroup: false,
            })
        ).toBe('public');
        expect(
            profileViewer({ isSelf: false, signedIn: true, sharesGroup: true })
        ).toBe('groupmate');
        expect(
            profileViewer({ isSelf: false, signedIn: true, sharesGroup: false })
        ).toBe('signedIn');
    });
});

describe('visibleGroups', () => {
    const groups = [
        group('public-list', { memberList: 'public' }),
        group('private-list'), // members only
        group('led', { role: 'owner' }), // owners are always named
        group('secret', { listed: false, role: 'owner', memberList: 'public' }),
        group('shared'), // the viewer is in it
    ];
    const settings = profileSettingsOf({ visibility: 'public' });
    const ids = (list: ProfileGroup[]) => list.map((g) => g.orgId);

    it("never lists a group whose page wouldn't name this person to the viewer", () => {
        expect(
            ids(visibleGroups(groups, settings, 'public', new Set()))
        ).toEqual(['public-list', 'led']);
    });

    it('lists groups the viewer shares, unlisted ones included', () => {
        expect(
            ids(
                visibleGroups(
                    groups,
                    settings,
                    'groupmate',
                    new Set(['shared', 'secret'])
                )
            )
        ).toEqual(['public-list', 'led', 'secret', 'shared']);
    });

    it("respects the person's own choices, but shows them everything", () => {
        const hiding = profileSettingsOf({
            visibility: 'public',
            groups: { show: true, hidden: ['led'] },
        });
        expect(ids(visibleGroups(groups, hiding, 'public', new Set()))).toEqual(
            ['public-list']
        );
        const off = profileSettingsOf({
            visibility: 'public',
            groups: { show: false, hidden: [] },
        });
        expect(visibleGroups(groups, off, 'public', new Set())).toEqual([]);
        expect(visibleGroups(groups, off, 'self', new Set())).toHaveLength(5);
    });
});

describe('visibleEndorsements', () => {
    const endorsement = (orgId: string, listed = true): ProfileEndorsement => ({
        orgId,
        name: orgId,
        handle: orgId,
        listed,
    });
    const all = [endorsement('garden'), endorsement('went-unlisted', false)];
    const settings = (visibility: 'public' | 'groups' | 'name', show = true) =>
        profileSettingsOf({ visibility, endorsements: { show } });
    const none = new Set<string>();

    it('follow the profile visibility, like the bio', () => {
        expect(
            visibleEndorsements(all, settings('public'), 'public', none)
        ).toEqual([all[0]]);
        expect(
            visibleEndorsements(all, settings('groups'), 'signedIn', none)
        ).toEqual([]);
        expect(
            visibleEndorsements(all, settings('groups'), 'groupmate', none)
        ).toEqual([all[0]]);
        expect(
            visibleEndorsements(all, settings('name'), 'groupmate', none)
        ).toEqual([]);
    });

    it('can be turned off, except for the person themself', () => {
        expect(
            visibleEndorsements(all, settings('public', false), 'public', none)
        ).toEqual([]);
        expect(
            visibleEndorsements(all, settings('name', false), 'self', none)
        ).toEqual(all);
    });

    it('show a group that became unlisted only to its members', () => {
        expect(
            visibleEndorsements(
                all,
                settings('public'),
                'signedIn',
                new Set(['went-unlisted'])
            )
        ).toEqual(all);
    });

    it('are on by default, and missing from stored profiles means on', () => {
        expect(profileSettingsOf({}).endorsements.show).toBe(true);
        expect(
            profileSettingsOf({ endorsements: { show: false } }).endorsements
                .show
        ).toBe(false);
    });

    it('come with the profile view', () => {
        const view = profileView(
            {
                name: 'Maya',
                username: 'maya',
                settings: settings('public'),
                groups: [],
                endorsements: all,
            },
            'public',
            none
        );
        expect(view.details?.endorsements).toEqual([all[0]]);
    });
});

describe('profileView', () => {
    const person = {
        name: 'Maya Thompson',
        username: 'maya-thompson',
        areaLabel: 'San Jose, California',
        groups: [group('a', { memberList: 'public' })],
    };

    it('shows only the name when details are hidden', () => {
        expect(
            profileView(
                {
                    ...person,
                    settings: profileSettingsOf({
                        visibility: 'name',
                        pronouns: 'she/her',
                        bio: 'Hi',
                    }),
                },
                'groupmate',
                new Set()
            )
        ).toEqual({
            name: 'Maya Thompson',
            username: 'maya-thompson',
            pronouns: undefined,
            details: null,
        });
    });

    it('shows the city only when turned on', () => {
        const view = (showArea: boolean) =>
            profileView(
                {
                    ...person,
                    settings: profileSettingsOf({
                        visibility: 'public',
                        showArea,
                    }),
                },
                'public',
                new Set()
            ).details?.area;
        expect(view(false)).toBeUndefined();
        expect(view(true)).toBe('San Jose, California');
    });
});

describe('photos follow profile visibility', () => {
    const photo = 'https://example.test/large.webp';

    it('shows the photo only to viewers who see details', () => {
        expect(visiblePhoto(photo, 'public', 'public')).toBe(photo);
        expect(visiblePhoto(photo, 'groups', 'groupmate')).toBe(photo);
        expect(visiblePhoto(photo, 'groups', 'signedIn')).toBeUndefined();
        expect(visiblePhoto(photo, 'groups', 'public')).toBeUndefined();
        expect(visiblePhoto(photo, 'name', 'groupmate')).toBeUndefined();
        expect(visiblePhoto(photo, 'name', 'self')).toBe(photo);
        expect(visiblePhoto(undefined, 'public', 'public')).toBeUndefined();
    });

    it('leaves the photo off a "Just my name" profile', () => {
        const view = profileView(
            {
                name: 'Wei Chen',
                username: 'wei-chen',
                photo,
                settings: profileSettingsOf({ visibility: 'name' }),
                groups: [],
            },
            'groupmate',
            new Set()
        );
        expect(view.photo).toBeUndefined();
    });

    it('counts only changes that share with fewer people as stricter', () => {
        expect(isStricter('public', 'groups')).toBe(true);
        expect(isStricter('groups', 'name')).toBe(true);
        expect(isStricter('public', 'name')).toBe(true);
        expect(isStricter('name', 'public')).toBe(false);
        expect(isStricter('groups', 'groups')).toBe(false);
    });
});

describe('profileSummary', () => {
    const person = {
        name: 'Maya Thompson',
        username: 'maya-thompson',
        areaLabel: 'San Jose, California',
        groups: [],
    };

    it('joins pronouns, city and bio from what the viewer sees', () => {
        const view = profileView(
            {
                ...person,
                settings: profileSettingsOf({
                    visibility: 'public',
                    pronouns: 'she/her',
                    showArea: true,
                    bio: 'Organizer.\n\nI drive the  grocery route.',
                }),
            },
            'public',
            new Set()
        );
        expect(profileSummary(view)).toBe(
            'she/her · San Jose, California. Organizer. I drive the grocery route.'
        );
    });

    it('is empty when a signed-out visitor sees only the name', () => {
        const view = profileView(
            {
                ...person,
                settings: profileSettingsOf({
                    visibility: 'groups',
                    bio: 'Private bio',
                }),
            },
            'public',
            new Set()
        );
        expect(profileSummary(view)).toBe('');
    });
});

describe('comrades (decision #74)', () => {
    it('makes comrades a viewer of their own, ahead of sharing a group', () => {
        expect(
            profileViewer({
                isSelf: false,
                signedIn: true,
                sharesGroup: true,
                isComrade: true,
            })
        ).toBe('comrade');
        expect(
            profileViewer({
                isSelf: false,
                signedIn: false,
                sharesGroup: false,
                isComrade: true,
            })
        ).toBe('public');
    });

    it('shows comrades the details at every level, "Only my comrades" too', () => {
        for (const level of ['public', 'groups', 'name'] as const)
            expect(seesDetails(level, 'comrade')).toBe(true);
        expect(seesDetails('name', 'groupmate')).toBe(false);
        expect(visiblePhoto('p.webp', 'name', 'comrade')).toBe('p.webp');
    });

    const settings = profileSettingsOf({ visibility: 'public' });
    const comrades: ProfileComrade[] = [
        {
            uid: 'pub',
            name: 'Pub',
            username: 'pub',
            photo: 'a',
            visibility: 'public',
        },
        {
            uid: 'grp',
            name: 'Grp',
            username: 'grp',
            photo: 'b',
            visibility: 'groups',
        },
        {
            uid: 'priv',
            name: 'Priv',
            username: 'priv',
            photo: 'c',
            visibility: 'name',
        },
    ];
    const none = new Map<string, ProfileViewer>();

    it('lists each comrade only if their own visibility shows this viewer their details', () => {
        expect(
            visibleComrades(comrades, settings, 'public', none).map(
                (c) => c.uid
            )
        ).toEqual(['pub']);
        expect(
            visibleComrades(comrades, settings, 'signedIn', none).map(
                (c) => c.uid
            )
        ).toEqual(['pub']);
        const related = new Map<string, ProfileViewer>([
            ['grp', 'groupmate'],
            ['priv', 'comrade'],
        ]);
        expect(
            visibleComrades(comrades, settings, 'signedIn', related).map(
                (c) => c.uid
            )
        ).toEqual(['pub', 'grp', 'priv']);
    });

    it('lists someone to themself, though their own profile is private', () => {
        const related = new Map<string, ProfileViewer>([['priv', 'self']]);
        expect(
            visibleComrades(comrades, settings, 'signedIn', related).map(
                (c) => c.uid
            )
        ).toEqual(['pub', 'priv']);
    });

    it("follows the owner's visibility and their show setting", () => {
        const privateOwner = profileSettingsOf({ visibility: 'name' });
        expect(
            visibleComrades(comrades, privateOwner, 'signedIn', none)
        ).toEqual([]);
        expect(
            visibleComrades(comrades, privateOwner, 'comrade', none).map(
                (c) => c.uid
            )
        ).toEqual(['pub']);
        const hidden = profileSettingsOf({
            visibility: 'public',
            comrades: { show: false },
        });
        expect(visibleComrades(comrades, hidden, 'public', none)).toEqual([]);
    });

    it('shows the owner all of them, with photos', () => {
        const all = visibleComrades(comrades, settings, 'self', none);
        expect(all.map((c) => c.photo)).toEqual(['a', 'b', 'c']);
    });

    it("gives photos only where the comrade's visibility allows", () => {
        const related = new Map<string, ProfileViewer>([['grp', 'groupmate']]);
        const shown = visibleComrades(comrades, settings, 'signedIn', related);
        expect(shown.map((c) => c.photo)).toEqual(['a', 'b']);
    });

    it('puts comrades on the profile view', () => {
        const view = profileView(
            {
                name: 'Maya',
                username: 'maya',
                settings,
                groups: [],
                comrades,
            },
            'public',
            new Set()
        );
        expect(view.details?.comrades.map((c) => c.uid)).toEqual(['pub']);
    });
});
