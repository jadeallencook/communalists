import { describe, expect, it } from 'vitest';

import {
    profileSettingsOf,
    profileView,
    profileViewer,
    seesDetails,
    visibleGroups,
    type ProfileGroup,
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
        });
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

describe('profileView', () => {
    const person = {
        name: 'Maya Thompson',
        username: 'maya-thompson',
        areaLabel: 'San Jose, California',
        photoUrl: '/api/photos/user/u1?v=1',
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
            photoUrl: undefined,
            details: null,
        });
    });

    it('shows the photo only to people who see the details', () => {
        const photoFor = (
            visibility: 'public' | 'groups' | 'name',
            viewer: 'self' | 'groupmate' | 'signedIn' | 'public'
        ) =>
            profileView(
                { ...person, settings: profileSettingsOf({ visibility }) },
                viewer,
                new Set()
            ).photoUrl;
        expect(photoFor('public', 'public')).toBe(person.photoUrl);
        expect(photoFor('groups', 'groupmate')).toBe(person.photoUrl);
        expect(photoFor('groups', 'signedIn')).toBeUndefined();
        expect(photoFor('groups', 'public')).toBeUndefined();
        expect(photoFor('name', 'groupmate')).toBeUndefined();
        expect(photoFor('name', 'self')).toBe(person.photoUrl);
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
