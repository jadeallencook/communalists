import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ComradeButton } from '@/components/molecules/comrade-button';
import { fn } from 'storybook/test';

import { ReasonDialog } from '@/components/molecules/reason-dialog';

import {
    privateView,
    publicView,
    selfView,
} from '@/components/organisms/profile-fixtures';
import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';

import { ProfilePage, ProfilePageLoading } from './profile-page';

const meta = {
    title: 'Pages/Profile',
    component: ProfilePage,
    parameters: { layout: 'fullscreen' },
    args: { view: publicView },
    decorators: [
        (Story) => (
            <>
                <SiteHeader />
                <main>
                    <Story />
                </main>
                <SiteFooter />
            </>
        ),
    ],
} satisfies Meta<typeof ProfilePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Public: Story = {};
/** Their own profile: everything, plus Edit profile. */
export const Self: Story = { args: { view: selfView, isSelf: true } };
export const Private: Story = { args: { view: privateView } };
/** Someone else's profile, signed in: Add comrade under the name. */
export const WithComradeButton: Story = {
    args: {
        comrade: (
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
/** They asked to be the viewer's comrade. */
export const RequestReceived: Story = {
    args: {
        view: privateView,
        comrade: (
            <ComradeButton
                state="received"
                uid="seed-maya"
                name="Maya Thompson"
                next="/comrade/maya-thompson"
                locale="en"
                formAction={fn()}
            />
        ),
    },
};
export const Loading: Story = { render: () => <ProfilePageLoading /> };

/** A super user sees Remove photo, with a required reason (decision #71). */
export const SuperUser: Story = {
    args: {
        moderation: (
            <div className="rounded-lg border border-dashed p-4">
                <ReasonDialog
                    triggerLabel="Remove photo"
                    title="Remove this photo?"
                    description="It’s deleted for everyone and can’t be undone. The reason goes in the admin log."
                    confirmLabel="Remove"
                    fields={{ kind: 'users', id: 'maya' }}
                    formAction={fn()}
                    maxLength={500}
                    reasonHint="Required. Kept in the admin log, which only super users see."
                />
            </div>
        ),
    },
};
