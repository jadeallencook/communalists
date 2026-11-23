import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { MemberList } from './member-list';

const leaders = [
    { uid: 'maya', displayName: 'Maya Thompson', role: 'owner' as const },
    { uid: 'thanh', displayName: 'Thanh Nguyễn', role: 'moderator' as const },
];
const everyone = [
    ...leaders,
    { uid: 'luis', displayName: 'Luis Hernández', role: 'member' as const },
    { uid: 'rosa', displayName: 'Rosa Martínez', role: 'member' as const },
    {
        uid: 'long',
        displayName: 'Maria de los Ángeles Fernández-Villanueva',
        role: 'member' as const,
    },
];

const meta = {
    title: 'Components/Organisms/Member List',
    component: MemberList,
    args: { people: everyone, total: 5, setting: 'public' },
} satisfies Meta<typeof MemberList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** "Everyone": every name, to anyone. */
export const Public: Story = {};
/** "Members only", seen by a non-member: leaders, the count, and why. */
export const MembersOnlyToVisitor: Story = {
    args: { people: leaders, setting: 'members' },
};
/** "Members only", seen by a member: everyone. */
export const MembersOnlyToMember: Story = {
    args: { setting: 'members', viewerIsMember: true },
};
/** "Just the count". */
export const CountOnly: Story = {
    args: { people: leaders, setting: 'hidden', viewerIsMember: true },
};
/** A new group: just the owner. */
export const OnlyOwner: Story = {
    args: { people: leaders.slice(0, 1), total: 1 },
};
