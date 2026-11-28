import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { fn } from 'storybook/test';

import { ComradeButton } from '@/components/molecules/comrade-button';

import { ProfileCard } from './profile-card';
import {
    manyComrades,
    privateView,
    publicView,
    selfView,
} from './profile-fixtures';

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
/** "Only my comrades", seen by someone who isn't one: the rest is private. */
export const JustTheName: Story = { args: { view: privateView } };
/** Shared, but nothing filled in yet. */
export const NothingShared: Story = {
    args: {
        view: {
            name: 'Daniel Park',
            username: 'daniel-park',
            details: {
                languages: [],
                socials: [],
                groups: [],
                endorsements: [],
                comrades: [],
            },
        },
    },
};
/** Someone with more comrades than the profile shows: a link to all of them. */
export const ManyComrades: Story = {
    args: {
        view: {
            ...selfView,
            details: { ...selfView.details!, comrades: manyComrades },
        },
    },
};
/** Their comrades couldn't be loaded: the section says so, the rest shows. */
export const ComradesFailed: Story = { args: { comradesFailed: true } };
/** Another person's profile, with the comrade button under the name. */
export const WithComradeButton: Story = {
    args: {
        action: (
            <ComradeButton
                state="none"
                uid="seed-maya"
                name="Maya Thompson"
                next="/comrade/maya-thompson"
                locale="en"
                formAction={fn()}
            />
        ),
    },
};
/** Their endorsements couldn't be loaded: the section says so, the rest shows. */
export const EndorsementsFailed: Story = {
    args: { endorsementsFailed: true },
};
export const LongName: Story = {
    args: {
        view: {
            ...publicView,
            name: 'Maria de los Ángeles Fernández-Villanueva',
        },
    },
};
