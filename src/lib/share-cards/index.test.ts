import { describe, expect, it } from 'vitest';

import { shareCardPath, shareCardVersion } from './index';

describe('shareCardVersion', () => {
    it('is stable for the same parts', () => {
        expect(shareCardVersion('Maya', 'public', 'abc')).toBe(
            shareCardVersion('Maya', 'public', 'abc')
        );
    });

    it('changes when anything the card shows changes', () => {
        const base = shareCardVersion('Maya', 'public', 'abc');
        expect(shareCardVersion('Maya', 'groups', 'abc')).not.toBe(base);
        expect(shareCardVersion('Maya', 'public', 'def')).not.toBe(base);
        expect(shareCardVersion('Maya', 'public', undefined)).not.toBe(base);
    });

    it('keeps parts apart ("ab" + "c" isn’t "a" + "bc")', () => {
        expect(shareCardVersion('ab', 'c')).not.toBe(
            shareCardVersion('a', 'bc')
        );
    });
});

describe('shareCardPath', () => {
    it('puts the kind, id and version in the link', () => {
        expect(shareCardPath('person', 'maya-thompson', 'x1')).toBe(
            '/api/share-cards/person/maya-thompson?v=x1'
        );
    });
});
