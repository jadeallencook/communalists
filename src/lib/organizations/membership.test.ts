import { describe, expect, it } from 'vitest';

import {
    allowedRoleChanges,
    canActOn,
    joinState,
    moderationProblem,
    sortMembers,
    visibleMembers,
} from './membership';

describe('canActOn', () => {
    it('lets owners act on moderators and members, moderators on members only, and nobody on owners', () => {
        expect(canActOn('owner', 'moderator')).toBe(true);
        expect(canActOn('owner', 'member')).toBe(true);
        expect(canActOn('owner', 'owner')).toBe(false);
        expect(canActOn('moderator', 'member')).toBe(true);
        expect(canActOn('moderator', 'moderator')).toBe(false);
        expect(canActOn('moderator', 'owner')).toBe(false);
        expect(canActOn('member', 'member')).toBe(false);
        expect(canActOn(null, 'member')).toBe(false);
    });
});

describe('allowedRoleChanges', () => {
    it('lets owners make owners and moderators, and demote moderators', () => {
        expect(allowedRoleChanges('owner', 'member')).toEqual([
            'makeModerator',
            'makeOwner',
        ]);
        expect(allowedRoleChanges('owner', 'moderator')).toEqual([
            'makeOwner',
            'makeMember',
        ]);
        expect(allowedRoleChanges('owner', 'owner')).toEqual([]);
    });

    it('lets moderators make moderators only, and members nothing', () => {
        expect(allowedRoleChanges('moderator', 'member')).toEqual([
            'makeModerator',
        ]);
        expect(allowedRoleChanges('moderator', 'moderator')).toEqual([]);
        expect(allowedRoleChanges('moderator', 'owner')).toEqual([]);
        expect(allowedRoleChanges('member', 'member')).toEqual([]);
        expect(allowedRoleChanges(null, 'member')).toEqual([]);
    });
});

describe('moderationProblem', () => {
    const member = {
        uid: 'b',
        role: 'member' as const,
        status: 'active' as const,
    };
    const pending = { ...member, status: 'pending' as const };
    const check = (
        overrides: Partial<Parameters<typeof moderationProblem>[0]>
    ) =>
        moderationProblem({
            action: 'remove',
            actorUid: 'a',
            actorRole: 'moderator',
            target: member,
            reason: 'Spam',
            ...overrides,
        });

    it('allows a moderator to remove a member with a reason', () => {
        expect(check({})).toBeNull();
    });

    it('requires a reason to remove, ban or block, but not to approve, deny or unban', () => {
        expect(check({ reason: '   ' })).toBe('reasonRequired');
        expect(check({ action: 'ban', reason: undefined })).toBe(
            'reasonRequired'
        );
        expect(check({ action: 'block', target: pending, reason: '' })).toBe(
            'reasonRequired'
        );
        expect(
            check({ action: 'approve', target: pending, reason: undefined })
        ).toBeNull();
        expect(
            check({ action: 'deny', target: pending, reason: undefined })
        ).toBeNull();
        expect(
            check({
                action: 'unban',
                target: { ...member, status: 'banned' },
                reason: undefined,
            })
        ).toBeNull();
        expect(check({ reason: 'x'.repeat(501) })).toBe('reasonTooLong');
    });

    it('checks role changes against who may make them', () => {
        expect(
            check({ action: 'makeModerator', reason: undefined })
        ).toBeNull();
        expect(check({ action: 'makeOwner', reason: undefined })).toBe(
            'notAllowed'
        );
        expect(
            check({
                action: 'makeOwner',
                actorRole: 'owner',
                reason: undefined,
            })
        ).toBeNull();
        expect(
            check({
                action: 'makeMember',
                target: { ...member, role: 'moderator' },
                reason: undefined,
            })
        ).toBe('notAllowed');
        expect(
            check({
                action: 'makeMember',
                actorRole: 'owner',
                target: { ...member, role: 'moderator' },
                reason: undefined,
            })
        ).toBeNull();
        expect(
            check({
                action: 'makeModerator',
                target: pending,
                reason: undefined,
            })
        ).toBe('notFound');
    });

    it('refuses members, oneself, the wrong status and protected roles', () => {
        expect(check({ actorRole: 'member' })).toBe('notAllowed');
        expect(check({ actorRole: null })).toBe('notAllowed');
        expect(check({ actorUid: 'b' })).toBe('self');
        expect(check({ action: 'approve' })).toBe('notFound');
        expect(check({ target: null })).toBe('notFound');
        expect(check({ target: { ...member, role: 'moderator' } })).toBe(
            'notAllowed'
        );
        expect(
            check({
                actorRole: 'owner',
                target: { ...member, role: 'moderator' },
            })
        ).toBeNull();
        expect(
            check({ actorRole: 'owner', target: { ...member, role: 'owner' } })
        ).toBe('notAllowed');
    });
});

describe('joinState', () => {
    it('follows the policy for people who are not in the group', () => {
        expect(joinState(false, 'open', null)).toBe('signedOut');
        expect(joinState(true, 'open', null)).toBe('join');
        expect(joinState(true, 'request', null)).toBe('request');
        expect(joinState(true, 'invite', null)).toBe('inviteOnly');
    });

    it('reflects an existing membership whatever the policy', () => {
        expect(joinState(true, 'open', { status: 'active' })).toBe('member');
        expect(joinState(true, 'request', { status: 'pending' })).toBe(
            'pending'
        );
        expect(joinState(true, 'open', { status: 'banned' })).toBe('banned');
    });
});

describe('visibleMembers', () => {
    it('shows everyone to staff, and follows the setting for others', () => {
        expect(visibleMembers('hidden', 'moderator')).toBe('everyone');
        expect(visibleMembers('public', null)).toBe('everyone');
        expect(visibleMembers('members', 'member')).toBe('everyone');
        expect(visibleMembers('members', null)).toBe('leaders');
        expect(visibleMembers('hidden', 'member')).toBe('leaders');
    });
});

describe('sortMembers', () => {
    it('lists owners, then moderators, then members, by name', () => {
        const sorted = sortMembers([
            { role: 'member' as const, displayName: 'Ana' },
            { role: 'owner' as const, displayName: 'Zoe' },
            { role: 'moderator' as const, displayName: 'Bo' },
            { role: 'member' as const, displayName: 'Al' },
        ]);
        expect(sorted.map((m) => m.displayName)).toEqual([
            'Zoe',
            'Bo',
            'Al',
            'Ana',
        ]);
    });
});
