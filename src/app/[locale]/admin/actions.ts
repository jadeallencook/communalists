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
import {
    DELETED_TAG,
    restoreOrganization,
} from '@/lib/organizations/lifecycle-store';
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
    updateTag(DELETED_TAG); // an approved takedown can be restored
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

export interface RestoreState {
    error?: 'notFound' | 'tooLate' | 'handleTaken' | 'notAllowed' | 'generic';
    done?: boolean;
    at?: number;
}

/** A super user restores an organization deleted in the last 30 days. */
export async function restoreOrganizationAction(
    _prev: RestoreState,
    formData: FormData
): Promise<RestoreState> {
    const requested = text(formData, 'locale');
    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;
    const at = Date.now();
    const user = await getSessionUser();
    if (!user) return redirect({ href: '/sign-in', locale });
    if (!isPlatformAdmin(user.uid)) return { error: 'notAllowed', at };
    const orgId = text(formData, 'orgId');
    if (!orgId || orgId.length > 128) return { error: 'generic', at };

    let result;
    try {
        result = await restoreOrganization(user.uid, orgId);
    } catch (error) {
        console.error('[org] restore failed', (error as Error).message);
        return { error: 'generic', at };
    }
    updateTag(DELETED_TAG);
    if (!result.ok) return { error: result.error, at };
    updateTag(ADMIN_LOG_TAG);
    updateTag(orgTag(orgId));
    updateTag(handleTag(result.handle));
    updateTag(orgMembersTag(orgId));
    updateTag(DIRECTORY_TAG);
    for (const uid of result.memberUids) updateTag(membershipsTag(uid));
    refresh();
    return { done: true, at };
}
