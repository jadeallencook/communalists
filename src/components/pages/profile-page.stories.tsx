import type { Meta, StoryObj } from '@storybook/nextjs-vite';

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
export const Loading: Story = { render: () => <ProfilePageLoading /> };
