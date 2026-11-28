import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { CopyLinkButton } from '@/components/molecules/copy-link-button';

import { useCopyLink } from './use-copy-link';

const labels = {
    copy: 'Copy link',
    copied: 'Link copied.',
    failed: "Couldn't copy. Here's the link:",
};
const url = 'https://communalists.com/en/dictionary/mutual-aid';
const works = () => Promise.resolve();
const refuses = () => Promise.reject(new Error('Not allowed'));

function Demo({ fails }: { fails: boolean }) {
    const { status, onCopy } = useCopyLink(url, fails ? refuses : works);
    return (
        <div className="flex flex-col gap-4">
            <CopyLinkButton
                url={url}
                status={status}
                onCopy={onCopy}
                labels={labels}
            />
            <pre className="rounded-lg bg-muted p-4 text-xs">
                status: {status}
            </pre>
        </div>
    );
}

const meta = {
    title: 'Hooks/useCopyLink',
    component: Demo,
    args: { fails: false },
    parameters: {
        docs: {
            description: {
                component:
                    'Copies a link and reports `copied` or `failed`, then goes back to `idle` after 5 seconds. This demo fakes the clipboard.',
            },
        },
    },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Copies: Story = {};
/** The browser refuses the clipboard: the link is shown instead. */
export const ClipboardRefused: Story = { args: { fails: true } };
