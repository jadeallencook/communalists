// Comments: a flat, public discussion under something people can talk about,
// with up votes. Built for dictionary words first (features/19, "Discussion");
// written for any target so organization pages can reuse it later (only a new
// target kind and its own access rules). Pure: no React, Next or Firebase, so
// it's tested directly and a future mobile app can reuse it. The Firestore
// layer is ./store.ts. Design: documentation/features/20-comments.md.

import { z } from 'zod';

/** Who comments can be under. Organizations will be the next kind. */
export const COMMENT_TARGET_KINDS = ['definition'] as const;
export type CommentTargetKind = (typeof COMMENT_TARGET_KINDS)[number];

export interface CommentTarget {
    kind: CommentTargetKind;
    /** The parent's id: a word's slug. */
    id: string;
}

/** A target id: lowercase words joined by hyphens (a slug), at most 60. */
const TARGET_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const commentTargetSchema = z.object({
    kind: z.enum(COMMENT_TARGET_KINDS),
    id: z.string().min(2).max(60).regex(TARGET_ID),
});

/** The parent document's path, which holds `comments` and `commentVotes`. */
export function targetPath(target: CommentTarget): string {
    switch (target.kind) {
        case 'definition':
            return `definitions/${target.id}`;
    }
}

/** One key per target, for cache tags and report ids: `definition~mutual-aid`. */
export const targetKey = (target: CommentTarget) =>
    `${target.kind}~${target.id}`;

/** The page a target's discussion is on (no locale), for links back to it. */
export function targetHref(target: CommentTarget): string {
    switch (target.kind) {
        case 'definition':
            return `/dictionary/${target.id}`;
    }
}

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
 * Which comments to show: one language, or all of them. Readers start with
 * their UI language (moderators with all), and can switch to all.
 */
export type CommentLanguageFilter = CommentLang | 'all';

export const isLanguageFilter = (
    value: unknown
): value is CommentLanguageFilter =>
    value === 'all' || COMMENT_LANGS.includes(value as CommentLang);

/** Where a viewer starts: their UI language, or all languages for moderators. */
export function defaultLanguageFilter(
    locale: string,
    moderator: boolean
): CommentLanguageFilter {
    if (moderator) return 'all';
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
}

export function readComment(
    id: string,
    data: Record<string, unknown>,
    at: number | undefined
): StoredComment | null {
    if (typeof data.uid !== 'string' || typeof data.text !== 'string')
        return null;
    return {
        id,
        uid: data.uid,
        text: data.text,
        lang: COMMENT_LANGS.includes(data.lang as CommentLang)
            ? (data.lang as CommentLang)
            : 'en',
        at: at ?? 0,
        votes:
            typeof data.votes === 'number' && data.votes > 0
                ? Math.floor(data.votes)
                : 0,
        hidden: data.hidden === true,
    };
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
    author: { name: string; username?: string } | null;
    /** Written by the viewer. */
    mine: boolean;
    /** The viewer up voted it. */
    voted: boolean;
}

export interface Viewer {
    uid: string | null;
    /** Super users see hidden text, and can hide, show and delete. */
    moderator: boolean;
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
    };
}

/** What a viewer can do with one comment. The server checks the same rules. */
export function commentAbilities(
    comment: Pick<CommentView, 'mine' | 'hidden'>,
    viewer: { signedIn: boolean; moderator: boolean }
) {
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
    };
}

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

/** One report document per reported comment: `definition~mutual-aid~{commentId}`. */
export const reportId = (target: CommentTarget, commentId: string) =>
    `${targetKey(target)}~${commentId}`;

export function parseReportId(
    id: string
): { target: CommentTarget; commentId: string } | null {
    const [kind, targetId, commentId, ...rest] = id.split('~');
    if (rest.length || !commentId) return null;
    const target = commentTargetSchema.safeParse({ kind, id: targetId });
    if (!target.success || !COMMENT_ID.test(commentId)) return null;
    return { target: target.data, commentId };
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
