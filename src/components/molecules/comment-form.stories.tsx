import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

import { COMMENT_MAX } from '@/lib/comments';

import { CommentForm, type CommentFormProps } from './comment-form';

/** Keeps the text and language in state, like the discussion does. */
function Controlled(props: CommentFormProps) {
    const [value, setValue] = useState(props.value);
    const [lang, setLang] = useState(props.lang);
    return (
        <CommentForm
            {...props}
            value={value}
            onChange={setValue}
            lang={lang}
            onLangChange={setLang}
        />
    );
}

const meta = {
    title: 'Components/Molecules/CommentForm',
    component: CommentForm,
    render: (args) => <Controlled {...args} />,
    args: {
        value: '',
        lang: 'en',
        onChange: fn(),
        onLangChange: fn(),
        onSubmit: fn(),
    },
    decorators: [
        (Story) => (
            <div className="max-w-2xl">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof CommentForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Typing: Story = {
    args: { value: 'Maybe the short definition could say “neighbors”?' },
};

export const Posting: Story = {
    args: { value: 'Maybe say “neighbors”?', posting: true },
};

/** Nothing written: the error is announced and linked to the field. */
export const NothingWritten: Story = {
    args: { error: 'Write your comment first.', errorKey: 1 },
};

/** Over the limit: the counter turns red and says by how much. */
export const TooLong: Story = {
    args: {
        value: 'a'.repeat(COMMENT_MAX + 12),
        error: `Shorten your comment to ${COMMENT_MAX} characters or fewer.`,
    },
};

/** Five comments in the last hour. */
export const RateLimited: Story = {
    args: {
        value: 'One more thought…',
        error: "You've posted 5 comments in the last hour, the most allowed. You can post again at 3:42 PM.",
    },
};

/** The language defaults to the UI language. */
export const Spanish: Story = {
    globals: { locale: 'es' },
    args: { lang: 'es' },
};
