import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SiteFooter } from './site-footer';

const meta = {
    title: 'Components/Organisms/Site Footer',
    component: SiteFooter,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
