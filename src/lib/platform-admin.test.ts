import { describe, expect, it } from 'vitest';

import { effectiveRole, platformAdminUids } from './platform-admin';

describe('platformAdminUids', () => {
    it('reads a comma or space separated list', () => {
        expect([
            ...platformAdminUids(
                { PLATFORM_ADMIN_UIDS: ' abc, def  ghi,,' },
                false,
                []
            ),
        ]).toEqual(['abc', 'def', 'ghi']);
    });

    it('is empty when unset', () => {
        expect(platformAdminUids({}, false, []).size).toBe(0);
    });

    it('adds the seeded super users only locally', () => {
        expect(
            platformAdminUids({}, true, ['seed-jordan']).has('seed-jordan')
        ).toBe(true);
        expect(
            platformAdminUids({}, false, ['seed-jordan']).has('seed-jordan')
        ).toBe(false);
    });
});

describe('effectiveRole', () => {
    const unclaimed = { unclaimed: true };
    const claimed = { unclaimed: false };

    it('makes every super user an owner of an unclaimed organization', () => {
        expect(effectiveRole(null, unclaimed, true)).toBe('owner');
    });

    it('gives nobody else a role in an unclaimed organization', () => {
        expect(effectiveRole(null, unclaimed, false)).toBeNull();
        expect(effectiveRole('member', unclaimed, false)).toBeNull();
    });

    it('uses the membership once claimed, even for super users', () => {
        expect(effectiveRole(null, claimed, true)).toBeNull();
        expect(effectiveRole('moderator', claimed, true)).toBe('moderator');
        expect(effectiveRole('owner', claimed, false)).toBe('owner');
    });
});
