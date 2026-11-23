import { describe, expect, it } from 'vitest';

import { initials } from './initials';

describe('initials', () => {
    it('takes the first and last word', () => {
        expect(initials('Ada Lovelace')).toBe('AL');
        expect(initials('Maria de los Ángeles Fernández')).toBe('MF');
    });

    it('handles one word, extra spaces and lower case', () => {
        expect(initials('ada')).toBe('A');
        expect(initials('  grace   hopper ')).toBe('GH');
    });

    it('keeps accented letters whole', () => {
        expect(initials('Ángela Ruiz')).toBe('ÁR');
        expect(initials('Nguyễn Văn An')).toBe('NA');
    });

    it('uses one character for scripts without case', () => {
        expect(initials('王小明')).toBe('王');
    });

    it('never returns empty', () => {
        expect(initials('   ')).toBe('?');
    });
});
