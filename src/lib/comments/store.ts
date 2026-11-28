import 'server-only';

import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { cacheLife, cacheTag } from 'next/cache';

import { getAdminDb } from '@/lib/firebase/admin';
import { logRead } from '@/lib/firebase/read-log';
import { effectiveRole } from '@/lib/platform-admin';

import {
    discussionOpen,
    PAGE_SIZE,
    rateCheck,
    readComment,
    reportId,
    targetKey,
    targetPath,
    COMMENT_LANGS,
    type CommentCounts,
    type CommentCursor,
    type CommentInput,
    type CommentLanguageFilter,
    type CommentPart,
    type CommentSort,
    type CommentTarget,
    type ReportReason,
    type StoredComment,
} from './index';

// Comments in Firestore (design: documentation/features/20-comments.md).
//
//   {parent}/comments/{id}               one comment: uid, text, lang,
//                                        createdAt, votes (a count), hidden,
//                                        and on organizations the reply
//                                        { uid, text, lang, createdAt,
//                                        byTeam, hidden }
//   {parent}/commentVotes/{id}_{uid}     one up vote per person per comment
//   commentReports/{kind}~{id}~{comment} open reports on one comment (and
//                                        `…~reply` on its reply): who
//                                        reported, and how many per reason
//   commentLimits/{uid}                  when the person last commented, for
//                                        the rate limit
//
// {parent} is the target's document (definitions/{slug} or
// organizations/{id}). Admin SDK only; rules deny clients. Super users'
// moderation goes in adminLog; an organization's replies go in its own
// moderationLog (and adminLog when the Communalists team wrote them).

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
    return readComment(
        doc.id,
        data,
        millis(data.createdAt),
        millis(data.reply?.createdAt)
    );
}

/**
 * One page of comments, in one language or all, cached until someone posts,
 * votes or moderates. Top: most up votes, then newest. Newest: by date.
 * Each order, with and without the language, has a composite index.
 * Hidden comments stay in place (shown as hidden), so counts and pages
 * don't shift.
 */
export async function getComments(
    target: CommentTarget,
    sort: CommentSort,
    after: CommentCursor | null,
    language: CommentLanguageFilter = 'all'
): Promise<{ comments: StoredComment[]; more: boolean }> {
    'use cache';
    cacheTag(commentsTag(target));
    cacheLife('days');
    const base =
        language === 'all'
            ? comments(target)
            : comments(target).where('lang', '==', language);
    let query =
        sort === 'top'
            ? base.orderBy('votes', 'desc').orderBy('createdAt', 'desc')
            : base.orderBy('createdAt', 'desc');
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

/**
 * How many comments a target has, in all and per language (five
 * aggregation reads), cached.
 */
export async function getCommentCounts(
    target: CommentTarget
): Promise<CommentCounts> {
    'use cache';
    cacheTag(commentsTag(target));
    cacheLife('days');
    const [all, ...each] = await Promise.all([
        comments(target).count().get(),
        ...COMMENT_LANGS.map((lang) =>
            comments(target).where('lang', '==', lang).count().get()
        ),
    ]);
    logRead('comments (counts)', 1 + COMMENT_LANGS.length);
    return {
        all: all.data().count,
        ...Object.fromEntries(
            COMMENT_LANGS.map((lang, i) => [lang, each[i].data().count])
        ),
    } as CommentCounts;
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
        if (!discussionOpen(target.kind, parentSnap.data()))
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
                reply: null,
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
        const [parentSnap, commentSnap, voteSnap] = await Promise.all([
            tx.get(parent(target)),
            tx.get(commentRef),
            tx.get(voteRef),
        ]);
        logRead('comments (vote)', 3);
        const comment = toComment(commentSnap);
        if (!comment || !discussionOpen(target.kind, parentSnap.data()))
            return { ok: false, error: 'notFound' } as const;
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

/**
 * Someone reports a comment, or the organization's reply to it. Once per
 * person; reports pile up on one document per comment or reply.
 */
export async function reportComment(
    target: CommentTarget,
    commentId: string,
    uid: string,
    reason: ReportReason,
    part: CommentPart = 'comment'
): Promise<ReportResult> {
    const commentRef = comments(target).doc(commentId);
    const reportRef = reports().doc(reportId(target, commentId, part));
    return db().runTransaction(async (tx) => {
        const [parentSnap, commentSnap, reportSnap] = await Promise.all([
            tx.get(parent(target)),
            tx.get(commentRef),
            tx.get(reportRef),
        ]);
        logRead('comments (report)', 3);
        const comment = toComment(commentSnap);
        if (!comment || !discussionOpen(target.kind, parentSnap.data()))
            return { ok: false, error: 'notFound' } as const;
        if (part === 'reply' && !comment.reply)
            return { ok: false, error: 'notFound' } as const;
        if ((part === 'reply' ? comment.reply!.uid : comment.uid) === uid)
            return { ok: false, error: 'ownComment' } as const;
        if (comment.hidden || (part === 'reply' && comment.reply!.hidden))
            return { ok: false, error: 'hidden' } as const;
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
                part,
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
    const replyReportRef = reports().doc(reportId(target, commentId, 'reply'));
    const result = await db().runTransaction(async (tx) => {
        const comment = toComment(await tx.get(commentRef));
        logRead('comments');
        if (!comment) return { ok: false, error: 'notFound' } as const;
        if (comment.uid !== actorUid && !asModerator)
            return { ok: false, error: 'notAllowed' } as const;
        // Its reply, and any report on it, go with it.
        tx.delete(commentRef);
        tx.delete(reportRef);
        tx.delete(replyReportRef);
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
                    ...(comment.reply
                        ? {
                              reply: {
                                  uid: comment.reply.uid,
                                  text: comment.reply.text,
                              },
                          }
                        : {}),
                },
                createdAt: FieldValue.serverTimestamp(),
            });
        return { ok: true, uid: comment.uid } as const;
    });
    if (result.ok) await deleteVotes(target, commentId);
    return result;
}

/** What the admin log says a comment was on: the word, or the organization. */
const logTarget = (target: CommentTarget, name: string) =>
    target.kind === 'definition'
        ? { definition: { slug: target.id, word: name } }
        : { orgId: target.id, orgName: name };

export type ModerateResult =
    { ok: true; changed: boolean } | { ok: false; error: 'notFound' };

/**
 * A super user hides a comment or an organization's reply (or shows it
 * again). Hiding closes its report. Logged.
 */
export async function setHidden(
    target: CommentTarget,
    commentId: string,
    adminUid: string,
    hidden: boolean,
    targetName: string,
    part: CommentPart = 'comment'
): Promise<ModerateResult> {
    const commentRef = comments(target).doc(commentId);
    const reportRef = reports().doc(reportId(target, commentId, part));
    // `reply.hidden` and so on, for the reply.
    const field = (name: string) => (part === 'reply' ? `reply.${name}` : name);
    return db().runTransaction(async (tx) => {
        const comment = toComment(await tx.get(commentRef));
        logRead('comments');
        if (!comment || (part === 'reply' && !comment.reply))
            return { ok: false, error: 'notFound' } as const;
        const now = part === 'reply' ? comment.reply!.hidden : comment.hidden;
        if (now === hidden) return { ok: true, changed: false } as const;
        tx.update(commentRef, {
            [field('hidden')]: hidden,
            ...(hidden
                ? {
                      [field('hiddenBy')]: adminUid,
                      [field('hiddenAt')]: FieldValue.serverTimestamp(),
                  }
                : {
                      [field('hiddenBy')]: FieldValue.delete(),
                      [field('hiddenAt')]: FieldValue.delete(),
                  }),
        });
        if (hidden) tx.delete(reportRef);
        tx.create(db().collection('adminLog').doc(), {
            action:
                part === 'reply'
                    ? hidden
                        ? 'hideReply'
                        : 'unhideReply'
                    : hidden
                      ? 'hideComment'
                      : 'unhideComment',
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
    targetName: string,
    part: CommentPart = 'comment'
): Promise<{ ok: boolean }> {
    const reportRef = reports().doc(reportId(target, commentId, part));
    return db().runTransaction(async (tx) => {
        const report = await tx.get(reportRef);
        logRead('commentReports');
        if (!report.exists) return { ok: false };
        tx.delete(reportRef);
        tx.create(db().collection('adminLog').doc(), {
            action: 'dismissCommentReport',
            ...logTarget(target, targetName),
            commentId,
            ...(part === 'reply' ? { part } : {}),
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
    part: CommentPart;
    count: number;
    reasons: Record<string, number>;
    lastAt?: number;
}

/** Every open report (on comments and replies), most reported first. Cached; one equality-free read of a small collection. */
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
                    part: d.part === 'reply' ? 'reply' : 'comment',
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

/** Who's writing or removing an organization's reply. */
export interface Replier {
    uid: string;
    /** Their name, for the organization's log (unless they write for the team). */
    displayName: string;
    platformAdmin: boolean;
}

export type ReplyResult =
    | { ok: true; comment: StoredComment }
    | {
          ok: false;
          error: 'notFound' | 'notAllowed' | 'hidden' | 'alreadyReplied';
      };

/**
 * The organization's reply to a comment: by its owners or moderators (on an
 * unclaimed page, super users, as the Communalists team). One per comment;
 * to change it, delete it and write again. Role, comment and listing are
 * checked fresh in the transaction. Logged in the organization's log (and
 * adminLog for the team). Organizations only.
 */
export async function postReply(
    target: CommentTarget,
    commentId: string,
    replier: Replier,
    input: CommentInput
): Promise<ReplyResult> {
    if (target.kind !== 'organization')
        return { ok: false, error: 'notAllowed' };
    const orgRef = parent(target);
    const commentRef = comments(target).doc(commentId);
    const memberRef = db()
        .collection('memberships')
        .doc(`${target.id}_${replier.uid}`);
    return db().runTransaction(async (tx) => {
        const [orgSnap, memberSnap, commentSnap] = await Promise.all([
            tx.get(orgRef),
            tx.get(memberRef),
            tx.get(commentRef),
        ]);
        logRead('comments (reply)', 3);
        const org = orgSnap.data();
        const comment = toComment(commentSnap);
        if (!comment || !discussionOpen(target.kind, org))
            return { ok: false, error: 'notFound' } as const;
        const byTeam = org!.claimStatus === 'unclaimed';
        if (!replierRole(org!, memberSnap.data(), replier.platformAdmin))
            return { ok: false, error: 'notAllowed' } as const;
        if (comment.hidden) return { ok: false, error: 'hidden' } as const;
        if (comment.reply)
            return { ok: false, error: 'alreadyReplied' } as const;
        const now = Date.now();
        tx.update(commentRef, {
            reply: {
                uid: replier.uid,
                text: input.text,
                lang: input.lang,
                createdAt: Timestamp.fromMillis(now),
                byTeam,
                hidden: false,
            },
        });
        logReply(tx, target, org!, replier, byTeam, 'replyComment', commentId);
        return {
            ok: true,
            comment: {
                ...comment,
                reply: {
                    uid: replier.uid,
                    text: input.text,
                    lang: input.lang,
                    at: now,
                    byTeam,
                    hidden: false,
                },
            },
        } as const;
    });
}

/**
 * Removes the organization's reply: its owners or moderators (the team on
 * an unclaimed page), or a super user moderating (`asModerator`, with a copy
 * in adminLog). Its open report goes too.
 */
export async function deleteReply(
    target: CommentTarget,
    commentId: string,
    replier: Replier,
    asModerator: boolean,
    targetName: string
): Promise<{ ok: true } | { ok: false; error: 'notFound' | 'notAllowed' }> {
    if (target.kind !== 'organization')
        return { ok: false, error: 'notAllowed' };
    const orgRef = parent(target);
    const commentRef = comments(target).doc(commentId);
    const memberRef = db()
        .collection('memberships')
        .doc(`${target.id}_${replier.uid}`);
    return db().runTransaction(async (tx) => {
        const [orgSnap, memberSnap, commentSnap] = await Promise.all([
            tx.get(orgRef),
            tx.get(memberRef),
            tx.get(commentRef),
        ]);
        logRead('comments (reply)', 3);
        const org = orgSnap.data();
        const comment = toComment(commentSnap);
        if (!org || !comment?.reply)
            return { ok: false, error: 'notFound' } as const;
        const staff =
            org.status === 'active' &&
            replierRole(org, memberSnap.data(), replier.platformAdmin);
        if (!staff && !asModerator)
            return { ok: false, error: 'notAllowed' } as const;
        tx.update(commentRef, { reply: FieldValue.delete() });
        tx.delete(reports().doc(reportId(target, commentId, 'reply')));
        if (staff)
            logReply(
                tx,
                target,
                org,
                replier,
                org.claimStatus === 'unclaimed',
                'deleteReply',
                commentId
            );
        else
            tx.create(db().collection('adminLog').doc(), {
                action: 'deleteReply',
                ...logTarget(target, targetName),
                commentId,
                actorUid: replier.uid,
                removed: {
                    uid: comment.reply.uid,
                    text: comment.reply.text,
                    lang: comment.reply.lang,
                },
                createdAt: FieldValue.serverTimestamp(),
            });
        return { ok: true } as const;
    });
}

/** Owners and moderators reply for an organization; on an unclaimed one, super users. */
function replierRole(
    org: FirebaseFirestore.DocumentData,
    membership: FirebaseFirestore.DocumentData | undefined,
    platformAdmin: boolean
): boolean {
    const role = effectiveRole(
        membership?.status === 'active' ? membership.role : null,
        { unclaimed: org.claimStatus === 'unclaimed' },
        platformAdmin
    );
    return role === 'owner' || role === 'moderator';
}

/** A reply written or removed: in the organization's log, and adminLog for the team. */
function logReply(
    tx: FirebaseFirestore.Transaction,
    target: CommentTarget,
    org: FirebaseFirestore.DocumentData,
    replier: Replier,
    byTeam: boolean,
    action: 'replyComment' | 'deleteReply',
    commentId: string
) {
    const stamp = FieldValue.serverTimestamp();
    tx.create(parent(target).collection('moderationLog').doc(), {
        action,
        commentId,
        actor: byTeam
            ? { uid: replier.uid, team: true }
            : { uid: replier.uid, displayName: replier.displayName },
        createdAt: stamp,
    });
    if (byTeam)
        tx.create(db().collection('adminLog').doc(), {
            action,
            ...logTarget(target, org.name ?? ''),
            commentId,
            actorUid: replier.uid,
            createdAt: stamp,
        });
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
