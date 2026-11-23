import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { ReasonDialog } from './reason-dialog';

const meta = {
    title: 'Components/Molecules/Reason Dialog',
    component: ReasonDialog,
    args: {
        triggerLabel: 'Ban',
        title: 'Ban Marcus Johnson?',
        description:
            "They'll stop being a member and can't ask to join again unless you unban them.",
        confirmLabel: 'Ban',
        fields: { orgId: 'org1', uid: 'marcus', action: 'ban' },
        formAction: fn(),
        maxLength: 500,
    },
} satisfies Meta<typeof ReasonDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed: just the button. */
export const Closed: Story = {};
/** Open, asking for the reason. */
export const Open: Story = { args: { defaultOpen: true } };
