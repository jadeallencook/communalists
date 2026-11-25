import { describe, expect, it } from 'vitest';

import { normalizePhone, phoneForDisplay } from './phone';

describe('normalizePhone', () => {
    it('stores the many ways people type a number as one value', () => {
        for (const typed of [
            '408-293-6111',
            '(408) 293-6111',
            '408.293.6111',
            '4082936111',
            '+1 408 293 6111',
            '1 (408) 293-6111',
        ]) {
            expect(normalizePhone(typed, 'US')).toBe('+14082936111');
        }
    });

    it('keeps an extension', () => {
        expect(normalizePhone('408-293-6111 ext. 2', 'US')).toBe(
            '+14082936111;ext=2'
        );
        expect(normalizePhone('(408) 293-6111 x12', 'US')).toBe(
            '+14082936111;ext=12'
        );
    });

    it('is empty for nothing, and null for something that is not a number', () => {
        expect(normalizePhone('   ', 'US')).toBeUndefined();
        expect(normalizePhone('call us', 'US')).toBeNull();
        expect(normalizePhone('293-6111', 'US')).toBeNull(); // no area code
        expect(normalizePhone('555-0100', 'US')).toBeNull();
        expect(normalizePhone('1'.repeat(41), 'US')).toBeNull();
    });

    it('accepts other countries when typed with their code', () => {
        expect(normalizePhone('+84 28 3829 5000', 'US')).toBe('+842838295000');
    });
});

describe('phoneForDisplay', () => {
    it('shows a local number the local way, with a call link', () => {
        expect(phoneForDisplay('+14082936111')).toEqual({
            text: '(408) 293-6111',
            href: 'tel:+14082936111',
        });
    });

    it('shows the extension and dials it', () => {
        expect(phoneForDisplay('+14082936111;ext=2')).toEqual({
            text: '(408) 293-6111 ext. 2',
            href: 'tel:+14082936111;ext=2',
        });
    });

    it('shows other countries in international format', () => {
        expect(phoneForDisplay('+842838295000')?.text).toBe('+84 28 3829 5000');
    });

    it('shows nothing for a missing or broken value', () => {
        expect(phoneForDisplay(undefined)).toBeNull();
        expect(phoneForDisplay('not a number')).toBeNull();
    });
});
