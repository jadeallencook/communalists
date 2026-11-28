import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SAMPLE_PHOTO } from './photo-fixtures';
import { fn } from 'storybook/test';

import { CommentForm } from './comment-form';
import { CommentItem } from './comment-item';
import {
    allowed,
    allowedOnOrganization,
    formerMemberComment,
    longComment,
    repliedComment,
    sampleComments,
    teamRepliedComment,
} from './comment-fixtures';

const [voted, spanish, mine, hidden] = sampleComments;

const meta = {
    title: 'Components/Molecules/CommentItem',
    component: CommentItem,
    args: {
        comment: voted,
        can: allowed.member,
        onVote: fn(),
        onReport: fn(),
        onDelete: fn(),
        onHide: fn(),
    },
    decorators: [
        (Story) => (
            <div className="max-w-2xl">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof CommentItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Signed in: up voted already (the button is pressed), and Report. */
export const SignedIn: Story = {};

/** Signed out: the count, nothing to press. */
export const SignedOut: Story = { args: { can: allowed.reader } };

/** The viewer's own comment: Delete (asks first), no voting or reporting. */
export const Mine: Story = { args: { comment: mine, can: allowed.author } };

/**
 * Written in Spanish, read by an English reader: marked "Español", and the
 * text has `lang="es"` so screen readers switch voice.
 */
export const OtherLanguage: Story = {
    args: { comment: spanish, languageName: 'Español' },
};

/** Hidden by a moderator, as everyone else sees it. */
export const Hidden: Story = { args: { comment: hidden, can: allowed.reader } };

/** A super user: Hide and Delete on anyone's comment. */
export const Moderator: Story = { args: { can: allowed.moderator } };

/** A super user looking at a hidden comment: its text, and Show again. */
export const ModeratorHidden: Story = {
    args: {
        comment: { ...hidden, text: 'Buy cheap watches at example.com' },
        can: allowed.moderatorHidden,
    },
};

/** The author's account is gone. */
export const FormerMember: Story = { args: { comment: formerMemberComment } };

/** A request on its way: buttons wait. */
export const Busy: Story = { args: { busy: true } };

/** Long name, long words and many votes: check wrapping at 320px and 200% zoom. */
export const LongText: Story = { args: { comment: longComment } };

export const Vietnamese: Story = { globals: { locale: 'vi' } };

// On an organization's page (decision #70).

/** The organization's reply, under the comment: "Reply from South Bay Mutual Aid". Others can report it. */
export const WithReply: Story = {
    args: {
        comment: repliedComment,
        organizationName: 'South Bay Mutual Aid',
        can: allowedOnOrganization.memberAnswered,
        onReplyReport: fn(),
    },
};

/** Written by a super user while the page was unclaimed: from the Communalists team. */
export const TeamReply: Story = {
    args: {
        comment: teamRepliedComment,
        organizationName: 'Alum Rock Food Pantry',
        can: allowed.reader,
    },
};

/** An owner or moderator: Reply on a comment the organization hasn't answered. */
export const CanReply: Story = {
    args: {
        organizationName: 'South Bay Mutual Aid',
        can: allowedOnOrganization.replier,
        replier: true,
        onReplyOpen: fn(),
    },
};

/** The reply form open under the comment, where the Reply button was. */
export const Replying: Story = {
    args: {
        organizationName: 'South Bay Mutual Aid',
        can: allowedOnOrganization.replier,
        replier: true,
        replyForm: (
            <CommentForm
                idPrefix="reply"
                reply={{ from: 'South Bay Mutual Aid', onCancel: fn() }}
                value=""
                onChange={fn()}
                lang="en"
                onLangChange={fn()}
                onSubmit={fn()}
            />
        ),
    },
};

/** An owner or moderator looking at their organization's reply: Delete (asks first). */
export const OwnReply: Story = {
    args: {
        comment: repliedComment,
        organizationName: 'South Bay Mutual Aid',
        can: allowedOnOrganization.replierAnswered,
        replier: true,
        onReplyDelete: fn(),
    },
};

/** A super user: Hide and Delete on the reply as well as the comment. */
export const ModeratorReply: Story = {
    args: {
        comment: repliedComment,
        organizationName: 'South Bay Mutual Aid',
        can: allowedOnOrganization.moderatorAnswered,
        onReplyHide: fn(),
        onReplyDelete: fn(),
    },
};

/** A hidden reply, as a super user sees it: its text, and Show again. */
export const ModeratorReplyHidden: Story = {
    args: {
        comment: {
            ...repliedComment,
            reply: { ...repliedComment.reply!, hidden: true },
        },
        organizationName: 'South Bay Mutual Aid',
        can: allowedOnOrganization.moderatorReplyHidden,
    },
};

/** A hidden reply, as everyone else sees it. */
export const ReplyHidden: Story = {
    args: {
        comment: {
            ...repliedComment,
            reply: { ...repliedComment.reply!, hidden: true, text: null },
        },
        organizationName: 'South Bay Mutual Aid',
        can: allowed.member,
    },
};

/** The author's photo, when their visibility lets this viewer see it. */
export const WithPhoto: Story = {
    args: {
        comment: {
            ...voted,
            author: voted.author && { ...voted.author, photo: SAMPLE_PHOTO },
        },
    },
};
