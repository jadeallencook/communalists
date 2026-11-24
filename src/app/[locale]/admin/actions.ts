'use server';

import { refresh, updateTag } from 'next/cache';
import { hasLocale } from 'next-intl';

import { isPlatformAdmin } from '@/lib/auth/platform-admin';
import { getSessionUser } from '@/lib/auth/session';
import {
    DIRECTORY_TAG,
    handleTag,
    membershipsTag,
    orgMembersTag,
    orgTag,
} from '@/lib/organizations';
import {
    ADMIN_LOG_TAG,
    CLAIMS_TAG,
    decideClaim,
} from '@/lib/organizations/claim-store';
import {
    claimDecisionSchema,
    type ClaimDecisionProblem,
} from '@/lib/organizations/claims';
import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export interface DecideClaimState {
    error?: ClaimDecisionProblem | 'notAllowed' | 'generic';
    done?: 'approveClaim' | 'approveRemoval' | 'deny';
    /** Changes on every submit, so the same message can show twice. */
    at?: number;
}

const text = (formData: FormData, key: string) => {
    const value = formData.get(key);
    return typeof value === 'string' ? value : '';
};

/** A super user approves or denies a claim (or takedown) request. */
export async function decideClaimAction(
    _prev: DecideClaimState,
    formData: FormData
): Promise<DecideClaimState> {
    const requested = text(formData, 'locale');
    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;
    const at = Date.now();
    const user = await getSessionUser();
    if (!user) return redirect({ href: '/sign-in', locale });
    // The page is hidden from everyone else, but actions can be called directly.
    if (!isPlatformAdmin(user.uid)) return { error: 'notAllowed', at };

    const parsed = claimDecisionSchema.safeParse({
        orgId: text(formData, 'orgId'),
        uid: text(formData, 'uid'),
        decision: text(formData, 'decision'),
    });
    if (!parsed.success) return { error: 'generic', at };
    const { orgId, uid, decision } = parsed.data;

    let result;
    try {
        result = await decideClaim(user.uid, orgId, uid, decision);
    } catch (error) {
        console.error('[claim] decide failed', (error as Error).message); // never log PII
        return { error: 'generic', at };
    }
    if (!result.ok) {
        updateTag(CLAIMS_TAG); // show the latest list
        return { error: result.error, at };
    }

    updateTag(CLAIMS_TAG);
    updateTag(ADMIN_LOG_TAG);
    if (decision === 'approve') {
        // The page, its listing and the new owner's dashboard all change.
        updateTag(orgTag(orgId));
        updateTag(handleTag(result.handle));
        updateTag(orgMembersTag(orgId));
        updateTag(DIRECTORY_TAG);
        updateTag(membershipsTag(uid));
    }
    refresh();
    return {
        done:
            decision === 'deny'
                ? 'deny'
                : result.intent === 'claim'
                  ? 'approveClaim'
                  : 'approveRemoval',
        at,
    };
}
