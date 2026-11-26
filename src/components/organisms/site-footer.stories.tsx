import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { buildInfo } from '@/lib/build-info';

import { SiteFooter } from './site-footer';

const meta = {
    title: 'Components/Organisms/Site Footer',
    component: SiteFooter,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** On Vercel: the commit it was built from, linked to GitHub. */
export const Deployed: Story = {
    args: {
        build: buildInfo('be4248fd0123456789abcdef0123456789abcdef'),
    },
};

/** Local dev and local builds have no commit: shows "dev". */
export const Local: Story = { args: { build: buildInfo(undefined) } };

export const WithoutBuild: Story = {};
