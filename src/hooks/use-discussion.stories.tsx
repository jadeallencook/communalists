import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useTranslations } from 'next-intl';

import { CommentForm } from '@/components/molecules/comment-form';
import { sampleComments } from '@/components/molecules/comment-fixtures';
import { Discussion } from '@/components/organisms/discussion';
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
        load: async (sort, after) => {
            await wait();
            if (fails) throw new Error('offline');
            if (after) return { comments: more, next: null };
            const list = [...sampleComments];
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
    };
}

function Demo({ fails, moderator }: { fails: boolean; moderator: boolean }) {
    const t = useTranslations('Discussion');
    const state = useDiscussion({
        initial: { comments: sampleComments, next: 'more' },
        count: 8,
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
                viewer={{ status: 'ready', moderator }}
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
                focus={state.focus}
                notice={
                    state.notice && {
                        tone: state.notice.tone,
                        at: state.notice.at,
                        text:
                            state.notice.tone === 'alert'
                                ? errorText(state.notice.key)
                                : t(
                                      `announce.${state.notice.key}`,
                                      state.notice.values ?? {}
                                  ),
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
