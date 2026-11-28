'use client';

import { useFormatter, useTranslations } from 'next-intl';

import { CommentForm } from '@/components/molecules/comment-form';
import {
    Discussion,
    type DiscussionViewer,
} from '@/components/organisms/discussion';
import {
    useDiscussion,
    type DiscussionActions,
    type DiscussionProblem,
} from '@/hooks/use-discussion';
import { track } from '@/lib/analytics';
import {
    COMMENT_MAX,
    type CommentTarget,
    type CommentView,
} from '@/lib/comments';

import {
    deleteCommentAction,
    hideCommentAction,
    postCommentAction,
    reportCommentAction,
    voteCommentAction,
} from '../../actions/comments';
import type { CommentsPage } from '../../api/comments/[kind]/[id]/route';

/** Connects the Discussion to the comment actions and the page loader. */
export function DiscussionClient({
    target,
    viewer,
    initial,
    count,
    defaultLang,
}: {
    target: CommentTarget;
    viewer: DiscussionViewer;
    initial: { comments: CommentView[]; next: string | null };
    count: number;
    defaultLang: string;
}) {
    const t = useTranslations('Discussion');
    const format = useFormatter();
    const actions: DiscussionActions = {
        load: async (sort, after) => {
            const query = new URLSearchParams({ sort });
            if (after) query.set('after', after);
            const response = await fetch(
                `/api/comments/${target.kind}/${target.id}?${query}`
            );
            if (!response.ok) throw new Error(`comments ${response.status}`);
            return (await response.json()) as CommentsPage;
        },
        post: (input) => postCommentAction(target, input),
        vote: (id, up) => voteCommentAction(target, id, up),
        report: (id, reason) => reportCommentAction(target, id, reason),
        remove: (id) => deleteCommentAction(target, id),
        hide: (id, hidden) => hideCommentAction(target, id, hidden),
    };
    const state = useDiscussion({
        initial,
        count,
        defaultLang,
        actions,
    });

    const time = (at?: number) =>
        at ? format.dateTime(new Date(at), { timeStyle: 'short' }) : '';
    const errorText = (key: DiscussionProblem, retryAt?: number) =>
        t(`errors.${key}`, { max: COMMENT_MAX, time: time(retryAt) });
    const notice = state.notice && {
        tone: state.notice.tone,
        at: state.notice.at,
        text:
            state.notice.tone === 'alert'
                ? errorText(state.notice.key)
                : t(`announce.${state.notice.key}`, state.notice.values ?? {}),
    };
    const data = { on: target.kind, id: target.id };

    return (
        <Discussion
            viewer={viewer}
            count={state.count}
            comments={state.comments}
            sort={state.sort}
            onSortChange={state.setSort}
            hasMore={state.hasMore}
            onLoadMore={state.loadMore}
            loading={state.loading}
            loadFailed={state.loadFailed}
            busy={state.busy}
            onVote={state.vote}
            onReport={state.report}
            onDelete={state.remove}
            onHide={state.hide}
            notice={notice}
            focus={state.focus}
            joinProps={{
                signUp: track('discussion-join', { ...data, to: 'sign-up' }),
                signIn: track('discussion-join', { ...data, to: 'sign-in' }),
            }}
            form={
                <CommentForm
                    value={state.draft}
                    onChange={state.setDraft}
                    lang={state.lang}
                    onLangChange={state.setLang}
                    onSubmit={state.submit}
                    posting={state.posting}
                    error={
                        state.formError
                            ? errorText(
                                  state.formError.key,
                                  state.formError.retryAt
                              )
                            : undefined
                    }
                    errorKey={state.formError?.at}
                    submitProps={track('comment-post', data)}
                />
            }
        />
    );
}
