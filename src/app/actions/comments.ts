'use server';

import { updateTag } from 'next/cache';

import { isSetupComplete } from '@/lib/account-setup';
import { getSessionUser } from '@/lib/auth/session';
import { isPlatformAdmin } from '@/lib/auth/platform-admin';
import {
    commentIdSchema,
    commentInputSchema,
    commentPartSchema,
    commentTargetSchema,
    reportReasonSchema,
    type CommentErrorKey,
    type CommentPart,
    type CommentTarget,
    type CommentView,
} from '@/lib/comments';
import { canModerate, targetName } from '@/lib/comments/access';
import {
    COMMENT_REPORTS_TAG,
    commentsTag,
    deleteComment,
    deleteReply,
    dismissReport,
    postComment,
    postReply,
    reportComment,
    setHidden,
    setVote,
} from '@/lib/comments/store';
import { viewsFor } from '@/lib/comments/views';
import { orgMembersTag } from '@/lib/organizations';
import { ADMIN_LOG_TAG } from '@/lib/organizations/claim-store';
import { getUserProfile, getUserProfileFresh } from '@/lib/users';

// Posting, voting on, reporting and moderating comments
// (documentation/features/20-comments.md). Called from the discussion's
// hook with plain values; every input is checked here, and every rule is
// decided on the server with fresh data. Comment text is never logged.

/** Why an action didn't happen. Keys under Discussion.errors. */
export type CommentActionError =
    | 'signedOut'
    | 'setupNeeded'
    | 'notAllowed'
    | 'notFound'
    | 'rateLimited'
    | 'ownComment'
    | 'hidden'
    | 'alreadyReplied'
    | 'invalid'
    | 'generic';

type Failure = { ok: false; error: CommentActionError };

function changed(target: CommentTarget, moderation = false) {
    updateTag(commentsTag(target));
    if (moderation) {
        updateTag(COMMENT_REPORTS_TAG);
        updateTag(ADMIN_LOG_TAG);
    }
}

/** A signed-in person with a finished account (the name shown on comments). */
async function participant(): Promise<
    { ok: true; uid: string; displayName: string } | Failure
> {
    const user = await getSessionUser();
    if (!user) return { ok: false, error: 'signedOut' };
    let profile = await getUserProfile(user.uid);
    if (!isSetupComplete(profile))
        profile = await getUserProfileFresh(user.uid);
    if (!isSetupComplete(profile)) return { ok: false, error: 'setupNeeded' };
    return { ok: true, uid: user.uid, displayName: profile!.displayName ?? '' };
}

/** Which part an action is on: the comment (default), or the organization's reply to it. */
function partOf(raw: unknown): CommentPart | null {
    const part = commentPartSchema.safeParse(raw ?? 'comment');
    return part.success ? part.data : null;
}

const fail = (where: string, error: unknown): Failure => {
    console.error(`[comments] ${where} failed`, (error as Error).message);
    return { ok: false, error: 'generic' };
};

export type PostCommentState =
    | { ok: true; comment: CommentView }
    | {
          ok: false;
          error: CommentActionError;
          /** For `invalid`: what's wrong with the text. */
          field?: CommentErrorKey;
          /** For `rateLimited`: when they can post again (epoch ms). */
          retryAt?: number;
      };

export async function postCommentAction(
    rawTarget: CommentTarget,
    raw: { text: string; lang: string }
): Promise<PostCommentState> {
    const target = commentTargetSchema.safeParse(rawTarget);
    if (!target.success) return { ok: false, error: 'invalid' };
    const who = await participant();
    if (!who.ok) return who;
    const input = commentInputSchema.safeParse(raw);
    if (!input.success)
        return {
            ok: false,
            error: 'invalid',
            field: input.error.issues[0]?.message as CommentErrorKey,
        };
    try {
        const result = await postComment(target.data, who.uid, input.data);
        if (!result.ok)
            return {
                ok: false,
                error: result.error,
                retryAt: result.retryAt,
            };
        changed(target.data);
        const [comment] = await viewsFor(
            target.data,
            [result.comment],
            { uid: who.uid, moderator: canModerate(target.data, who.uid) },
            new Set()
        );
        return { ok: true, comment };
    } catch (error) {
        return fail('post', error);
    }
}

export type VoteState = { ok: true; votes: number; voted: boolean } | Failure;

export async function voteCommentAction(
    rawTarget: CommentTarget,
    rawId: string,
    up: boolean
): Promise<VoteState> {
    const target = commentTargetSchema.safeParse(rawTarget);
    const id = commentIdSchema.safeParse(rawId);
    if (!target.success || !id.success || typeof up !== 'boolean')
        return { ok: false, error: 'invalid' };
    const who = await participant();
    if (!who.ok) return who;
    try {
        const result = await setVote(target.data, id.data, who.uid, up);
        if (!result.ok) return result;
        changed(target.data);
        return result;
    } catch (error) {
        return fail('vote', error);
    }
}

export type ReportState = { ok: true; already: boolean } | Failure;

export async function reportCommentAction(
    rawTarget: CommentTarget,
    rawId: string,
    rawReason: string,
    rawPart?: CommentPart
): Promise<ReportState> {
    const target = commentTargetSchema.safeParse(rawTarget);
    const id = commentIdSchema.safeParse(rawId);
    const reason = reportReasonSchema.safeParse(rawReason);
    const part = partOf(rawPart);
    if (!target.success || !id.success || !reason.success || !part)
        return { ok: false, error: 'invalid' };
    const who = await participant();
    if (!who.ok) return who;
    try {
        const result = await reportComment(
            target.data,
            id.data,
            who.uid,
            reason.data,
            part
        );
        if (!result.ok) return result;
        if (!result.already) updateTag(COMMENT_REPORTS_TAG);
        return result;
    } catch (error) {
        return fail('report', error);
    }
}

export type ModerationState = { ok: true } | Failure;

/**
 * The author deletes their own comment, or a super user deletes anyone's
 * (logged). On `reply`: the organization's owners or moderators remove its
 * reply (in its log), or a super user does (in adminLog).
 */
export async function deleteCommentAction(
    rawTarget: CommentTarget,
    rawId: string,
    rawPart?: CommentPart
): Promise<ModerationState> {
    const target = commentTargetSchema.safeParse(rawTarget);
    const id = commentIdSchema.safeParse(rawId);
    const part = partOf(rawPart);
    if (!target.success || !id.success || !part)
        return { ok: false, error: 'invalid' };
    const user = await getSessionUser();
    if (!user) return { ok: false, error: 'signedOut' };
    const moderator = canModerate(target.data, user.uid);
    if (part === 'reply') return removeReply(target.data, id.data, moderator);
    try {
        const result = await deleteComment(
            target.data,
            id.data,
            user.uid,
            moderator,
            moderator ? await targetName(target.data) : ''
        );
        if (!result.ok) return result;
        changed(target.data, result.uid !== user.uid);
        // Its report (if any) is gone either way.
        updateTag(COMMENT_REPORTS_TAG);
        return { ok: true };
    } catch (error) {
        return fail('delete', error);
    }
}

async function removeReply(
    target: CommentTarget,
    commentId: string,
    moderator: boolean
): Promise<ModerationState> {
    const who = await participant();
    if (!who.ok) return who;
    try {
        const result = await deleteReply(
            target,
            commentId,
            { ...who, platformAdmin: isPlatformAdmin(who.uid) },
            moderator,
            moderator ? await targetName(target) : ''
        );
        if (!result.ok) return result;
        replied(target);
        updateTag(COMMENT_REPORTS_TAG);
        return { ok: true };
    } catch (error) {
        return fail('delete reply', error);
    }
}

/** After a reply is written or removed: the discussion, the organization's log and the team's. */
function replied(target: CommentTarget) {
    changed(target);
    updateTag(orgMembersTag(target.id));
    updateTag(ADMIN_LOG_TAG);
}

export type ReplyState =
    | { ok: true; comment: CommentView }
    | { ok: false; error: CommentActionError; field?: CommentErrorKey };

/**
 * The organization's reply to a comment on its page, by its owners or
 * moderators (super users on an unclaimed page, as the Communalists team).
 * One per comment. The role is checked on fresh data.
 */
export async function replyCommentAction(
    rawTarget: CommentTarget,
    rawId: string,
    raw: { text: string; lang: string }
): Promise<ReplyState> {
    const target = commentTargetSchema.safeParse(rawTarget);
    const id = commentIdSchema.safeParse(rawId);
    if (!target.success || !id.success) return { ok: false, error: 'invalid' };
    const who = await participant();
    if (!who.ok) return who;
    const input = commentInputSchema.safeParse(raw);
    if (!input.success)
        return {
            ok: false,
            error: 'invalid',
            field: input.error.issues[0]?.message as CommentErrorKey,
        };
    try {
        const result = await postReply(
            target.data,
            id.data,
            { ...who, platformAdmin: isPlatformAdmin(who.uid) },
            input.data
        );
        if (!result.ok) return result;
        replied(target.data);
        const [comment] = await viewsFor(target.data, [result.comment], {
            uid: who.uid,
            moderator: canModerate(target.data, who.uid),
        });
        return { ok: true, comment };
    } catch (error) {
        return fail('reply', error);
    }
}

/** A super user hides a comment or a reply, or shows it again (logged). */
export async function hideCommentAction(
    rawTarget: CommentTarget,
    rawId: string,
    hidden: boolean,
    rawPart?: CommentPart
): Promise<ModerationState> {
    const target = commentTargetSchema.safeParse(rawTarget);
    const id = commentIdSchema.safeParse(rawId);
    const part = partOf(rawPart);
    if (!target.success || !id.success || typeof hidden !== 'boolean' || !part)
        return { ok: false, error: 'invalid' };
    const user = await getSessionUser();
    if (!user) return { ok: false, error: 'signedOut' };
    if (!canModerate(target.data, user.uid))
        return { ok: false, error: 'notAllowed' };
    try {
        const result = await setHidden(
            target.data,
            id.data,
            user.uid,
            hidden,
            await targetName(target.data),
            part
        );
        if (!result.ok) return result;
        changed(target.data, true);
        return { ok: true };
    } catch (error) {
        return fail('hide', error);
    }
}

/** A super user closes a report without changing the comment or reply (logged). */
export async function dismissReportAction(
    rawTarget: CommentTarget,
    rawId: string,
    rawPart?: CommentPart
): Promise<ModerationState> {
    const target = commentTargetSchema.safeParse(rawTarget);
    const id = commentIdSchema.safeParse(rawId);
    const part = partOf(rawPart);
    if (!target.success || !id.success || !part)
        return { ok: false, error: 'invalid' };
    const user = await getSessionUser();
    if (!user) return { ok: false, error: 'signedOut' };
    if (!canModerate(target.data, user.uid))
        return { ok: false, error: 'notAllowed' };
    try {
        const result = await dismissReport(
            target.data,
            id.data,
            user.uid,
            await targetName(target.data),
            part
        );
        if (!result.ok) return { ok: false, error: 'notFound' };
        updateTag(COMMENT_REPORTS_TAG);
        updateTag(ADMIN_LOG_TAG);
        return { ok: true };
    } catch (error) {
        return fail('dismiss', error);
    }
}
