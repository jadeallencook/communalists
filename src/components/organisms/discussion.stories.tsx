import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { CommentForm } from '@/components/molecules/comment-form';
import {
    longComment,
    repliedComment,
    sampleComments,
    teamRepliedComment,
} from '@/components/molecules/comment-fixtures';

import {
    Discussion,
    DiscussionListLoading,
    DiscussionUnavailable,
} from './discussion';

const form = (
    <CommentForm
        value=""
        onChange={fn()}
        lang="en"
        onLangChange={fn()}
        onSubmit={fn()}
    />
);
const signedOut = {
    status: 'signedOut',
    signUpHref: '/sign-up?next=%2Fdictionary%2Fmutual-aid%23discussion',
    signInHref: '/sign-in?next=%2Fdictionary%2Fmutual-aid%23discussion',
} as const;

const meta = {
    title: 'Components/Organisms/Discussion',
    component: Discussion,
    args: {
        viewer: { status: 'ready', moderator: false },
        counts: { all: 4, en: 3, es: 1, vi: 0, zh: 0 },
        comments: sampleComments,
        sort: 'top',
        onSortChange: fn(),
        readerLanguage: 'en',
        language: 'all',
        onLanguageChange: fn(),
        hasMore: false,
        onLoadMore: fn(),
        form,
        onVote: fn(),
        onReport: fn(),
        onDelete: fn(),
        onHide: fn(),
    },
    decorators: [
        (Story) => (
            <div className="mx-auto max-w-3xl px-4">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Discussion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Signed in, with the form, showing all languages (comments not in English are marked). */
export const SignedIn: Story = {};

/** The default for readers: comments in their language, with All languages beside it. */
export const ReaderLanguage: Story = {
    args: {
        language: 'en',
        comments: sampleComments.filter((c) => c.lang === 'en'),
    },
};

/** None in the reader's language yet, some in others: says so, with a way to see them. */
export const NoneInReaderLanguage: Story = {
    globals: { locale: 'vi' },
    args: { readerLanguage: 'vi', language: 'vi', comments: [] },
};

/** Signed out: the invitation to create an account, then the comments. */
export const SignedOut: Story = { args: { viewer: signedOut } };

/** Signed in, but setup isn't finished (no name yet). */
export const SetupNeeded: Story = {
    args: {
        viewer: {
            status: 'setupNeeded',
            setupHref: '/account/setup?next=%2Fdictionary%2Fmutual-aid',
        },
    },
};

/** No comments yet. */
export const Empty: Story = {
    args: {
        viewer: signedOut,
        counts: { all: 0, en: 0, es: 0, vi: 0, zh: 0 },
        comments: [],
    },
};

/** More than one page: Show more. */
const many = { all: 42, en: 30, es: 8, vi: 3, zh: 1 };
export const MoreToLoad: Story = { args: { counts: many, hasMore: true } };

export const LoadingMore: Story = {
    args: { counts: many, hasMore: true, loading: 'more' },
};

/** Loading more failed: the error is announced and the button offers to try again. */
export const LoadFailed: Story = {
    args: {
        counts: many,
        hasMore: true,
        loadFailed: true,
        notice: {
            tone: 'alert',
            text: "Couldn't load comments. Check your connection and try again.",
            at: 1,
        },
    },
};

/** Switching order. */
export const Sorting: Story = { args: { sort: 'newest', loading: 'sort' } };

/** After an action: the result is announced. */
export const Announced: Story = {
    args: {
        notice: { tone: 'status', text: 'Comment posted.', at: 1 },
    },
};

/** A super user: Hide and Delete on every comment, hidden text shown. */
export const Moderator: Story = {
    args: {
        viewer: { status: 'ready', moderator: true },
        comments: sampleComments.map((c) =>
            c.hidden ? { ...c, text: 'Buy cheap watches at example.com' } : c
        ),
    },
};

export const LongText: Story = {
    args: { comments: [longComment, ...sampleComments] },
};

export const Spanish: Story = {
    globals: { locale: 'es' },
    args: { viewer: signedOut, readerLanguage: 'es' },
};

export const Chinese: Story = {
    globals: { locale: 'zh' },
    args: { viewer: signedOut, readerLanguage: 'zh' },
};

/** The skeleton while the first page streams in. */
export const Loading: Story = {
    render: () => <DiscussionListLoading />,
};

/** The comments couldn't load (say, an index still building): the rest of the page is fine. */
export const Unavailable: Story = {
    render: () => <DiscussionUnavailable />,
};

// On an organization's page (decision #70): all languages first, its own
// intro, and the organization's replies.

const orgComments = [repliedComment, ...sampleComments.slice(0, 3)];

/** Signed out, on an organization's page: the reply sits under its comment. */
export const Organization: Story = {
    args: {
        about: 'organization',
        organizationName: 'South Bay Mutual Aid',
        viewer: {
            status: 'signedOut',
            signUpHref: '/sign-up?next=%2Forganization%2Fsbma%23discussion',
            signInHref: '/sign-in?next=%2Forganization%2Fsbma%23discussion',
        },
        comments: orgComments,
        counts: { all: 4, en: 3, es: 1, vi: 0, zh: 0 },
    },
};

/** One of its owners or moderators: Reply on the comments it hasn't answered, Delete on its reply. */
export const OrganizationReplier: Story = {
    args: {
        about: 'organization',
        organizationName: 'South Bay Mutual Aid',
        viewer: { status: 'ready', moderator: false, replier: true },
        comments: orgComments,
        onReplyOpen: fn(),
        onReplyDelete: fn(),
    },
};

/** An unclaimed page: replies from the Communalists team. */
export const OrganizationUnclaimed: Story = {
    args: {
        about: 'organization',
        organizationName: 'Alum Rock Food Pantry',
        comments: [teamRepliedComment],
        counts: { all: 1, en: 1, es: 0, vi: 0, zh: 0 },
    },
};

/** No comments yet on an organization. */
export const OrganizationEmpty: Story = {
    args: {
        about: 'organization',
        organizationName: 'South Bay Mutual Aid',
        comments: [],
        counts: { all: 0, en: 0, es: 0, vi: 0, zh: 0 },
    },
};
