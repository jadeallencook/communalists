import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';

import { WelcomePage, WelcomePageLoading } from './welcome-page';

const meta = {
    title: 'Pages/Welcome',
    component: WelcomePage,
    parameters: { layout: 'fullscreen' },
    args: {
        name: 'Ada Lovelace',
        areaLabel: 'San Jose, California, United States',
        locale: 'en',
        signOutAction: fn(),
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
} satisfies Meta<typeof WelcomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutArea: Story = { args: { areaLabel: undefined } };
export const Loading: Story = { render: () => <WelcomePageLoading /> };
