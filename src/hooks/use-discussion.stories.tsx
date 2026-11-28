import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useTranslations } from 'next-intl';

import { CommentForm } from '@/components/molecules/comment-form';
import { sampleComments } from '@/components/molecules/comment-fixtures';
import { Discussion } from '@/components/organisms/discussion';
import { localeNames, type Locale } from '@/i18n/routing';
import type { CommentView } from '@/lib/comments';

import {
    useDiscussion,
    type DiscussionActions,
    type DiscussionProblem,
} from './use-discussion';

const wait = () => new Promise((resolve) => setTimeout(resolve, 400));

/** A fake server: everything works, unless `fails` says otherwise. */
function fakeActions(fails: boolean): DiscussionActions {
    const more: CommentView[] = sampleComments.map((c) => ({
        ...c,
        id: `${c.id}-older`,
        at: c.at - 30 * 24 * 60 * 60 * 1000,
        mine: false,
    }));
    return {
        load: async (sort, language, after) => {
            await wait();
            if (fails) throw new Error('offline');
            const inLanguage = (c: CommentView) =>
                language === 'all' || c.lang === language;
            if (after) return { comments: more.filter(inLanguage), next: null };
            const list = sampleComments.filter(inLanguage);
            if (sort === 'newest') list.sort((a, b) => b.at - a.at);
            return { comments: list, next: 'more' };
        },
        post: async ({ text, lang }) => {
            await wait();
            if (fails)
                return {
                    ok: false,
                    error: 'rateLimited',
                    retryAt: Date.now() + 20 * 60 * 1000,
                };
            return {
                ok: true,
                comment: {
                    id: `new-${Date.now()}`,
                    text,
                    lang: lang as CommentView['lang'],
                    at: Date.now(),
                    votes: 0,
                    hidden: false,
                    author: { name: 'Sam Rivera', username: 'sam-rivera' },
                    mine: true,
                    voted: false,
                    reply: null,
                },
            };
        },
        vote: async (id, up) => {
            await wait();
            if (fails) return { ok: false, error: 'generic' };
            const votes = sampleComments.find((c) => c.id === id)?.votes ?? 0;
            return { ok: true, voted: up, votes: votes + (up ? 1 : 0) };
        },
        report: async () => {
            await wait();
            return fails
                ? { ok: false, error: 'generic' }
                : { ok: true, already: false };
        },
        remove: async () => {
            await wait();
            return fails ? { ok: false, error: 'generic' } : { ok: true };
        },
        hide: async () => {
            await wait();
            return fails ? { ok: false, error: 'notAllowed' } : { ok: true };
        },
        reply: async (id, { text, lang }) => {
            await wait();
            if (fails) return { ok: false, error: 'alreadyReplied' };
            const comment = sampleComments.find((c) => c.id === id)!;
            return {
                ok: true,
                comment: {
                    ...comment,
                    reply: {
                        text,
                        lang: lang as CommentView['lang'],
                        at: Date.now(),
                        from: 'organization',
                        hidden: false,
                    },
                },
            };
        },
    };
}

function Demo({
    fails,
    moderator,
    organization = false,
}: {
    fails: boolean;
    moderator: boolean;
    /** On an organization's page, as one of its owners or moderators: Reply. */
    organization?: boolean;
}) {
    const t = useTranslations('Discussion');
    const state = useDiscussion({
        initial: {
            comments: sampleComments.filter((c) => c.lang === 'en'),
            next: 'more',
        },
        counts: { all: 8, en: 6, es: 2, vi: 0, zh: 0 },
        language: organization ? 'all' : 'en',
        defaultLang: 'en',
        actions: fakeActions(fails),
    });
    const errorText = (key: DiscussionProblem, retryAt?: number) =>
        t(`errors.${key}`, {
            max: 2000,
            time: retryAt ? new Date(retryAt).toLocaleTimeString() : '',
        });
    return (
        <div className="mx-auto max-w-3xl px-4">
            <Discussion
                viewer={{ status: 'ready', moderator, replier: organization }}
                about={organization ? 'organization' : 'definition'}
                organizationName="South Bay Mutual Aid"
                replyingTo={state.replyingTo}
                onReplyOpen={state.openReply}
                onReplyReport={(id, reason) =>
                    state.report(id, reason, 'reply')
                }
                onReplyDelete={(id) => state.remove(id, 'reply')}
                onReplyHide={(id, hidden) => state.hide(id, hidden, 'reply')}
                replyForm={
                    <CommentForm
                        idPrefix="reply"
                        reply={{
                            from: 'South Bay Mutual Aid',
                            onCancel: state.cancelReply,
                        }}
                        value={state.replyDraft}
                        onChange={state.setReplyDraft}
                        lang={state.replyLang}
                        onLangChange={state.setReplyLang}
                        onSubmit={state.submitReply}
                        posting={state.replyPosting}
                        error={
                            state.replyError
                                ? errorText(state.replyError.key)
                                : undefined
                        }
                        errorKey={state.replyError?.at}
                    />
                }
                counts={state.counts}
                readerLanguage="en"
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
                onReport={(id, reason) => state.report(id, reason)}
                onDelete={(id) => state.remove(id)}
                onHide={(id, hidden) => state.hide(id, hidden)}
                focus={state.focus}
                notice={
                    state.notice && {
                        tone: state.notice.tone,
                        at: state.notice.at,
                        text:
                            state.notice.tone === 'alert'
                                ? errorText(state.notice.key)
                                : t(`announce.${state.notice.key}`, {
                                      ...state.notice.values,
                                      language:
                                          localeNames[
                                              state.notice.values
                                                  ?.language as Locale
                                          ] ?? '',
                                  }),
                    }
                }
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
                    />
                }
            />
        </div>
    );
}

const meta = {
    title: 'Hooks/useDiscussion',
    component: Demo,
    args: { fails: false, moderator: false },
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'The discussion’s state: the list and its order, Show more, posting, up votes (shown at once, put back if the server refuses), reports, deleting and hiding. Results are announced, and focus moves to the new or acted-on comment (or to the announcement after deleting). This demo fakes the server.',
            },
        },
    },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Try posting, voting, sorting, Show more and deleting your own comment. */
export const Works: Story = {};

/** Every request fails: votes are put back, posting is rate limited, errors are announced. */
export const ServerRefuses: Story = { args: { fails: true } };

/** As a super user: Hide, Show again and Delete. */
export const Moderator: Story = { args: { moderator: true } };

/**
 * On an organization's page, as one of its owners or moderators: Reply opens
 * the form under the comment (focus in the text box); Post reply shows it as
 * from the organization and moves focus to it; Cancel goes back to Reply.
 */
export const OrganizationReplies: Story = { args: { organization: true } };

/** Replying fails: "This comment already has a reply." in the form. */
export const OrganizationReplyRefused: Story = {
    args: { organization: true, fails: true },
};
