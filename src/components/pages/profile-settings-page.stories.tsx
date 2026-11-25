import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { PhotoEditor } from '@/components/organisms/photo-editor';
import { publicView } from '@/components/organisms/profile-fixtures';
import { ProfilePreview } from '@/components/organisms/profile-preview';
import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';

import {
    ProfileSettingsPage,
    ProfileSettingsPageLoading,
} from './profile-settings-page';

const meta = {
    title: 'Pages/Profile Settings',
    component: ProfileSettingsPage,
    parameters: { layout: 'fullscreen' },
    args: {
        username: 'maya-thompson',
        photo: (
            <PhotoEditor
                variant="field"
                name="Maya Thompson"
                audience="profile"
                saveAction={fn(async () => ({
                    ok: true as const,
                    removed: false,
                }))}
            />
        ),
        form: (
            <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                The form (see Components/Organisms/Profile Settings Form).
            </p>
        ),
        preview: (
            <ProfilePreview
                views={{
                    public: publicView,
                    groupmate: publicView,
                    signedIn: publicView,
                }}
                audience="public"
                onAudienceChange={fn()}
            />
        ),
    },
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
} satisfies Meta<typeof ProfileSettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { render: () => <ProfileSettingsPageLoading /> };
