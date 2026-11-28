import { describe, expect, it } from 'vitest';

import { notificationId, notificationOf, unreadBadge } from '.';

describe('notificationId', () => {
    it('is one per kind, thing and person', () => {
        expect(notificationId('comradeRequest', 'a_b', 'b')).toBe(
            'comradeRequest~a_b~b'
        );
    });
});

describe('notificationOf', () => {
    it('reads a stored notification', () => {
        expect(
            notificationOf('n1', {
                uid: 'b',
                kind: 'comradeRequest',
                actor: 'a',
                ref: 'a_b',
                read: false,
                createdAt: 5,
            })
        ).toEqual({
            id: 'n1',
            kind: 'comradeRequest',
            actor: 'a',
            ref: 'a_b',
            at: 5,
            read: false,
        });
    });

    it('skips kinds it does not know (from a newer version)', () => {
        expect(
            notificationOf('n1', { kind: 'eventPosted', ref: 'x' })
        ).toBeNull();
        expect(notificationOf('n1', { kind: 'comradeRequest' })).toBeNull();
    });
});

describe('unreadBadge', () => {
    it('shows up to 9, then 9+, and nothing when there is nothing new', () => {
        expect(unreadBadge(0)).toBe('');
        expect(unreadBadge(3)).toBe('3');
        expect(unreadBadge(9)).toBe('9');
        expect(unreadBadge(10)).toBe('9+');
    });
});
