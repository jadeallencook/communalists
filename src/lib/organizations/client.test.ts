import { describe, expect, it } from 'vitest';

import { ORG_LANGUAGES } from './options';
import { languageName } from './client';

describe('languageName', () => {
    it('names languages in the UI language', () => {
        expect(languageName('vi', 'en')).toBe('Vietnamese');
        expect(languageName('vi', 'es')).toBe('vietnamita');
    });

    it('falls back for codes the runtime does not name', () => {
        expect(languageName('ase', 'en')).toBe('American Sign Language');
        expect(languageName('ase', 'zh')).toBe('美国手语');
    });

    it('never shows a bare code for any offered language', () => {
        for (const locale of ['en', 'es', 'vi', 'zh']) {
            for (const code of ORG_LANGUAGES) {
                expect(languageName(code, locale)).not.toBe(code);
            }
        }
    });
});
