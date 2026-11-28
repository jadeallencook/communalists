import { describe, expect, it } from 'vitest';

import {
    acceptedComrades,
    acceptsRequestsFrom,
    comradeActionSchema,
    comradeshipOf,
    comradeState,
    comradeStateWith,
    DECLINE_COOLDOWN_DAYS,
    inCooldown,
    MAX_PENDING_SENT,
    pairId,
    pendingSentCount,
    receivedRequests,
    sendOutcome,
    type Comradeship,
} from '.';

const DAY = 24 * 60 * 60 * 1000;
const now = 1_800_000_000_000;
const pair = (overrides: Partial<Comradeship> = {}): Comradeship => ({
    other: 'b',
    from: 'a',
    status: 'pending',
    createdAt: now - DAY,
    ...overrides,
});

describe('pairId', () => {
    it('is the same whoever asks', () => {
        expect(pairId('b', 'a')).toBe('a_b');
        expect(pairId('a', 'b')).toBe('a_b');
    });
});

describe('comradeshipOf', () => {
    const stored = {
        uids: ['a', 'b'],
        from: 'a',
        to: 'b',
        status: 'pending',
        createdAt: 5,
    };

    it('reads a pair for either person', () => {
        expect(comradeshipOf('a', stored)).toEqual({
            other: 'b',
            from: 'a',
            status: 'pending',
            createdAt: 5,
        });
        expect(comradeshipOf('b', stored)?.other).toBe('a');
    });

    it('rejects pairs that are malformed or not theirs', () => {
        expect(comradeshipOf('c', stored)).toBeNull();
        expect(comradeshipOf('a', { ...stored, status: 'blocked' })).toBeNull();
        expect(comradeshipOf('a', { ...stored, from: 'z' })).toBeNull();
        expect(comradeshipOf('a', { ...stored, uids: ['a'] })).toBeNull();
        expect(comradeshipOf('a', null)).toBeNull();
    });
});

describe('comradeState', () => {
    it('shows each side of a pending request', () => {
        expect(comradeState('a', pair(), now)).toBe('sent');
        expect(comradeState('b', pair({ other: 'a' }), now)).toBe('received');
    });

    it('is none without a pair, and comrades once accepted', () => {
        expect(comradeState('a', null, now)).toBe('none');
        expect(comradeState('a', pair({ status: 'accepted' }), now)).toBe(
            'comrades'
        );
    });

    it('keeps a decline silent: it still looks sent to the sender', () => {
        const declined = pair({ status: 'declined', respondedAt: now - DAY });
        expect(comradeState('a', declined, now)).toBe('sent');
        expect(comradeState('b', { ...declined, other: 'a' }, now)).toBe(
            'none'
        );
    });

    it('lets the sender ask again once the cooldown ends, or after taking it back', () => {
        const old = pair({
            status: 'declined',
            respondedAt: now - (DECLINE_COOLDOWN_DAYS + 1) * DAY,
        });
        expect(comradeState('a', old, now)).toBe('none');
        expect(
            comradeState(
                'a',
                pair({
                    status: 'declined',
                    respondedAt: now,
                    hiddenFromSender: true,
                }),
                now
            )
        ).toBe('none');
    });

    it('finds the pair with someone in a list', () => {
        expect(comradeStateWith('a', 'b', [pair()], now)).toBe('sent');
        expect(comradeStateWith('a', 'c', [pair()], now)).toBe('none');
    });
});

describe('inCooldown', () => {
    it('lasts the cooldown from the decline', () => {
        const at = (days: number) =>
            pair({ status: 'declined', respondedAt: now - days * DAY });
        expect(inCooldown(at(DECLINE_COOLDOWN_DAYS - 1), now)).toBe(true);
        expect(inCooldown(at(DECLINE_COOLDOWN_DAYS), now)).toBe(false);
        expect(inCooldown(pair(), now)).toBe(false);
    });
});

describe('acceptsRequestsFrom', () => {
    it('follows the setting', () => {
        expect(acceptsRequestsFrom('anyone', false)).toBe(true);
        expect(acceptsRequestsFrom('groups', false)).toBe(false);
        expect(acceptsRequestsFrom('groups', true)).toBe(true);
        expect(acceptsRequestsFrom('nobody', true)).toBe(false);
    });
});

describe('sendOutcome', () => {
    const base = { sender: 'a', now, accepts: true, pendingSent: 0 };

    it('creates a request when there is none', () => {
        expect(sendOutcome({ ...base, pair: null })).toBe('create');
    });

    it('accepts when they had already asked', () => {
        expect(sendOutcome({ ...base, pair: pair({ from: 'b' }) })).toBe(
            'accept'
        );
    });

    it('does nothing for a request already sent, or comrades', () => {
        expect(sendOutcome({ ...base, pair: pair() })).toBe('already');
        expect(
            sendOutcome({ ...base, pair: pair({ status: 'accepted' }) })
        ).toBe('already');
    });

    it('is silent while a decline cools down, then allows a new one', () => {
        const declined = pair({ status: 'declined', respondedAt: now - DAY });
        expect(sendOutcome({ ...base, pair: declined })).toBe('silent');
        expect(
            sendOutcome({
                ...base,
                pair: { ...declined, respondedAt: now - 40 * DAY },
            })
        ).toBe('create');
    });

    it('lets the person who declined ask later themself', () => {
        const declined = pair({
            from: 'b',
            status: 'declined',
            respondedAt: now,
        });
        expect(sendOutcome({ ...base, pair: declined })).toBe('create');
    });

    it("respects their setting and the sender's limit", () => {
        expect(sendOutcome({ ...base, pair: null, accepts: false })).toBe(
            'closed'
        );
        expect(
            sendOutcome({ ...base, pair: null, pendingSent: MAX_PENDING_SENT })
        ).toBe('limit');
        // Answering their request is never limited.
        expect(
            sendOutcome({
                ...base,
                pair: pair({ from: 'b' }),
                accepts: false,
                pendingSent: MAX_PENDING_SENT,
            })
        ).toBe('accept');
    });
});

describe('lists', () => {
    const pairs = [
        pair({ other: 'b' }),
        pair({ other: 'c', from: 'c', createdAt: now - 3 * DAY }),
        pair({ other: 'd', from: 'd', createdAt: now - DAY }),
        pair({ other: 'e', status: 'accepted', respondedAt: now - 5 * DAY }),
        pair({ other: 'f', status: 'accepted', respondedAt: now - DAY }),
        pair({ other: 'g', status: 'declined', from: 'g' }),
    ];

    it('counts requests waiting from the person', () => {
        expect(pendingSentCount('a', pairs)).toBe(1);
    });

    it('lists requests waiting for their answer, newest first', () => {
        expect(receivedRequests('a', pairs).map((p) => p.other)).toEqual([
            'd',
            'c',
        ]);
    });

    it('lists comrades, most recent first', () => {
        expect(acceptedComrades(pairs).map((p) => p.other)).toEqual(['f', 'e']);
    });
});

describe('comradeActionSchema', () => {
    it('takes a uid and a known intent', () => {
        expect(
            comradeActionSchema.safeParse({ uid: 'b', intent: 'accept' })
                .success
        ).toBe(true);
        expect(
            comradeActionSchema.safeParse({ uid: 'b', intent: 'block' }).success
        ).toBe(false);
        expect(
            comradeActionSchema.safeParse({ uid: '', intent: 'request' })
                .success
        ).toBe(false);
    });
});
