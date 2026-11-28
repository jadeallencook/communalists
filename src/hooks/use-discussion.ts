'use client';

import { useState } from 'react';

import {
    adjustCounts,
    charactersLeft,
    mergePages,
    type CommentCounts,
    type CommentErrorKey,
    type CommentLanguageFilter,
    type CommentPart,
    type CommentSort,
    type CommentView,
    type ReportReason,
} from '@/lib/comments';

// The discussion under a word or an organization: the list, its order and
// language, loading more, posting, voting, reporting, moderating, and the
// organization's replies. The server
// actions and the page loader come in as functions, so the hook (and the
// components) never import server code. Design:
// documentation/features/20-comments.md.

/** Why an action didn't happen (the server's keys, plus `network`). */
export type DiscussionError =
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

type Failure = { ok: false; error: DiscussionError };

export interface DiscussionActions {
    /**
     * A page of comments in `sort` order, in one language or all: the first
     * page, or the one after `after`.
     */
    load: (
        sort: CommentSort,
        language: CommentLanguageFilter,
        after: string | null
    ) => Promise<{ comments: CommentView[]; next: string | null }>;
    post: (input: {
        text: string;
        lang: string;
    }) => Promise<
        | { ok: true; comment: CommentView }
        | (Failure & { field?: CommentErrorKey; retryAt?: number })
    >;
    vote: (
        id: string,
        up: boolean
    ) => Promise<{ ok: true; votes: number; voted: boolean } | Failure>;
    report: (
        id: string,
        reason: ReportReason,
        part: CommentPart
    ) => Promise<{ ok: true; already: boolean } | Failure>;
    remove: (id: string, part: CommentPart) => Promise<{ ok: true } | Failure>;
    hide: (
        id: string,
        hidden: boolean,
        part: CommentPart
    ) => Promise<{ ok: true } | Failure>;
    /** The organization's reply to a comment (organizations only). */
    reply?: (
        id: string,
        input: { text: string; lang: string }
    ) => Promise<
        | { ok: true; comment: CommentView }
        | (Failure & { field?: CommentErrorKey })
    >;
}

/** Results, under Discussion.announce. */
export type DiscussionAnnouncement =
    | 'posted'
    | 'voted'
    | 'unvoted'
    | 'reported'
    | 'alreadyReported'
    | 'deleted'
    | 'hidden'
    | 'unhidden'
    | 'replied'
    | 'replyDeleted'
    | 'replyHidden'
    | 'replyUnhidden'
    | 'sortedTop'
    | 'sortedNewest'
    | 'languageOne'
    | 'languageAll'
    | 'loaded';

/** Problems, under Discussion.errors. */
export type DiscussionProblem =
    | DiscussionError
    | CommentErrorKey
    | 'loadFailed'
    // The reply form's wording of textRequired and textTooLong.
    | 'replyTextRequired'
    | 'replyTextTooLong';

/**
 * Where focus goes next: a comment (`part` left out), its reply, or the
 * Reply button under it (after closing the reply form); with no id, the
 * announcement.
 */
export interface DiscussionFocus {
    id: string | null;
    at: number;
    part?: 'reply' | 'replyButton';
}

/**
 * Something to say, with its values. `at` changes every time, so the same
 * message is announced again.
 */
export type DiscussionNotice = (
    | { tone: 'status'; key: DiscussionAnnouncement }
    | { tone: 'alert'; key: DiscussionProblem }
) & { values?: Record<string, string | number>; at: number };

export interface UseDiscussionOptions {
    initial: { comments: CommentView[]; next: string | null };
    /** How many comments, in all and per language. */
    counts: CommentCounts;
    /** Which language the first page is in (the reader's, or all). */
    language: CommentLanguageFilter;
    /** The form's language to start with: the UI language. */
    defaultLang: string;
    actions: DiscussionActions;
}

export function useDiscussion({
    initial,
    counts: initialCounts,
    language: initialLanguage,
    defaultLang,
    actions,
}: UseDiscussionOptions) {
    const [comments, setComments] = useState(initial.comments);
    const [next, setNext] = useState(initial.next);
    const [counts, setCounts] = useState(initialCounts);
    const [sort, setSortState] = useState<CommentSort>('top');
    const [language, setLanguageState] = useState(initialLanguage);
    /** `sort` covers any reload of the first page (order or language). */
    const [loading, setLoading] = useState<'sort' | 'more' | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);

    const [draft, setDraft] = useState('');
    const [lang, setLang] = useState(defaultLang);
    const [posting, setPosting] = useState(false);
    const [formError, setFormError] = useState<{
        key: DiscussionProblem;
        retryAt?: number;
        at: number;
    } | null>(null);

    const [busy, setBusy] = useState<ReadonlySet<string>>(new Set());
    const [notice, setNotice] = useState<DiscussionNotice | null>(null);
    /**
     * Where focus goes next: a comment (just posted, first of a new page,
     * acted on), or the announcement (`id: null`, after deleting).
     */
    const [focus, setFocus] = useState<DiscussionFocus | null>(null);

    /** The organization's reply being written: to which comment, and its text. */
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyDraft, setReplyDraftState] = useState('');
    const [replyLang, setReplyLang] = useState(defaultLang);
    const [replyPosting, setReplyPosting] = useState(false);
    const [replyError, setReplyError] = useState<{
        key: DiscussionProblem;
        at: number;
    } | null>(null);
    const say = (
        key: DiscussionAnnouncement,
        values?: DiscussionNotice['values']
    ) => setNotice({ tone: 'status', key, values, at: Date.now() });
    const failed = (key: DiscussionProblem) =>
        setNotice({ tone: 'alert', key, at: Date.now() });

    const withBusy = async <T>(id: string, run: () => Promise<T>) => {
        setBusy((b) => new Set(b).add(id));
        try {
            return await run();
        } finally {
            setBusy((b) => {
                const copy = new Set(b);
                copy.delete(id);
                return copy;
            });
        }
    };

    const update = (id: string, change: Partial<CommentView>) =>
        setComments((list) =>
            list.map((c) => (c.id === id ? { ...c, ...change } : c))
        );

    /** Loads the first page again in another order or language. */
    const reload = async (
        to: { sort: CommentSort; language: CommentLanguageFilter },
        announce: () => void,
        focusFirst = false
    ) => {
        if (loading) return;
        setLoading('sort');
        try {
            const page = await actions.load(to.sort, to.language, null);
            setSortState(to.sort);
            setLanguageState(to.language);
            setComments(page.comments);
            setNext(page.next);
            setLoadFailed(false);
            announce();
            if (focusFirst && page.comments[0])
                setFocus({ id: page.comments[0].id, at: Date.now() });
        } catch {
            // The list stays as it was.
            failed('loadFailed');
        } finally {
            setLoading(null);
        }
    };

    const setSort = (to: CommentSort) => {
        if (to === sort) return;
        return reload({ sort: to, language }, () =>
            say(to === 'top' ? 'sortedTop' : 'sortedNewest')
        );
    };

    /**
     * Shows comments in one language, or in all. `focusFirst` moves focus
     * to the first comment, for buttons that disappear once pressed (the
     * empty language's "See N comments in other languages").
     */
    const setLanguage = (to: CommentLanguageFilter, focusFirst = false) => {
        if (to === language) return;
        return reload(
            { sort, language: to },
            () =>
                to === 'all'
                    ? say('languageAll', { count: counts.all })
                    : say('languageOne', { language: to, count: counts[to] }),
            focusFirst
        );
    };

    const loadMore = async () => {
        if (!next || loading) return;
        setLoading('more');
        setLoadFailed(false);
        try {
            const page = await actions.load(sort, language, next);
            // What's new compared with the list as it was when asked.
            const merged = mergePages(comments, page.comments);
            const first = merged[comments.length];
            setComments((list) => mergePages(list, page.comments));
            setNext(page.next);
            say('loaded', { count: merged.length - comments.length });
            if (first) setFocus({ id: first.id, at: Date.now() });
        } catch {
            setLoadFailed(true);
            failed('loadFailed');
        } finally {
            setLoading(null);
        }
    };

    const submit = async () => {
        if (posting) return;
        const left = charactersLeft(draft);
        if (draft.trim() === '' || left < 0) {
            setFormError({
                key: left < 0 ? 'textTooLong' : 'textRequired',
                at: Date.now(),
            });
            return;
        }
        setPosting(true);
        setFormError(null);
        try {
            const result = await actions.post({ text: draft, lang });
            if (!result.ok) {
                setFormError({
                    key:
                        result.error === 'invalid' && result.field
                            ? result.field
                            : result.error,
                    retryAt: result.retryAt,
                    at: Date.now(),
                });
                return;
            }
            // Shown at the top whatever the order, so the author sees it.
            setComments((list) => [
                result.comment,
                ...list.filter((c) => c.id !== result.comment.id),
            ]);
            setCounts((c) => adjustCounts(c, result.comment.lang, 1));
            setDraft('');
            say('posted');
            setFocus({ id: result.comment.id, at: Date.now() });
        } catch {
            setFormError({ key: 'generic', at: Date.now() });
        } finally {
            setPosting(false);
        }
    };

    const vote = (id: string) =>
        withBusy(id, async () => {
            const before = comments.find((c) => c.id === id);
            if (!before) return;
            const up = !before.voted;
            // Shown at once; put back if the server says no.
            update(id, {
                voted: up,
                votes: Math.max(0, before.votes + (up ? 1 : -1)),
            });
            try {
                const result = await actions.vote(id, up);
                if (!result.ok) {
                    update(id, { voted: before.voted, votes: before.votes });
                    return failed(result.error);
                }
                update(id, { voted: result.voted, votes: result.votes });
                say(result.voted ? 'voted' : 'unvoted', {
                    count: result.votes,
                });
            } catch {
                update(id, { voted: before.voted, votes: before.votes });
                failed('generic');
            }
        });

    const report = (
        id: string,
        reason: ReportReason,
        part: CommentPart = 'comment'
    ) =>
        withBusy(id, async () => {
            try {
                const result = await actions.report(id, reason, part);
                if (!result.ok) return failed(result.error);
                // Focus stays on Report (the dialog gives it back); the
                // result is announced.
                say(result.already ? 'alreadyReported' : 'reported');
            } catch {
                failed('generic');
            }
        });

    const remove = (id: string, part: CommentPart = 'comment') =>
        withBusy(id, async () => {
            const gone = comments.find((c) => c.id === id);
            try {
                const result = await actions.remove(id, part);
                if (part === 'reply') {
                    if (!result.ok && result.error !== 'notFound')
                        return failed(result.error);
                    // The comment stays: focus goes back to it.
                    update(id, { reply: null });
                    say('replyDeleted');
                    setFocus({ id, at: Date.now() });
                    return;
                }
                if (!result.ok && result.error !== 'notFound')
                    return failed(result.error);
                // Gone either way. Focus goes to the announcement (the
                // comment it was on no longer exists).
                setComments((list) => list.filter((c) => c.id !== id));
                if (gone) setCounts((c) => adjustCounts(c, gone.lang, -1));
                say('deleted');
                setFocus({ id: null, at: Date.now() });
            } catch {
                failed('generic');
            }
        });

    const hide = (id: string, hidden: boolean, part: CommentPart = 'comment') =>
        withBusy(id, async () => {
            try {
                const result = await actions.hide(id, hidden, part);
                if (!result.ok) return failed(result.error);
                if (part === 'reply') {
                    setComments((list) =>
                        list.map((c) =>
                            c.id === id && c.reply
                                ? { ...c, reply: { ...c.reply, hidden } }
                                : c
                        )
                    );
                    say(hidden ? 'replyHidden' : 'replyUnhidden');
                    setFocus({ id, at: Date.now(), part: 'reply' });
                    return;
                }
                update(id, { hidden });
                say(hidden ? 'hidden' : 'unhidden');
                setFocus({ id, at: Date.now() });
            } catch {
                failed('generic');
            }
        });

    /** Opens the reply form under a comment (one at a time). */
    const openReply = (id: string) => {
        setReplyingTo(id);
        setReplyDraftState('');
        setReplyLang(defaultLang);
        setReplyError(null);
    };

    /** Closes the reply form; focus goes back to its Reply button. */
    const cancelReply = () => {
        const id = replyingTo;
        setReplyingTo(null);
        setReplyError(null);
        if (id) setFocus({ id, at: Date.now(), part: 'replyButton' });
    };

    const submitReply = async () => {
        const id = replyingTo;
        if (!id || replyPosting || !actions.reply) return;
        const left = charactersLeft(replyDraft);
        if (replyDraft.trim() === '' || left < 0) {
            setReplyError({
                key: left < 0 ? 'textTooLong' : 'textRequired',
                at: Date.now(),
            });
            return;
        }
        setReplyPosting(true);
        setReplyError(null);
        try {
            const result = await actions.reply(id, {
                text: replyDraft,
                lang: replyLang,
            });
            if (!result.ok) {
                setReplyError({
                    key:
                        result.error === 'invalid' && result.field
                            ? result.field
                            : result.error,
                    at: Date.now(),
                });
                return;
            }
            update(id, { reply: result.comment.reply });
            setReplyingTo(null);
            setReplyDraftState('');
            say('replied');
            setFocus({ id, at: Date.now(), part: 'reply' });
        } catch {
            setReplyError({ key: 'generic', at: Date.now() });
        } finally {
            setReplyPosting(false);
        }
    };

    return {
        comments,
        counts,
        sort,
        setSort,
        language,
        setLanguage,
        hasMore: next !== null,
        loadMore,
        loading,
        loadFailed,
        draft,
        setDraft: (value: string) => {
            setDraft(value);
            if (formError) setFormError(null);
        },
        lang,
        setLang,
        posting,
        formError,
        submit,
        busy,
        vote,
        report,
        remove,
        hide,
        replyingTo,
        openReply,
        cancelReply,
        replyDraft,
        setReplyDraft: (value: string) => {
            setReplyDraftState(value);
            if (replyError) setReplyError(null);
        },
        replyLang,
        setReplyLang,
        replyPosting,
        replyError,
        submitReply,
        notice,
        focus,
    };
}

export type DiscussionState = ReturnType<typeof useDiscussion>;
