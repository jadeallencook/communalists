import { describe, expect, it } from 'vitest';

import { handleProblem, normalizeHandle, suggestHandle } from './handle';

describe('handleProblem', () => {
    it('accepts lowercase letters, numbers and single hyphens', () => {
        for (const ok of ['sbma', 'south-bay-mutual-aid', 'club-2024', 'abc']) {
            expect(handleProblem(ok)).toBeNull();
        }
    });

    it('rejects bad shapes', () => {
        expect(handleProblem('ab')).toBe('tooShort');
        expect(handleProblem('a'.repeat(31))).toBe('tooLong');
        for (const bad of [
            '-sbma',
            'sbma-',
            'sb--ma',
            'SBMA',
            'sb_ma',
            'sb ma',
            'peñón',
        ]) {
            expect(handleProblem(bad)).toBe('format');
        }
    });

    it('rejects reserved words and locale codes', () => {
        expect(handleProblem('dashboard')).toBe('reserved');
        expect(handleProblem('storybook')).toBe('reserved');
        // 'en' is too short anyway; reserved words are checked after shape.
        expect(handleProblem('communalists')).toBe('reserved');
    });
});

describe('suggestHandle', () => {
    it('turns a name into a handle', () => {
        expect(suggestHandle('South Bay Mutual Aid')).toBe(
            'south-bay-mutual-aid'
        );
        expect(suggestHandle('  Oakland Auto Club!! ')).toBe(
            'oakland-auto-club'
        );
        expect(suggestHandle('Ayuda Mutua Peñón')).toBe('ayuda-mutua-penon');
    });

    it('stays within the length limit without a trailing hyphen', () => {
        const handle = suggestHandle(
            'The East San Jose Community Fridge Network'
        );
        expect(handle.length).toBeLessThanOrEqual(30);
        expect(handle.endsWith('-')).toBe(false);
    });

    it('returns empty when nothing usable is left', () => {
        expect(suggestHandle('互助会')).toBe('');
    });
});

describe('normalizeHandle', () => {
    it('trims and lower-cases only', () => {
        expect(normalizeHandle('  SBMA ')).toBe('sbma');
    });
});
