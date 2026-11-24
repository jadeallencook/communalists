import { describe, expect, it } from 'vitest';

import {
    claimDecisionProblem,
    claimPageState,
    claimRequestSchema,
    CLAIM_MESSAGE_MAX,
    CLAIM_ROLE_MAX,
} from './claims';

const errorsOf = (input: Record<string, unknown>) => {
    const result = claimRequestSchema.safeParse(input);
    return result.success
        ? {}
        : Object.fromEntries(
              result.error.issues.map((i) => [i.path[0], i.message])
          );
};

const valid = {
    intent: 'claim',
    role: 'Office manager',
    message: 'Call the church office at the number on our website.',
};

describe('claimRequestSchema', () => {
    it('accepts a claim or a removal request', () => {
        expect(claimRequestSchema.safeParse(valid).success).toBe(true);
        expect(
            claimRequestSchema.safeParse({ ...valid, intent: 'remove' }).success
        ).toBe(true);
    });

    it('trims what was typed', () => {
        const parsed = claimRequestSchema.parse({
            ...valid,
            role: '  Pastor  ',
        });
        expect(parsed.role).toBe('Pastor');
    });

    it('explains each problem', () => {
        expect(errorsOf({ ...valid, intent: 'transfer' })).toEqual({
            intent: 'intentRequired',
        });
        expect(errorsOf({ ...valid, role: '   ' })).toEqual({
            role: 'roleRequired',
        });
        expect(
            errorsOf({ ...valid, role: 'x'.repeat(CLAIM_ROLE_MAX + 1) })
        ).toEqual({
            role: 'roleTooLong',
        });
        expect(errorsOf({ ...valid, message: 'call me' })).toEqual({
            message: 'messageTooShort',
        });
        expect(
            errorsOf({ ...valid, message: 'x'.repeat(CLAIM_MESSAGE_MAX + 1) })
        ).toEqual({ message: 'messageTooLong' });
    });
});

describe('claimPageState', () => {
    it('shows the form with no request, the status while pending, and the form again after a denial', () => {
        expect(claimPageState(null)).toBe('form');
        expect(claimPageState({ status: 'pending' })).toBe('pending');
        expect(claimPageState({ status: 'denied' })).toBe('deniedCanRetry');
        expect(claimPageState({ status: 'approved' })).toBe('form');
    });
});

describe('claimDecisionProblem', () => {
    const base = {
        decision: 'approve' as const,
        request: { status: 'pending' as const, intent: 'claim' as const },
        org: { status: 'active' as const, unclaimed: true },
        ownedCount: 0,
        maxOwned: 5,
    };

    it('lets a pending claim on an unclaimed organization through', () => {
        expect(claimDecisionProblem(base)).toBeNull();
    });

    it('needs a pending request', () => {
        expect(claimDecisionProblem({ ...base, request: null })).toBe(
            'notFound'
        );
        expect(
            claimDecisionProblem({
                ...base,
                request: { status: 'denied', intent: 'claim' },
            })
        ).toBe('alreadyDecided');
    });

    it('refuses to approve once the organization is claimed or gone', () => {
        expect(
            claimDecisionProblem({
                ...base,
                org: { status: 'active', unclaimed: false },
            })
        ).toBe('alreadyClaimed');
        expect(
            claimDecisionProblem({
                ...base,
                org: { status: 'archived', unclaimed: true },
            })
        ).toBe('notFound');
    });

    it('keeps a new owner within the owned-organizations limit', () => {
        expect(claimDecisionProblem({ ...base, ownedCount: 5 })).toBe(
            'ownedLimit'
        );
        // A removal doesn't make anyone an owner.
        expect(
            claimDecisionProblem({
                ...base,
                ownedCount: 5,
                request: { status: 'pending', intent: 'remove' },
            })
        ).toBeNull();
    });

    it('can always deny a pending request', () => {
        expect(
            claimDecisionProblem({
                ...base,
                decision: 'deny',
                org: { status: 'active', unclaimed: false },
            })
        ).toBeNull();
    });
});
