import { describe, expect, it } from 'vitest';

import {
    canDelete,
    canRestore,
    deleteConfirmed,
    makeUnclaimedProblem,
    restoreDeadline,
} from './lifecycle';

const DAY = 86_400_000;

describe('deleting', () => {
    it('is for owners only', () => {
        expect(canDelete('owner')).toBe(true);
        expect(canDelete('moderator')).toBe(false);
        expect(canDelete('member')).toBe(false);
        expect(canDelete(null)).toBe(false);
    });

    it('needs the name typed, forgiving case and spacing', () => {
        expect(
            deleteConfirmed('south bay  mutual aid ', 'South Bay Mutual Aid')
        ).toBe(true);
        expect(
            deleteConfirmed('Recovery Café San José', 'Recovery Café San José')
        ).toBe(true);
        // "é" typed as e + combining accent still matches.
        expect(deleteConfirmed('Recovery Café', 'Recovery Café')).toBe(true);
        expect(deleteConfirmed('South Bay', 'South Bay Mutual Aid')).toBe(
            false
        );
        expect(deleteConfirmed('   ', '')).toBe(false);
    });
});

describe('restoring', () => {
    const archivedAt = Date.UTC(2026, 10, 24);

    it('is possible for 30 days', () => {
        expect(restoreDeadline(archivedAt)).toBe(archivedAt + 30 * DAY);
        expect(canRestore(archivedAt, archivedAt + 29 * DAY)).toBe(true);
        expect(canRestore(archivedAt, archivedAt + 30 * DAY)).toBe(false);
    });

    it('needs to know when it was deleted', () => {
        expect(canRestore(undefined, archivedAt)).toBe(false);
    });
});

describe('makeUnclaimedProblem', () => {
    const base = {
        platformAdmin: true,
        role: 'owner' as const,
        unclaimed: false,
        activeMembers: 1,
    };

    it('lets a super user who is the only member hand it over', () => {
        expect(makeUnclaimedProblem(base)).toBeNull();
    });

    it('refuses anyone else', () => {
        expect(makeUnclaimedProblem({ ...base, platformAdmin: false })).toBe(
            'notAllowed'
        );
        expect(makeUnclaimedProblem({ ...base, role: 'moderator' })).toBe(
            'notAllowed'
        );
    });

    it('refuses when other people would lose their group', () => {
        expect(makeUnclaimedProblem({ ...base, activeMembers: 2 })).toBe(
            'hasMembers'
        );
    });

    it('does nothing to one that is already unclaimed', () => {
        expect(makeUnclaimedProblem({ ...base, unclaimed: true })).toBe(
            'unclaimed'
        );
    });
});
