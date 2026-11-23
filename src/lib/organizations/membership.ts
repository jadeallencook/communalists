// Joining, leaving and moderating: the rules, with no React, Next or Firebase.
// The server actions and the Firestore layer apply them; tests cover them.
// Design: documentation/features/16-organizations.md → "Joining" and
// "Moderating members".

import { z } from 'zod';

import type { JoinPolicy, MemberListVisibility } from './options';

export type OrgRole = 'owner' | 'moderator' | 'member';
/** `pending`: asked to join. `banned`: removed or blocked, can't ask again until unbanned. */
export type MembershipStatus = 'active' | 'pending' | 'invited' | 'banned';

/**
 * What an owner or moderator can do to someone else. Stored in the
 * moderation log, so these keys are permanent.
 */
export type ModerationAction =
    | 'approve'
    | 'deny'
    | 'block'
    | 'remove'
    | 'ban'
    | 'unban'
    | 'makeModerator'
    | 'makeOwner'
    | 'makeMember';

export const MODERATION_ACTIONS: readonly ModerationAction[] = [
    'approve',
    'deny',
    'block',
    'remove',
    'ban',
    'unban',
    'makeModerator',
    'makeOwner',
    'makeMember',
];

/** The role each role-change action gives. */
export const ROLE_CHANGES = {
    makeModerator: 'moderator',
    makeOwner: 'owner',
    makeMember: 'member',
} as const satisfies Partial<Record<ModerationAction, OrgRole>>;
export type RoleChange = keyof typeof ROLE_CHANGES;
export const isRoleChange = (action: ModerationAction): action is RoleChange =>
    action in ROLE_CHANGES;

/** Actions that need a written reason. Blocking a request is a ban. */
export const REASON_REQUIRED: readonly ModerationAction[] = [
    'remove',
    'ban',
    'block',
];
export const REASON_MAX_LENGTH = 500;

export const isStaff = (role: OrgRole | null | undefined) =>
    role === 'owner' || role === 'moderator';

/**
 * Whether `actor` may act on someone with `target` role. Owners act on
 * moderators and members; moderators on members only (so one moderator
 * can't remove the others). Nobody acts on owners here: that comes with
 * ownership management.
 */
export function canActOn(actor: OrgRole | null, target: OrgRole): boolean {
    if (actor === 'owner') return target !== 'owner';
    if (actor === 'moderator') return target === 'member';
    return false;
}

/**
 * The role changes `actor` may make to someone with `target` role:
 * owners make members moderators or owners, make moderators owners, and make
 * moderators members again; moderators make members moderators. Nobody
 * changes an owner's role here (owners are permanent for now).
 */
export function allowedRoleChanges(
    actor: OrgRole | null,
    target: OrgRole
): RoleChange[] {
    if (actor === 'owner') {
        if (target === 'member') return ['makeModerator', 'makeOwner'];
        if (target === 'moderator') return ['makeOwner', 'makeMember'];
    }
    if (actor === 'moderator' && target === 'member') return ['makeModerator'];
    return [];
}

/** Which statuses each action applies to. */
const ACTION_FROM: Record<ModerationAction, MembershipStatus[]> = {
    approve: ['pending'],
    deny: ['pending'],
    block: ['pending'],
    remove: ['active'],
    ban: ['active'],
    unban: ['banned'],
    makeModerator: ['active'],
    makeOwner: ['active'],
    makeMember: ['active'],
};

export type ModerationProblem =
    | 'notAllowed'
    | 'self'
    | 'notFound'
    | 'reasonRequired'
    | 'reasonTooLong'
    | 'ownedLimit';

/** Checks one moderation action; null when it may go ahead. */
export function moderationProblem({
    action,
    actorUid,
    actorRole,
    target,
    reason,
}: {
    action: ModerationAction;
    actorUid: string;
    actorRole: OrgRole | null;
    target: { uid: string; role: OrgRole; status: MembershipStatus } | null;
    reason?: string;
}): ModerationProblem | null {
    if (!isStaff(actorRole)) return 'notAllowed';
    if (!target || !ACTION_FROM[action].includes(target.status))
        return 'notFound';
    if (target.uid === actorUid) return 'self';
    if (isRoleChange(action)) {
        if (!allowedRoleChanges(actorRole, target.role).includes(action))
            return 'notAllowed';
    } else if (!canActOn(actorRole, target.role)) return 'notAllowed';
    const text = (reason ?? '').trim();
    if (REASON_REQUIRED.includes(action) && text.length === 0)
        return 'reasonRequired';
    if (text.length > REASON_MAX_LENGTH) return 'reasonTooLong';
    return null;
}

/** A moderation form's fields. Errors are translation keys. */
export const moderationSchema = z.object({
    orgId: z.string().min(1).max(128),
    uid: z.string().min(1).max(128),
    action: z.enum(MODERATION_ACTIONS as [ModerationAction]),
    reason: z.string().trim().max(REASON_MAX_LENGTH).optional(),
});

/** What the join area on a group's page offers this viewer. */
export type JoinState =
    | 'signedOut'
    | 'join'
    | 'request'
    | 'inviteOnly'
    | 'pending'
    | 'banned'
    | 'member';

export function joinState(
    signedIn: boolean,
    policy: JoinPolicy,
    membership: { status: MembershipStatus } | null
): JoinState {
    if (!signedIn) return 'signedOut';
    switch (membership?.status) {
        case 'active':
            return 'member';
        case 'pending':
            return 'pending';
        case 'banned':
            return 'banned';
    }
    if (policy === 'open') return 'join';
    if (policy === 'request') return 'request';
    return 'inviteOnly';
}

/**
 * Whose names a viewer sees in the group's member list: everyone, or only
 * owners and moderators (everyone always sees the count). Staff always see
 * everyone, on the members page.
 */
export function visibleMembers(
    setting: MemberListVisibility,
    viewerRole: OrgRole | null
): 'everyone' | 'leaders' {
    if (isStaff(viewerRole)) return 'everyone';
    if (setting === 'public') return 'everyone';
    if (setting === 'members' && viewerRole) return 'everyone';
    return 'leaders';
}

/** Owners first, then moderators, then members; by name within each. */
export function sortMembers<T extends { role: OrgRole; displayName: string }>(
    members: T[],
    locale?: string
): T[] {
    const rank: Record<OrgRole, number> = { owner: 0, moderator: 1, member: 2 };
    return [...members].sort(
        (a, b) =>
            rank[a.role] - rank[b.role] ||
            a.displayName.localeCompare(b.displayName, locale)
    );
}
