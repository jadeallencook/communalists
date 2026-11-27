import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { CopyLinkButton } from './copy-link-button';

const meta = {
    title: 'Components/Molecules/Copy Link Button',
    component: CopyLinkButton,
    args: {
        url: 'https://communalists.com/en/dictionary/mutual-aid',
        status: 'idle',
        onCopy: fn(),
        labels: {
            copy: 'Copy link',
            copied: 'Link copied.',
            failed: "Couldn't copy. Here's the link:",
        },
    },
} satisfies Meta<typeof CopyLinkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};
export const Copied: Story = { args: { status: 'copied' } };
/** No clipboard access: the link is shown to copy by hand. */
export const Failed: Story = { args: { status: 'failed' } };
