import { describe, expect, it } from 'vitest';

import { buildInfo, REPOSITORY_URL } from './build-info';

describe('buildInfo', () => {
    it('shortens the commit and links the full one', () => {
        const sha = 'be4248fd0123456789abcdef0123456789abcdef';
        expect(buildInfo('4.0.0', sha)).toEqual({
            version: '4.0.0',
            commit: 'be4248f',
            commitUrl: `${REPOSITORY_URL}/commit/${sha}`,
        });
    });

    it('has no commit outside Vercel', () => {
        expect(buildInfo('4.0.0', undefined)).toEqual({
            version: '4.0.0',
            commit: null,
            commitUrl: null,
        });
        expect(buildInfo('4.0.0', '').commit).toBeNull();
    });

    it('ignores anything that is not a commit hash', () => {
        expect(buildInfo('4.0.0', 'not a sha').commit).toBeNull();
        expect(buildInfo('4.0.0', 'abc').commit).toBeNull();
    });

    it('falls back when the version is missing', () => {
        expect(buildInfo(undefined, undefined).version).toBe('0.0.0');
    });
});
