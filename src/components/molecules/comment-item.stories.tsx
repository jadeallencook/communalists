import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { CommentItem } from './comment-item';
import {
    allowed,
    formerMemberComment,
    longComment,
    sampleComments,
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
