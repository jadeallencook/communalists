import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { samplePersonPhoto } from '@/components/molecules/photo-fixtures';
import { PhotoEditor } from '@/components/organisms/photo-editor';

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
/** Their own profile: everything, plus Edit profile. Hover the photo to change it. */
export const Self: Story = {
    args: {
        view: { ...selfView, photoUrl: samplePersonPhoto },
        isSelf: true,
        photoEditor: (
            <PhotoEditor
                name={selfView.name}
                photoUrl={samplePersonPhoto}
                audience="profile"
                saveAction={fn(async () => ({
                    ok: true as const,
                    removed: false,
                }))}
            />
        ),
    },
};
export const Private: Story = { args: { view: privateView } };
export const Loading: Story = { render: () => <ProfilePageLoading /> };
