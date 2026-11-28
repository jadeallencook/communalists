import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { ComradeButton } from './comrade-button';

const meta = {
    title: 'Components/Molecules/Comrade Button',
    component: ComradeButton,
    args: {
        state: 'none',
        uid: 'seed-maya',
        name: 'Maya Thompson',
        next: '/comrade/maya-thompson',
        locale: 'en',
        formAction: fn(),
        onConfirmingRemoveChange: fn(),
    },
    decorators: [
        // Like the profile header: the name, then the action beside it (under
        // it on phones).
        (Story) => (
            <div className="flex max-w-2xl flex-wrap items-center gap-x-6 gap-y-4">
                <div className="min-w-0 flex-1">
                    <p className="font-heading text-2xl font-semibold">
                        Maya Thompson
                    </p>
                    <p className="text-sm text-muted-foreground">
                        @maya-thompson
                    </p>
                </div>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ComradeButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Signed in, not comrades yet. */
export const AddComrade: Story = {};
export const SignedOut: Story = { args: { state: 'signedOut' } };
/** Just sent: the change is announced, and the menu now takes it back. */
export const RequestSent: Story = {
    args: { state: 'sent', notice: 'Request sent.' },
};
/** They asked first: a strip under the name, since it needs an answer. */
export const Received: Story = { args: { state: 'received' } };
export const Comrades: Story = { args: { state: 'comrades' } };
/** "Remove comrade" in the Comrades menu asks first, in a dialog. */
export const ConfirmRemove: Story = {
    args: { state: 'comrades', confirmingRemove: true },
};
export const Pending: Story = { args: { pending: true } };
/** Their setting changed since the page loaded. */
export const Closed: Story = {
    args: { error: "Maya Thompson isn't taking comrade requests." },
};
export const Limit: Story = {
    args: {
        error: 'You have 50 requests waiting for an answer. Cancel some, or wait for answers, before sending more.',
    },
};
/** Whether they're comrades couldn't be loaded: a message, no button. */
export const LoadFailed: Story = { args: { loadFailed: true } };
/** Just removed: back to Add comrade, with the result under the header. */
export const JustRemoved: Story = { args: { notice: 'Comrade removed.' } };
