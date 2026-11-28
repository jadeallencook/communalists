'use client';

import { useState } from 'react';

import {
    charactersLeft,
    mergePages,
    type CommentErrorKey,
    type CommentSort,
    type CommentView,
    type ReportReason,
} from '@/lib/comments';

// The discussion under a word (and, later, an organization): the list, its
// order, loading more, posting, voting, reporting and moderating. The server
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
    | 'invalid'
    | 'generic';

type Failure = { ok: false; error: DiscussionError };

export interface DiscussionActions {
    /** A page of comments: the first one in `sort` order, or the one after `after`. */
    load: (
        sort: CommentSort,
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
        reason: ReportReason
    ) => Promise<{ ok: true; already: boolean } | Failure>;
    remove: (id: string) => Promise<{ ok: true } | Failure>;
    hide: (id: string, hidden: boolean) => Promise<{ ok: true } | Failure>;
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
    | 'sortedTop'
    | 'sortedNewest'
    | 'loaded';

/** Problems, under Discussion.errors. */
export type DiscussionProblem =
    DiscussionError | CommentErrorKey | 'loadFailed';

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
    count: number;
    /** The form's language to start with: the UI language. */
    defaultLang: string;
    actions: DiscussionActions;
}

export function useDiscussion({
    initial,
    count: initialCount,
    defaultLang,
    actions,
}: UseDiscussionOptions) {
    const [comments, setComments] = useState(initial.comments);
    const [next, setNext] = useState(initial.next);
    const [count, setCount] = useState(initialCount);
    const [sort, setSortState] = useState<CommentSort>('top');
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
    const [focus, setFocus] = useState<{
        id: string | null;
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

    const setSort = async (to: CommentSort) => {
        if (to === sort || loading) return;
        setLoading('sort');
        try {
            const page = await actions.load(to, null);
            setSortState(to);
            setComments(page.comments);
            setNext(page.next);
            setLoadFailed(false);
            say(to === 'top' ? 'sortedTop' : 'sortedNewest');
        } catch {
            // The list and its order stay as they were.
            failed('loadFailed');
        } finally {
            setLoading(null);
        }
    };

    const loadMore = async () => {
        if (!next || loading) return;
        setLoading('more');
        setLoadFailed(false);
        try {
            const page = await actions.load(sort, next);
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
            setCount((n) => n + 1);
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

    const report = (id: string, reason: ReportReason) =>
        withBusy(id, async () => {
            try {
                const result = await actions.report(id, reason);
                if (!result.ok) return failed(result.error);
                // Focus stays on Report (the dialog gives it back); the
                // result is announced.
                say(result.already ? 'alreadyReported' : 'reported');
            } catch {
                failed('generic');
            }
        });

    const remove = (id: string) =>
        withBusy(id, async () => {
            try {
                const result = await actions.remove(id);
                if (!result.ok && result.error !== 'notFound')
                    return failed(result.error);
                // Gone either way. Focus goes to the announcement (the
                // comment it was on no longer exists).
                setComments((list) => list.filter((c) => c.id !== id));
                setCount((n) => Math.max(0, n - 1));
                say('deleted');
                setFocus({ id: null, at: Date.now() });
            } catch {
                failed('generic');
            }
        });

    const hide = (id: string, hidden: boolean) =>
        withBusy(id, async () => {
            try {
                const result = await actions.hide(id, hidden);
                if (!result.ok) return failed(result.error);
                update(id, { hidden });
                say(hidden ? 'hidden' : 'unhidden');
                setFocus({ id, at: Date.now() });
            } catch {
                failed('generic');
            }
        });

    return {
        comments,
        count,
        sort,
        setSort,
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
        notice,
        focus,
    };
}

export type DiscussionState = ReturnType<typeof useDiscussion>;
