import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { JoinPanel } from './join-panel';

const meta = {
    title: 'Components/Organisms/Join Panel',
    component: JoinPanel,
    args: {
        state: 'request',
        orgId: 'org1',
        handle: 'sbma',
        name: 'South Bay Mutual Aid',
        locale: 'en',
        formAction: fn(),
    },
} satisfies Meta<typeof JoinPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = { args: { state: 'signedOut' } };
/** Open groups: joining is instant. */
export const Join: Story = { args: { state: 'join' } };
/** Groups that take requests. */
export const AskToJoin: Story = {};
export const RequestSent: Story = {
    args: { state: 'pending', notice: 'Request sent.' },
};
export const InviteOnly: Story = { args: { state: 'inviteOnly' } };
export const Banned: Story = { args: { state: 'banned' } };
/** Members can leave; it asks first. */
export const Member: Story = { args: { state: 'member' } };
export const JustJoined: Story = {
    args: { state: 'member', notice: "You're in. Welcome!" },
};
export const Error: Story = {
    args: { error: 'Something went wrong. Try again.' },
};
export const Pending: Story = { args: { pending: true } };
