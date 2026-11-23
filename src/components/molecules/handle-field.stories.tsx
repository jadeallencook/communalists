import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { HandleField } from './handle-field';

const meta = {
    title: 'Components/Molecules/Handle Field',
    component: HandleField,
    args: {
        value: 'south-bay-mutual-aid',
        onChange: fn(),
        status: { state: 'available' },
    },
    decorators: [
        (Story) => (
            <div className="max-w-xl">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof HandleField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Available: Story = {};
export const Checking: Story = { args: { status: { state: 'checking' } } };
export const Empty: Story = { args: { value: '', status: { state: 'empty' } } };
export const Taken: Story = {
    args: { value: 'sbma', status: { state: 'unavailable', reason: 'taken' } },
};
export const Reserved: Story = {
    args: {
        value: 'dashboard',
        status: { state: 'unavailable', reason: 'reserved' },
    },
};
export const BadFormat: Story = {
    args: {
        value: 'south_bay',
        status: { state: 'unavailable', reason: 'format' },
    },
};
/** The server said taken on submit (someone claimed it first). */
export const TakenOnSubmit: Story = {
    args: { error: 'That handle is taken. Try another.' },
};
/** Editing: unchanged from the organization's current handle. */
export const Current: Story = {
    args: { value: 'sbma', status: { state: 'current' } },
};
/** Editing as a moderator (or within 30 days of a change): read-only, with why. */
export const Locked: Story = {
    args: {
        value: 'sbma',
        status: { state: 'current' },
        lockedReason: 'Only owners can change the handle.',
    },
};
/** A person's username (account setup and settings). */
export const Username: Story = {
    args: {
        kind: 'username',
        value: 'maya-thompson',
        status: { state: 'available' },
    },
};
