import { describe, expect, it } from 'vitest';

import { canBeEndorsed, endorsementId, endorseSchema, endorseState } from '.';

describe('canBeEndorsed', () => {
    it('only listed, active organizations', () => {
        expect(canBeEndorsed({ visibility: 'listed', status: 'active' })).toBe(
            true
        );
        expect(
            canBeEndorsed({ visibility: 'unlisted', status: 'active' })
        ).toBe(false);
        expect(
            canBeEndorsed({ visibility: 'listed', status: 'archived' })
        ).toBe(false);
    });
});

describe('endorseState', () => {
    it('asks visitors to sign in, and offers Endorse to everyone signed in', () => {
        expect(
            endorseState({ signedIn: false, endorsed: false, endorsable: true })
        ).toBe('signedOut');
        expect(
            endorseState({ signedIn: true, endorsed: false, endorsable: true })
        ).toBe('endorse');
    });

    it('shows no card on unlisted groups, unless they can take one back', () => {
        expect(
            endorseState({ signedIn: true, endorsed: false, endorsable: false })
        ).toBeNull();
        expect(
            endorseState({
                signedIn: false,
                endorsed: false,
                endorsable: false,
            })
        ).toBeNull();
        expect(
            endorseState({ signedIn: true, endorsed: true, endorsable: false })
        ).toBe('endorsed');
    });
});

describe('endorseSchema', () => {
    it('takes an organization id and endorse or remove', () => {
        expect(
            endorseSchema.safeParse({ orgId: 'org1', intent: 'endorse' })
                .success
        ).toBe(true);
        expect(
            endorseSchema.safeParse({ orgId: '', intent: 'endorse' }).success
        ).toBe(false);
        expect(
            endorseSchema.safeParse({ orgId: 'org1', intent: 'join' }).success
        ).toBe(false);
    });
});

it('names one endorsement per person per organization', () => {
    expect(endorsementId('org1', 'someone')).toBe('org1_someone');
});
