// Claiming an unclaimed organization: the request form and the rules for
// deciding one. Pure: no React, Next or Firebase. The Firestore layer is
// ./claim-store.ts. Design: documentation/features/18-unclaimed-organizations.md.

import { z } from 'zod';

/** What the person asks for. Stored, so the keys are permanent. */
export const CLAIM_INTENTS = ['claim', 'remove'] as const;
export type ClaimIntent = (typeof CLAIM_INTENTS)[number];

/** `pending` until a super user decides. Stored, so the keys are permanent. */
export type ClaimStatus = 'pending' | 'approved' | 'denied';

/** Why a request was closed without a super user deciding it. */
export type ClaimOutcome = 'decided' | 'resolvedByOther';

export const CLAIM_ROLE_MAX = 100;
export const CLAIM_MESSAGE_MIN = 10;
export const CLAIM_MESSAGE_MAX = 1000;

export type ClaimErrorKey =
    | 'intentRequired'
    | 'roleRequired'
    | 'roleTooLong'
    | 'messageTooShort'
    | 'messageTooLong';

/** The claim form. Errors are keys under Claim.errors in messages/*.json. */
export const claimRequestSchema = z.object({
    intent: z.enum(CLAIM_INTENTS, { error: 'intentRequired' }),
    role: z
        .string({ error: 'roleRequired' })
        .trim()
        .min(1, { error: 'roleRequired' })
        .max(CLAIM_ROLE_MAX, { error: 'roleTooLong' }),
    message: z
        .string({ error: 'messageTooShort' })
        .trim()
        .min(CLAIM_MESSAGE_MIN, { error: 'messageTooShort' })
        .max(CLAIM_MESSAGE_MAX, { error: 'messageTooLong' }),
});
export type ClaimRequestInput = z.infer<typeof claimRequestSchema>;
export type ClaimField = keyof ClaimRequestInput;

/** What the claim page offers this person, from their latest request. */
export type ClaimPageState = 'form' | 'pending' | 'deniedCanRetry';

export function claimPageState(
    request: { status: ClaimStatus } | null
): ClaimPageState {
    if (request?.status === 'pending') return 'pending';
    if (request?.status === 'denied') return 'deniedCanRetry';
    return 'form';
}

/** A super user's decision on a request. */
export const CLAIM_DECISIONS = ['approve', 'deny'] as const;
export type ClaimDecision = (typeof CLAIM_DECISIONS)[number];

export type ClaimDecisionProblem =
    'notFound' | 'alreadyDecided' | 'alreadyClaimed' | 'ownedLimit';

/**
 * Checks a decision against fresh data; null when it may go ahead. Denying
 * only needs a pending request. Approving also needs the organization to
 * still be active and unclaimed, and (for a claim) the person to own fewer
 * than the most organizations allowed.
 */
export function claimDecisionProblem({
    decision,
    request,
    org,
    ownedCount,
    maxOwned,
}: {
    decision: ClaimDecision;
    request: { status: ClaimStatus; intent: ClaimIntent } | null;
    org: { status: 'active' | 'archived'; unclaimed: boolean } | null;
    ownedCount: number;
    maxOwned: number;
}): ClaimDecisionProblem | null {
    if (!request) return 'notFound';
    if (request.status !== 'pending') return 'alreadyDecided';
    if (decision === 'deny') return null;
    if (!org || org.status !== 'active') return 'notFound';
    if (!org.unclaimed) return 'alreadyClaimed';
    if (request.intent === 'claim' && ownedCount >= maxOwned)
        return 'ownedLimit';
    return null;
}

/** A super user's decision form. */
export const claimDecisionSchema = z.object({
    orgId: z.string().min(1).max(128),
    uid: z.string().min(1).max(128),
    decision: z.enum(CLAIM_DECISIONS),
});

/** Super-user actions, in the platform's admin log. Stored, so the keys are permanent. */
export type AdminAction =
    | 'createUnclaimed'
    | 'editUnclaimed'
    | 'approveClaim'
    | 'approveRemoval'
    | 'denyClaim'
    | 'deleteUnclaimed'
    | 'restoreOrganization'
    | 'makeUnclaimed'
    | 'exportOrganizations'
    // Dictionary words (documentation/features/19-dictionary.md).
    | 'createDefinition'
    | 'editDefinition';
