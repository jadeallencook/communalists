import { describe, expect, it } from 'vitest';

import { localeFromTag } from './locale-from-tag';

describe('localeFromTag', () => {
    it('matches on the language part of a tag', () => {
        expect(localeFromTag('es')).toBe('es');
        expect(localeFromTag('zh-CN')).toBe('zh');
        expect(localeFromTag('VI_vn')).toBe('vi');
    });

    it('returns null for unsupported or missing tags', () => {
        expect(localeFromTag('fr')).toBeNull();
        expect(localeFromTag('')).toBeNull();
        expect(localeFromTag(null)).toBeNull();
    });
});
