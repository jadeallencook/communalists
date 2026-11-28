import 'server-only';

import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { cacheLife, cacheTag } from 'next/cache';

import { getAdminDb } from '@/lib/firebase/admin';
import { logRead } from '@/lib/firebase/read-log';

import {
    PAGE_SIZE,
    rateCheck,
    readComment,
    reportId,
    targetKey,
    targetPath,
    type CommentCursor,
    type CommentInput,
    type CommentSort,
    type CommentTarget,
    type ReportReason,
    type StoredComment,
} from './index';

// Comments in Firestore (design: documentation/features/20-comments.md).
//
//   {parent}/comments/{id}               one comment: uid, text, lang,
//                                        createdAt, votes (a count), hidden
//   {parent}/commentVotes/{id}_{uid}     one up vote per person per comment
//   commentReports/{kind}~{id}~{comment} open reports on one comment: who
//                                        reported, and how many per reason
//   commentLimits/{uid}                  when the person last commented, for
//                                        the rate limit
//
// {parent} is the target's document (definitions/{slug}). Admin SDK only;
// rules deny clients. Super users' moderation goes in adminLog.

const db = () => getAdminDb();
const parent = (target: CommentTarget) => db().doc(targetPath(target));
const comments = (target: CommentTarget) =>
    parent(target).collection('comments');
const votes = (target: CommentTarget) =>
    parent(target).collection('commentVotes');
const reports = () => db().collection('commentReports');
const limits = () => db().collection('commentLimits');
const voteId = (commentId: string, uid: string) => `${commentId}_${uid}`;

const millis = (value: unknown) =>
    value && typeof (value as { toMillis?: unknown }).toMillis === 'function'
        ? (value as { toMillis: () => number }).toMillis()
        : undefined;

/** Everything shown from one target's discussion. */
export const commentsTag = (target: CommentTarget) =>
    `comments:${targetKey(target)}`;
/** The open reports (/admin/comments and the count on /admin). */
export const COMMENT_REPORTS_TAG = 'commentReports';

function toComment(
    doc: FirebaseFirestore.DocumentSnapshot
): StoredComment | null {
    if (!doc.exists) return null;
    const data = doc.data()!;
    return readComment(doc.id, data, millis(data.createdAt));
}

/**
 * One page of comments, cached until someone posts, votes or moderates.
 * Top: most up votes, then newest (composite index). Newest: by date.
 * Hidden comments stay in place (shown as hidden), so counts and pages
 * don't shift.
 */
export async function getComments(
    target: CommentTarget,
    sort: CommentSort,
    after: CommentCursor | null
): Promise<{ comments: StoredComment[]; more: boolean }> {
    'use cache';
    cacheTag(commentsTag(target));
    cacheLife('days');
    let query =
        sort === 'top'
            ? comments(target)
                  .orderBy('votes', 'desc')
                  .orderBy('createdAt', 'desc')
            : comments(target).orderBy('createdAt', 'desc');
    if (after) {
        const at = Timestamp.fromMillis(after.at);
        query =
            sort === 'top'
                ? query.startAfter(after.votes, at)
                : query.startAfter(at);
    }
    // One extra tells us whether there's another page.
    const snapshot = await query.limit(PAGE_SIZE + 1).get();
    logRead('comments', Math.max(snapshot.size, 1));
    const found = snapshot.docs.flatMap((doc) => toComment(doc) ?? []);
    return {
        comments: found.slice(0, PAGE_SIZE),
        more: found.length > PAGE_SIZE,
    };
}

/** How many comments a target has (one aggregation read), cached. */
export async function getCommentCount(target: CommentTarget): Promise<number> {
    'use cache';
    cacheTag(commentsTag(target));
    cacheLife('days');
    const snapshot = await comments(target).count().get();
    logRead('comments (count)');
    return snapshot.data().count;
}

/** Which comments on this target the person up voted. Fresh: it's theirs alone. */
export async function getVotedIds(
    target: CommentTarget,
    uid: string
): Promise<Set<string>> {
    const snapshot = await votes(target).where('uid', '==', uid).get();
    logRead('commentVotes', Math.max(snapshot.size, 1));
    return new Set(snapshot.docs.map((doc) => doc.data().commentId as string));
}

export type PostCommentResult =
    | { ok: true; comment: StoredComment }
    | { ok: false; error: 'notFound' | 'rateLimited'; retryAt?: number };

/**
 * Adds a comment, in one transaction with the rate limit: at most
 * RATE_LIMIT per person per hour across every discussion. The target must
 * still exist. Dates are set here (not serverTimestamp) so a page's cursor
 * can point at a comment exactly.
 */
export async function postComment(
    target: CommentTarget,
    uid: string,
    input: CommentInput
): Promise<PostCommentResult> {
    const ref = comments(target).doc();
    const limitRef = limits().doc(uid);
    return db().runTransaction(async (tx) => {
        const [parentSnap, limitSnap] = await Promise.all([
            tx.get(parent(target)),
            tx.get(limitRef),
        ]);
        logRead('comments (parent, limit)', 2);
        if (!parentSnap.exists)
            return { ok: false, error: 'notFound' } as const;
        const now = Date.now();
        const check = rateCheck(
            (limitSnap.data()?.recent as number[] | undefined) ?? [],
            now
        );
        if (!check.allowed)
            return {
                ok: false,
                error: 'rateLimited',
                retryAt: check.retryAt,
            } as const;
        tx.set(limitRef, { recent: check.recent });
        tx.create(ref, {
            uid,
            text: input.text,
            lang: input.lang,
            votes: 0,
            hidden: false,
            createdAt: Timestamp.fromMillis(now),
        });
        return {
            ok: true,
            comment: {
                id: ref.id,
                uid,
                text: input.text,
                lang: input.lang,
                at: now,
                votes: 0,
                hidden: false,
            },
        } as const;
    });
}

export type VoteResult =
    | { ok: true; votes: number; voted: boolean }
    | { ok: false; error: 'notFound' | 'ownComment' | 'hidden' };

/**
 * Adds or takes back the person's up vote. One vote record per person per
 * comment, so nobody counts twice; the comment keeps the total.
 */
export async function setVote(
    target: CommentTarget,
    commentId: string,
    uid: string,
    up: boolean
): Promise<VoteResult> {
    const commentRef = comments(target).doc(commentId);
    const voteRef = votes(target).doc(voteId(commentId, uid));
    return db().runTransaction(async (tx) => {
        const [commentSnap, voteSnap] = await Promise.all([
            tx.get(commentRef),
            tx.get(voteRef),
        ]);
        logRead('comments (vote)', 2);
        const comment = toComment(commentSnap);
        if (!comment) return { ok: false, error: 'notFound' } as const;
        if (comment.uid === uid)
            return { ok: false, error: 'ownComment' } as const;
        if (comment.hidden) return { ok: false, error: 'hidden' } as const;
        if (voteSnap.exists === up)
            return { ok: true, votes: comment.votes, voted: up } as const;
        if (up)
            tx.create(voteRef, {
                commentId,
                uid,
                createdAt: FieldValue.serverTimestamp(),
            });
        else tx.delete(voteRef);
        const total = Math.max(0, comment.votes + (up ? 1 : -1));
        tx.update(commentRef, { votes: total });
        return { ok: true, votes: total, voted: up } as const;
    });
}

export type ReportResult =
    | { ok: true; already: boolean }
    | { ok: false; error: 'notFound' | 'ownComment' | 'hidden' };

/** Someone reports a comment. Once per person; reports pile up on one document. */
export async function reportComment(
    target: CommentTarget,
    commentId: string,
    uid: string,
    reason: ReportReason
): Promise<ReportResult> {
    const commentRef = comments(target).doc(commentId);
    const reportRef = reports().doc(reportId(target, commentId));
    return db().runTransaction(async (tx) => {
        const [commentSnap, reportSnap] = await Promise.all([
            tx.get(commentRef),
            tx.get(reportRef),
        ]);
        logRead('comments (report)', 2);
        const comment = toComment(commentSnap);
        if (!comment) return { ok: false, error: 'notFound' } as const;
        if (comment.uid === uid)
            return { ok: false, error: 'ownComment' } as const;
        if (comment.hidden) return { ok: false, error: 'hidden' } as const;
        const reporters = (reportSnap.data()?.reporters as string[]) ?? [];
        if (reporters.includes(uid))
            return { ok: true, already: true } as const;
        const now = FieldValue.serverTimestamp();
        if (reportSnap.exists)
            tx.update(reportRef, {
                reporters: FieldValue.arrayUnion(uid),
                [`reasons.${reason}`]: FieldValue.increment(1),
                count: FieldValue.increment(1),
                lastAt: now,
            });
        else
            tx.create(reportRef, {
                target: { kind: target.kind, id: target.id },
                commentId,
                reporters: [uid],
                reasons: { [reason]: 1 },
                count: 1,
                firstAt: now,
                lastAt: now,
            });
        return { ok: true, already: false } as const;
    });
}

/** Deletes a comment's votes (they're only meaningful with it). Outside the transaction: there may be many. */
async function deleteVotes(target: CommentTarget, commentId: string) {
    const snapshot = await votes(target)
        .where('commentId', '==', commentId)
        .select()
        .get();
    logRead('commentVotes', Math.max(snapshot.size, 1));
    const writer = db().bulkWriter();
    for (const doc of snapshot.docs) void writer.delete(doc.ref);
    await writer.close();
}

export type DeleteCommentResult =
    { ok: true; uid: string } | { ok: false; error: 'notFound' | 'notAllowed' };

/**
 * Deletes a comment for good: its author, or a super user (`asModerator`,
 * logged in adminLog with a copy of the text). Its open report goes too.
 */
export async function deleteComment(
    target: CommentTarget,
    commentId: string,
    actorUid: string,
    asModerator: boolean,
    /** For the log: what the target is called (the English word). */
    targetName: string
): Promise<DeleteCommentResult> {
    const commentRef = comments(target).doc(commentId);
    const reportRef = reports().doc(reportId(target, commentId));
    const result = await db().runTransaction(async (tx) => {
        const comment = toComment(await tx.get(commentRef));
        logRead('comments');
        if (!comment) return { ok: false, error: 'notFound' } as const;
        if (comment.uid !== actorUid && !asModerator)
            return { ok: false, error: 'notAllowed' } as const;
        tx.delete(commentRef);
        tx.delete(reportRef);
        if (comment.uid !== actorUid)
            tx.create(db().collection('adminLog').doc(), {
                action: 'deleteComment',
                ...logTarget(target, targetName),
                commentId,
                actorUid,
                removed: {
                    uid: comment.uid,
                    text: comment.text,
                    lang: comment.lang,
                    votes: comment.votes,
                },
                createdAt: FieldValue.serverTimestamp(),
            });
        return { ok: true, uid: comment.uid } as const;
    });
    if (result.ok) await deleteVotes(target, commentId);
    return result;
}

const logTarget = (target: CommentTarget, name: string) =>
    target.kind === 'definition'
        ? { definition: { slug: target.id, word: name } }
        : {};

export type ModerateResult =
    { ok: true; changed: boolean } | { ok: false; error: 'notFound' };

/** A super user hides a comment (or shows it again). Hiding closes its report. Logged. */
export async function setHidden(
    target: CommentTarget,
    commentId: string,
    adminUid: string,
    hidden: boolean,
    targetName: string
): Promise<ModerateResult> {
    const commentRef = comments(target).doc(commentId);
    const reportRef = reports().doc(reportId(target, commentId));
    return db().runTransaction(async (tx) => {
        const comment = toComment(await tx.get(commentRef));
        logRead('comments');
        if (!comment) return { ok: false, error: 'notFound' } as const;
        if (comment.hidden === hidden)
            return { ok: true, changed: false } as const;
        tx.update(commentRef, {
            hidden,
            ...(hidden
                ? {
                      hiddenBy: adminUid,
                      hiddenAt: FieldValue.serverTimestamp(),
                  }
                : {
                      hiddenBy: FieldValue.delete(),
                      hiddenAt: FieldValue.delete(),
                  }),
        });
        if (hidden) tx.delete(reportRef);
        tx.create(db().collection('adminLog').doc(), {
            action: hidden ? 'hideComment' : 'unhideComment',
            ...logTarget(target, targetName),
            commentId,
            actorUid: adminUid,
            createdAt: FieldValue.serverTimestamp(),
        });
        return { ok: true, changed: true } as const;
    });
}

/** A super user decides a report needs nothing: it's closed, the comment stays. Logged. */
export async function dismissReport(
    target: CommentTarget,
    commentId: string,
    adminUid: string,
    targetName: string
): Promise<{ ok: boolean }> {
    const reportRef = reports().doc(reportId(target, commentId));
    return db().runTransaction(async (tx) => {
        const report = await tx.get(reportRef);
        logRead('commentReports');
        if (!report.exists) return { ok: false };
        tx.delete(reportRef);
        tx.create(db().collection('adminLog').doc(), {
            action: 'dismissCommentReport',
            ...logTarget(target, targetName),
            commentId,
            actorUid: adminUid,
            count: report.data()?.count ?? 0,
            createdAt: FieldValue.serverTimestamp(),
        });
        return { ok: true };
    });
}

export interface OpenReport {
    target: CommentTarget;
    commentId: string;
    count: number;
    reasons: Record<string, number>;
    lastAt?: number;
}

/** Every open report, most reported first. Cached; one equality-free read of a small collection. */
export async function getOpenReports(): Promise<OpenReport[]> {
    'use cache';
    cacheTag(COMMENT_REPORTS_TAG);
    cacheLife('hours');
    const snapshot = await reports().get();
    logRead('commentReports', Math.max(snapshot.size, 1));
    return snapshot.docs
        .flatMap((doc): OpenReport[] => {
            const d = doc.data();
            if (!d.target || typeof d.commentId !== 'string') return [];
            return [
                {
                    target: { kind: d.target.kind, id: d.target.id },
                    commentId: d.commentId,
                    count: typeof d.count === 'number' ? d.count : 0,
                    reasons: d.reasons ?? {},
                    lastAt: millis(d.lastAt),
                },
            ];
        })
        .sort((a, b) => b.count - a.count || (b.lastAt ?? 0) - (a.lastAt ?? 0));
}

/** How many comments have open reports (one aggregation read), cached. */
export async function getOpenReportCount(): Promise<number> {
    'use cache';
    cacheTag(COMMENT_REPORTS_TAG);
    cacheLife('hours');
    const snapshot = await reports().count().get();
    logRead('commentReports (count)');
    return snapshot.data().count;
}

/** One comment, straight from Firestore (the admin page shows reported ones). */
export async function getCommentFresh(
    target: CommentTarget,
    commentId: string
): Promise<StoredComment | null> {
    logRead('comments');
    return toComment(await comments(target).doc(commentId).get());
}

/**
 * When a word is removed: its comments and votes go with it (Firestore
 * doesn't delete subcollections on its own), and so do their open reports.
 */
export async function deleteAllComments(target: CommentTarget): Promise<void> {
    const open = await reports()
        .where('target.kind', '==', target.kind)
        .where('target.id', '==', target.id)
        .select()
        .get();
    logRead('commentReports', Math.max(open.size, 1));
    const writer = db().bulkWriter();
    for (const doc of open.docs) void writer.delete(doc.ref);
    await writer.close();
    await db().recursiveDelete(comments(target));
    await db().recursiveDelete(votes(target));
}
