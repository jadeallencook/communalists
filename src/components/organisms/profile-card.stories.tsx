import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ProfileCard } from './profile-card';
import { privateView, publicView, selfView } from './profile-fixtures';

const meta = {
    title: 'Components/Organisms/Profile Card',
    component: ProfileCard,
    args: { view: publicView },
    decorators: [
        (Story) => (
            <div className="max-w-2xl">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ProfileCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A public profile seen by a visitor: the unlisted group isn't listed. */
export const Public: Story = {};
/** Her own view: every group, including the unlisted one. */
export const Self: Story = { args: { view: selfView } };
/** "Just my name": the rest is private. */
export const JustTheName: Story = { args: { view: privateView } };
/** Shared, but nothing filled in yet. */
export const NothingShared: Story = {
    args: {
        view: {
            name: 'Daniel Park',
            username: 'daniel-park',
            details: { languages: [], socials: [], groups: [] },
        },
    },
};
export const LongName: Story = {
    args: {
        view: {
            ...publicView,
            name: 'Maria de los Ángeles Fernández-Villanueva',
        },
    },
};
