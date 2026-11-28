'use server';

import { refresh, updateTag } from 'next/cache';
import { hasLocale } from 'next-intl';

import { isSetupComplete } from '@/lib/account-setup';
import { isPlatformAdmin } from '@/lib/auth/platform-admin';
import { getSessionUser } from '@/lib/auth/session';
import { ADMIN_LOG_TAG } from '@/lib/organizations/claim-store';
import { makeOrganizationUnclaimed } from '@/lib/organizations/lifecycle-store';
import {
    cancelJoinRequest,
    DIRECTORY_TAG,
    joinOrganization,
    leaveOrganization,
    membershipsTag,
    moderateMember,
    orgMembersTag,
    orgTag,
    handleTag,
    memberCopyOf,
} from '@/lib/organizations';
import {
    moderationSchema,
    type ModerationAction,
} from '@/lib/organizations/membership';
import { getUserProfileFresh } from '@/lib/users';
import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { organizationPath } from '@/lib/paths';

// Joining, leaving and moderating. Every check runs again on the server
// against fresh data (src/lib/organizations → moderateMember etc.); the
// buttons shown are only a convenience.

export type MembershipErrorKey =
    | 'banned'
    | 'inviteOnly'
    | 'lastOwner'
    | 'notMember'
    | 'notFound'
    | 'notAllowed'
    | 'self'
    | 'reasonRequired'
    | 'reasonTooLong'
    | 'ownedLimit'
    | 'unclaimed'
    | 'generic';

export interface MembershipActionState {
    error?: MembershipErrorKey;
    /** The last action that went through, so the UI can confirm it. */
    done?: 'joined' | 'requested' | 'cancelled' | 'left' | ModerationAction;
    /** Changes on every submit, so the same message can show twice. */
    at?: number;
}

const text = (formData: FormData, key: string) => {
    const value = formData.get(key);
    return typeof value === 'string' ? value : '';
};
const localeOf = (formData: FormData) => {
    const requested = text(formData, 'locale');
    return hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;
};

/** Clears every cached read that shows this organization's people. */
function clearOrganization(orgId: string, uids: string[]) {
    updateTag(orgTag(orgId)); // memberCount (and the handle lookup, tagged with it)
    updateTag(orgMembersTag(orgId));
    updateTag(DIRECTORY_TAG); // memberCount in listings
    for (const uid of uids) updateTag(membershipsTag(uid)); // dashboards
    refresh();
}

/** Join, ask to join, cancel a request, or leave: the viewer acting on themself. */
export async function membershipAction(
    _prev: MembershipActionState,
    formData: FormData
): Promise<MembershipActionState> {
    const locale = localeOf(formData);
    const orgId = text(formData, 'orgId');
    const handle = text(formData, 'handle');
    const intent = text(formData, 'intent');
    const at = Date.now();

    const user = await getSessionUser();
    if (!user) return redirect({ href: '/sign-in', locale });

    try {
        if (intent === 'join') {
            // Joining needs a finished account: others will see the name.
            const profile = await getUserProfileFresh(user.uid);
            if (!isSetupComplete(profile)) {
                return redirect({
                    href: {
                        pathname: '/account/setup',
                        query: { next: organizationPath(handle) },
                    },
                    locale,
                });
            }
            const result = await joinOrganization(
                orgId,
                user.uid,
                memberCopyOf(profile!)
            );
            if (!result.ok) return { error: result.error, at };
            clearOrganization(orgId, [user.uid]);
            return {
                done: result.status === 'active' ? 'joined' : 'requested',
                at,
            };
        }
        if (intent === 'cancel') {
            await cancelJoinRequest(orgId, user.uid);
            clearOrganization(orgId, [user.uid]);
            return { done: 'cancelled', at };
        }
        if (intent === 'leave') {
            const result = await leaveOrganization(orgId, user.uid);
            if (!result.ok) return { error: result.error, at };
            clearOrganization(orgId, [user.uid]);
            return { done: 'left', at };
        }
    } catch (error) {
        console.error('[membership] failed', (error as Error).message); // never log PII
        return { error: 'generic', at };
    }
    return { error: 'generic', at };
}

/** An owner or moderator acting on someone else: approve, deny, block, remove, ban, unban. */
export async function moderateAction(
    _prev: MembershipActionState,
    formData: FormData
): Promise<MembershipActionState> {
    const locale = localeOf(formData);
    const at = Date.now();
    const user = await getSessionUser();
    if (!user) return redirect({ href: '/sign-in', locale });

    const parsed = moderationSchema.safeParse({
        orgId: text(formData, 'orgId'),
        uid: text(formData, 'uid'),
        action: text(formData, 'action'),
        reason: text(formData, 'reason') || undefined,
    });
    if (!parsed.success) {
        const tooLong = parsed.error.issues.some((i) => i.path[0] === 'reason');
        return { error: tooLong ? 'reasonTooLong' : 'generic', at };
    }
    const { orgId, uid, action, reason } = parsed.data;

    try {
        const result = await moderateMember(
            orgId,
            user.uid,
            uid,
            action,
            reason
        );
        if (!result.ok) return { error: result.error, at };
        clearOrganization(orgId, [uid]);
        return { done: action, at };
    } catch (error) {
        console.error('[moderation] failed', (error as Error).message); // never log PII
        return { error: 'generic', at };
    }
}

/**
 * A super user hands an organization they own (made without ticking
 * "unclaimed") to the team as unclaimed. Only while they're its only member;
 * checked again on fresh data. Back to the page either way.
 */
export async function makeUnclaimedAction(formData: FormData) {
    const locale = localeOf(formData);
    const orgId = text(formData, 'orgId');
    const handle = text(formData, 'handle');
    const user = await getSessionUser();
    if (!user) return redirect({ href: '/sign-in', locale });
    if (orgId && orgId.length <= 128) {
        try {
            const result = await makeOrganizationUnclaimed(
                user.uid,
                isPlatformAdmin(user.uid),
                orgId
            );
            if (result.ok) {
                updateTag(handleTag(result.handle));
                updateTag(ADMIN_LOG_TAG);
                clearOrganization(orgId, result.removedUids);
            }
        } catch (error) {
            console.error(
                '[org] make unclaimed failed',
                (error as Error).message
            );
        }
    }
    redirect({ href: organizationPath(handle), locale });
}
