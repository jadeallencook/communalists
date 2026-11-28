import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { EndorsePanel } from './endorse-panel';

const meta = {
    title: 'Components/Molecules/Endorse Panel',
    component: EndorsePanel,
    args: {
        state: 'endorse',
        count: 24,
        orgId: 'sbma',
        handle: 'sbma',
        locale: 'en',
        formAction: fn(),
    },
    decorators: [
        (Story) => (
            <div className="max-w-72 rounded-lg border p-4">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof EndorsePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Signed in, not endorsing yet (members and visitors alike). */
export const Endorse: Story = {};
/** Nobody has endorsed it yet. */
export const NoneYet: Story = { args: { count: 0 } };
export const One: Story = { args: { count: 1 } };
export const SignedOut: Story = { args: { state: 'signedOut' } };
/** Just endorsed: the button now takes it back, and the change is announced. */
export const Endorsed: Story = {
    args: {
        state: 'endorsed',
        count: 25,
        notice: "Endorsed. It's on your profile now.",
    },
};
export const Pending: Story = { args: { pending: true } };
export const Error: Story = {
    args: { error: 'Something went wrong. Try again.' },
};
/** Whether they endorse it couldn't be loaded: the count, a message, no button. */
export const LoadFailed: Story = { args: { loadFailed: true } };
