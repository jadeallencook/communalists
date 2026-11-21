import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { LocaleSwitcher } from './locale-switcher';
import { ThemeToggle } from './theme-toggle';

// SiteHeader and SiteFooter are async Server Components, so they're covered
// by the app itself. These are their client-side controls.
const meta = {
    title: 'Layout/Header controls',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const LanguageSwitcher: Story = {
    render: () => <LocaleSwitcher />,
};

export const ThemeMenu: Story = {
    render: () => <ThemeToggle />,
};
