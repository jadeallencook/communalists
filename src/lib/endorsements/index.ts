// Endorsements: anyone signed in can endorse a listed organization, member or
// not, to show it off on their profile; the organization's page shows how
// many people endorse it. Pure (no React, Next or Firebase).
// Design: documentation/features/17-profiles.md → Endorsements (decision #73).

import { z } from 'zod';

/** `endorsements/{orgId}_{uid}`: one per person per organization. */
export const endorsementId = (orgId: string, uid: string) => `${orgId}_${uid}`;

/**
 * Whether an organization can be endorsed: listed and active. Unlisted
 * groups don't want to be found, so nobody can put one on their profile.
 * Taking an endorsement back always works.
 */
export function canBeEndorsed(org: {
    visibility: 'listed' | 'unlisted';
    status: 'active' | 'archived';
}): boolean {
    return org.visibility === 'listed' && org.status === 'active';
}

/**
 * What the viewer sees in the Endorse card on an organization's page, or
 * null for no card: unlisted groups show it only to someone who already
 * endorses them (endorsed while it was listed), so they can take it back.
 */
export type EndorseState = 'signedOut' | 'endorse' | 'endorsed';

export function endorseState({
    signedIn,
    endorsed,
    endorsable,
}: {
    signedIn: boolean;
    endorsed: boolean;
    endorsable: boolean;
}): EndorseState | null {
    if (endorsed) return 'endorsed';
    if (!endorsable) return null;
    return signedIn ? 'endorse' : 'signedOut';
}

/** The Endorse form, checked on the server. */
export const endorseSchema = z.object({
    orgId: z.string().min(1).max(128),
    intent: z.enum(['endorse', 'remove']),
});
