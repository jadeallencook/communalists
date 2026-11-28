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
import { localeNames, type Locale } from '@/i18n/routing';
import {
    COMMENT_MAX,
    type CommentCounts,
    type CommentLang,
    type CommentLanguageFilter,
    type CommentTarget,
    type CommentView,
} from '@/lib/comments';

import {
    deleteCommentAction,
    hideCommentAction,
    postCommentAction,
    replyCommentAction,
    reportCommentAction,
    voteCommentAction,
} from '../../actions/comments';
import type { CommentsPage } from '../../api/comments/[kind]/[id]/route';

/** The reply form's own wording for an empty or too-long reply. */
const replyProblem = (key: DiscussionProblem): DiscussionProblem =>
    key === 'textRequired'
        ? 'replyTextRequired'
        : key === 'textTooLong'
          ? 'replyTextTooLong'
          : key;

/** Connects the Discussion to the comment actions and the page loader. */
export function DiscussionClient({
    target,
    viewer,
    initial,
    counts,
    language,
    defaultLang,
    organizationName,
    replyAsTeam = false,
}: {
    target: CommentTarget;
    viewer: DiscussionViewer;
    initial: { comments: CommentView[]; next: string | null };
    counts: CommentCounts;
    /** The first page's language: the reader's, or all (moderators). */
    language: CommentLanguageFilter;
    /** The UI language: the reader's language and the form's default. */
    defaultLang: CommentLang;
    /** On an organization's page: its name, for its replies. */
    organizationName?: string;
    /** Replies written now are from the Communalists team (an unclaimed page). */
    replyAsTeam?: boolean;
}) {
    const t = useTranslations('Discussion');
    const format = useFormatter();
    const actions: DiscussionActions = {
        load: async (sort, lang, after) => {
            const query = new URLSearchParams({ sort, lang });
            if (after) query.set('after', after);
            const response = await fetch(
                `/api/comments/${target.kind}/${target.id}?${query}`
            );
            if (!response.ok) throw new Error(`comments ${response.status}`);
            return (await response.json()) as CommentsPage;
        },
        post: (input) => postCommentAction(target, input),
        vote: (id, up) => voteCommentAction(target, id, up),
        report: (id, reason, part) =>
            reportCommentAction(target, id, reason, part),
        remove: (id, part) => deleteCommentAction(target, id, part),
        hide: (id, hidden, part) => hideCommentAction(target, id, hidden, part),
        reply: (id, input) => replyCommentAction(target, id, input),
    };
    const state = useDiscussion({
        initial,
        counts,
        language,
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
                : t(`announce.${state.notice.key}`, {
                      ...state.notice.values,
                      // A language code in an announcement reads as its name.
                      language:
                          localeNames[
                              state.notice.values?.language as Locale
                          ] ?? '',
                  }),
    };
    const data = { on: target.kind, id: target.id };
    const replyingTo = state.comments.find((c) => c.id === state.replyingTo);
    // Who the reply is shown as from. On an unclaimed page, super users
    // reply as the team.
    const replyFrom = replyAsTeam ? t('teamName') : (organizationName ?? '');

    return (
        <Discussion
            viewer={viewer}
            about={target.kind}
            organizationName={organizationName}
            replyingTo={state.replyingTo}
            onReplyOpen={state.openReply}
            onReplyReport={(id, reason) => state.report(id, reason, 'reply')}
            onReplyDelete={(id) => state.remove(id, 'reply')}
            onReplyHide={(id, hidden) => state.hide(id, hidden, 'reply')}
            replyForm={
                replyingTo && (
                    <CommentForm
                        idPrefix="reply"
                        reply={{ from: replyFrom, onCancel: state.cancelReply }}
                        value={state.replyDraft}
                        onChange={state.setReplyDraft}
                        lang={state.replyLang}
                        onLangChange={state.setReplyLang}
                        onSubmit={state.submitReply}
                        posting={state.replyPosting}
                        error={
                            state.replyError
                                ? errorText(replyProblem(state.replyError.key))
                                : undefined
                        }
                        errorKey={state.replyError?.at}
                        submitProps={track('comment-reply', data)}
                    />
                )
            }
            counts={state.counts}
            readerLanguage={defaultLang}
            language={state.language}
            onLanguageChange={state.setLanguage}
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
