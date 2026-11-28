// Comments: a flat, public discussion under something people can talk about,
// with up votes. On dictionary words (features/19, "Discussion") and on
// listed organizations' pages, where the organization can add one official
// reply to each comment (decision #70). Pure: no React, Next or Firebase, so
// it's tested directly and a future mobile app can reuse it. The Firestore
// layer is ./store.ts. Design: documentation/features/20-comments.md.

import { z } from 'zod';

/** What comments can be under: a dictionary word, or an organization. */
export const COMMENT_TARGET_KINDS = ['definition', 'organization'] as const;
export type CommentTargetKind = (typeof COMMENT_TARGET_KINDS)[number];

export interface CommentTarget {
    kind: CommentTargetKind;
    /** The parent's id: a word's slug, or an organization's id (not its handle, which can change). */
    id: string;
}

/** A word's slug: lowercase words joined by hyphens, at most 60. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** A Firestore document id (auto ids, and seeded ones like `seed-sbma`). */
const DOC_ID = /^[A-Za-z0-9_-]{1,40}$/;

export const commentTargetSchema = z.discriminatedUnion('kind', [
    z.object({
        kind: z.literal('definition'),
        id: z.string().min(2).max(60).regex(SLUG),
    }),
    z.object({ kind: z.literal('organization'), id: z.string().regex(DOC_ID) }),
]);

/** The parent document's path, which holds `comments` and `commentVotes`. */
export function targetPath(target: CommentTarget): string {
    switch (target.kind) {
        case 'definition':
            return `definitions/${target.id}`;
        case 'organization':
            return `organizations/${target.id}`;
    }
}

/**
 * Whether the parent document (as stored) takes part in discussions now.
 * Words always do. Organizations only while active and listed: never
 * unlisted ones, which exist for groups that don't want to be found, and a
 * deleted one's page is gone. Comments stay stored either way, so listing or
 * restoring brings them back. Checked on every read and write.
 */
export function discussionOpen(
    kind: CommentTargetKind,
    parent: Record<string, unknown> | undefined
): boolean {
    if (!parent) return false;
    switch (kind) {
        case 'definition':
            return true;
        case 'organization':
            return parent.status === 'active' && parent.visibility === 'listed';
    }
}

/** Organizations reply to comments; words don't. */
export const takesReplies = (kind: CommentTargetKind) =>
    kind === 'organization';

/** One key per target, for cache tags and report ids: `definition~mutual-aid`. */
export const targetKey = (target: CommentTarget) =>
    `${target.kind}~${target.id}`;

/** A word's page (no locale), for links back to its discussion. An organization's page is at its handle (`organizationPath`). */
export const definitionHref = (slug: string) => `/dictionary/${slug}`;

/** Where the discussion starts on its page: sign-in and sign-up come back here. */
export const DISCUSSION_ANCHOR = 'discussion';

// --- Writing a comment

export const COMMENT_MAX = 2000;
/** Languages a comment can be marked as (the UI languages), for `lang`. */
export const COMMENT_LANGS = ['en', 'es', 'vi', 'zh'] as const;
export type CommentLang = (typeof COMMENT_LANGS)[number];

export type CommentErrorKey = 'textRequired' | 'textTooLong' | 'langInvalid';

/** What someone types. Errors are keys under Discussion.errors. */
export const commentInputSchema = z.object({
    text: z
        .string({ error: 'textRequired' })
        .transform(normalizeText)
        .pipe(
            z
                .string()
                .min(1, { error: 'textRequired' })
                .max(COMMENT_MAX, { error: 'textTooLong' })
        ),
    lang: z.enum(COMMENT_LANGS, { error: 'langInvalid' }),
});
export type CommentInput = z.infer<typeof commentInputSchema>;

/**
 * Trims, uses \n line endings, drops invisible control characters and keeps
 * at most one blank line between paragraphs.
 */
export function normalizeText(text: string): string {
    return (
        text
            .replace(/\r\n?/g, '\n')
            // Control characters other than newlines and tabs.
            .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim()
    );
}

/** Paragraphs to show: a blank line starts a new one. */
export const paragraphsOf = (text: string) =>
    text.split(/\n{2,}/).filter((p) => p.trim() !== '');

/** Characters left, counted the way the limit is checked. */
export const charactersLeft = (text: string) =>
    COMMENT_MAX - normalizeText(text).length;

// --- How often someone can comment

/** At most this many comments per person per window, across every discussion. */
export const RATE_LIMIT = 5;
export const RATE_WINDOW_MS = 60 * 60 * 1000;

/**
 * Whether one more comment is allowed now, given when the person's recent
 * comments were posted (epoch ms). `recent` is what to store afterward
 * (only the ones still in the window, plus now when allowed); `retryAt` is
 * when the next one would be allowed.
 */
export function rateCheck(
    previous: readonly number[],
    now: number
):
    | { allowed: true; recent: number[] }
    | { allowed: false; recent: number[]; retryAt: number } {
    const recent = previous
        .filter((at) => typeof at === 'number' && now - at < RATE_WINDOW_MS)
        .sort((a, b) => a - b);
    if (recent.length >= RATE_LIMIT)
        return {
            allowed: false,
            recent,
            retryAt: recent[recent.length - RATE_LIMIT] + RATE_WINDOW_MS,
        };
    return { allowed: true, recent: [...recent, now] };
}

// --- Reading comments

export const COMMENT_SORTS = ['top', 'newest'] as const;
export type CommentSort = (typeof COMMENT_SORTS)[number];
export const DEFAULT_SORT: CommentSort = 'top';
export const PAGE_SIZE = 20;

export const isCommentSort = (value: unknown): value is CommentSort =>
    COMMENT_SORTS.includes(value as CommentSort);

/**
 * Which comments to show: one language, or all of them. On words, readers
 * start with their UI language (moderators with all), and can switch to all.
 */
export type CommentLanguageFilter = CommentLang | 'all';

export const isLanguageFilter = (
    value: unknown
): value is CommentLanguageFilter =>
    value === 'all' || COMMENT_LANGS.includes(value as CommentLang);

/**
 * Where a viewer starts. Words: their UI language (each language has its own
 * definition, so feedback is mostly about that wording), or all for
 * moderators. Organizations: all, since their pages aren't translated.
 */
export function defaultLanguageFilter(
    locale: string,
    moderator: boolean,
    kind: CommentTargetKind = 'definition'
): CommentLanguageFilter {
    if (moderator || kind === 'organization') return 'all';
    return COMMENT_LANGS.includes(locale as CommentLang)
        ? (locale as CommentLang)
        : 'all';
}

/** How many comments there are, in all and in each language. */
export type CommentCounts = Record<CommentLanguageFilter, number>;

export const emptyCounts = (): CommentCounts => ({
    all: 0,
    en: 0,
    es: 0,
    vi: 0,
    zh: 0,
});

/** The counts after a comment in `lang` is added (+1) or removed (-1). */
export function adjustCounts(
    counts: CommentCounts,
    lang: CommentLang,
    by: 1 | -1
): CommentCounts {
    return {
        ...counts,
        all: Math.max(0, counts.all + by),
        [lang]: Math.max(0, counts[lang] + by),
    };
}

/** Where the next page starts: after the last comment shown. */
export interface CommentCursor {
    votes: number;
    at: number;
}

/** A cursor in a URL: `3.1764200000000`. */
export const encodeCursor = (cursor: CommentCursor) =>
    `${cursor.votes}.${cursor.at}`;

export function decodeCursor(value: unknown): CommentCursor | null {
    if (typeof value !== 'string') return null;
    const match = /^(\d{1,9})\.(\d{1,15})$/.exec(value);
    if (!match) return null;
    return { votes: Number(match[1]), at: Number(match[2]) };
}

export const cursorOf = (comment: { votes: number; at: number }) => ({
    votes: comment.votes,
    at: comment.at,
});

/**
 * The organization's one reply to a comment, stored on the comment. `uid`
 * (who wrote it) never leaves the server: the reply is the organization's
 * voice. `byTeam`: written by a super user while the page was unclaimed, so
 * it's shown as from the Communalists team, also after a claim.
 */
export interface StoredReply {
    uid: string;
    text: string;
    lang: CommentLang;
    at: number;
    byTeam: boolean;
    hidden: boolean;
}

/** A comment as stored, read safely (older or partial documents still read). */
export interface StoredComment {
    id: string;
    uid: string;
    text: string;
    lang: CommentLang;
    /** Epoch ms. */
    at: number;
    votes: number;
    hidden: boolean;
    reply: StoredReply | null;
}

const langOf = (value: unknown): CommentLang =>
    COMMENT_LANGS.includes(value as CommentLang)
        ? (value as CommentLang)
        : 'en';

export function readComment(
    id: string,
    data: Record<string, unknown>,
    at: number | undefined,
    /** The reply's date (epoch ms), converted by the store. */
    replyAt?: number
): StoredComment | null {
    if (typeof data.uid !== 'string' || typeof data.text !== 'string')
        return null;
    const reply = data.reply as Record<string, unknown> | undefined;
    return {
        id,
        uid: data.uid,
        text: data.text,
        lang: langOf(data.lang),
        at: at ?? 0,
        votes:
            typeof data.votes === 'number' && data.votes > 0
                ? Math.floor(data.votes)
                : 0,
        hidden: data.hidden === true,
        reply:
            reply &&
            typeof reply.uid === 'string' &&
            typeof reply.text === 'string'
                ? {
                      uid: reply.uid,
                      text: reply.text,
                      lang: langOf(reply.lang),
                      at: replyAt ?? 0,
                      byTeam: reply.byTeam === true,
                      hidden: reply.hidden === true,
                  }
                : null,
    };
}

/** The organization's reply as a viewer sees it. Never who wrote it. */
export interface ReplyView {
    /** Null when hidden by a moderator (super users still get it). */
    text: string | null;
    lang: CommentLang;
    at: number;
    /** From the organization, or from the Communalists team (written while unclaimed). */
    from: 'organization' | 'team';
    hidden: boolean;
}

/** What the page gets for one comment: only what this viewer may see. */
export interface CommentView {
    id: string;
    /** Null when hidden by a moderator (super users still get it). */
    text: string | null;
    lang: CommentLang;
    at: number;
    votes: number;
    hidden: boolean;
    /** Null when the account is gone. */
    /** `photo`: their small photo link, only if this viewer may see it. */
    author: { name: string; username?: string; photo?: string } | null;
    /** Written by the viewer. */
    mine: boolean;
    /** The viewer up voted it. */
    voted: boolean;
    /** The organization's reply, if any. Left out under a hidden comment, except for moderators. */
    reply: ReplyView | null;
}

export interface Viewer {
    uid: string | null;
    /** Super users see hidden text, and can hide, show and delete. */
    moderator: boolean;
}

function replyView(comment: StoredComment, viewer: Viewer): ReplyView | null {
    const { reply } = comment;
    // A reply under a hidden comment could repeat what was hidden.
    if (!reply || (comment.hidden && !viewer.moderator)) return null;
    return {
        text: reply.hidden && !viewer.moderator ? null : reply.text,
        lang: reply.lang,
        at: reply.at,
        from: reply.byTeam ? 'team' : 'organization',
        hidden: reply.hidden,
    };
}

export function commentView(
    comment: StoredComment,
    author: CommentView['author'],
    viewer: Viewer,
    votedIds: ReadonlySet<string>
): CommentView {
    return {
        id: comment.id,
        text: comment.hidden && !viewer.moderator ? null : comment.text,
        lang: comment.lang,
        at: comment.at,
        votes: comment.votes,
        hidden: comment.hidden,
        author,
        mine: viewer.uid !== null && comment.uid === viewer.uid,
        voted: votedIds.has(comment.id),
        reply: replyView(comment, viewer),
    };
}

/** What a viewer can do with one comment. The server checks the same rules. */
export function commentAbilities(
    comment: Pick<CommentView, 'mine' | 'hidden' | 'reply'>,
    viewer: {
        signedIn: boolean;
        moderator: boolean;
        /** The organization's owners and moderators (super users on unclaimed pages): they write its replies. */
        replier?: boolean;
    }
) {
    const { reply } = comment;
    const replier = viewer.replier === true;
    return {
        vote: viewer.signedIn && !comment.mine && !comment.hidden,
        report:
            viewer.signedIn &&
            !comment.mine &&
            !comment.hidden &&
            !viewer.moderator,
        delete: comment.mine || viewer.moderator,
        hide: viewer.moderator && !comment.hidden,
        unhide: viewer.moderator && comment.hidden,
        /** One reply per comment; to change it, delete it and write again. */
        reply: replier && !comment.hidden && !reply,
        replyReport:
            !!reply &&
            viewer.signedIn &&
            !replier &&
            !viewer.moderator &&
            !reply.hidden,
        replyDelete: !!reply && (replier || viewer.moderator),
        replyHide: !!reply && viewer.moderator && !reply.hidden,
        replyUnhide: !!reply && viewer.moderator && reply.hidden,
    };
}

export type CommentAbilities = ReturnType<typeof commentAbilities>;

/** Pages loaded one after another can repeat a comment whose votes changed: keep the first. */
export function mergePages(
    shown: readonly CommentView[],
    more: readonly CommentView[]
): CommentView[] {
    const seen = new Set(shown.map((c) => c.id));
    return [...shown, ...more.filter((c) => !seen.has(c.id))];
}

// --- Reports

export const REPORT_REASONS = [
    'spam',
    'harassment',
    'personalInfo',
    'misinformation',
    'other',
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const reportReasonSchema = z.enum(REPORT_REASONS);

/** What's reported, hidden or deleted: the comment, or the organization's reply to it. */
export const COMMENT_PARTS = ['comment', 'reply'] as const;
export type CommentPart = (typeof COMMENT_PARTS)[number];
export const commentPartSchema = z.enum(COMMENT_PARTS);

/**
 * One report document per reported comment or reply:
 * `definition~mutual-aid~{commentId}`, and `…~reply` for a reply.
 */
export const reportId = (
    target: CommentTarget,
    commentId: string,
    part: CommentPart = 'comment'
) => `${targetKey(target)}~${commentId}${part === 'reply' ? '~reply' : ''}`;

export function parseReportId(
    id: string
): { target: CommentTarget; commentId: string; part: CommentPart } | null {
    const [kind, targetId, commentId, part, ...rest] = id.split('~');
    if (rest.length || !commentId || (part !== undefined && part !== 'reply'))
        return null;
    const target = commentTargetSchema.safeParse({ kind, id: targetId });
    if (!target.success || !COMMENT_ID.test(commentId)) return null;
    return {
        target: target.data,
        commentId,
        part: part === 'reply' ? 'reply' : 'comment',
    };
}

/** Firestore auto ids (and seeded ones like `seed-c1`). */
const COMMENT_ID = /^[A-Za-z0-9_-]{1,40}$/;
export const commentIdSchema = z.string().regex(COMMENT_ID);

/** Reasons counted across everyone who reported, most common first. */
export function tallyReasons(
    reasons: Record<string, unknown> | undefined
): { reason: ReportReason; count: number }[] {
    return REPORT_REASONS.flatMap((reason) => {
        const count = reasons?.[reason];
        return typeof count === 'number' && count > 0
            ? [{ reason, count }]
            : [];
    }).sort((a, b) => b.count - a.count);
}
