import { describe, expect, it } from 'vitest';

import { buildInfo, REPOSITORY_URL } from './build-info';

describe('buildInfo', () => {
    it('shortens the commit and links the full one', () => {
        const sha = 'be4248fd0123456789abcdef0123456789abcdef';
        expect(buildInfo(sha)).toEqual({
            commit: 'be4248f',
            commitUrl: `${REPOSITORY_URL}/commit/${sha}`,
        });
    });

    it('has no commit outside Vercel', () => {
        expect(buildInfo(undefined)).toEqual({ commit: null, commitUrl: null });
        expect(buildInfo('').commit).toBeNull();
    });

    it('ignores anything that is not a commit hash', () => {
        expect(buildInfo('not a sha').commit).toBeNull();
        expect(buildInfo('abc').commit).toBeNull();
    });
});
