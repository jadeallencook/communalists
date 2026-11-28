import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { ErrorPage } from './error-page';

const meta = {
    title: 'Pages/ErrorPage',
    component: ErrorPage,
    parameters: { layout: 'fullscreen' },
    args: { onRetry: fn() },
} satisfies Meta<typeof ErrorPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A page couldn't load (for example, the database didn't answer). */
export const Default: Story = {};

/** With the id that matches the server's log, for reports. */
export const WithReference: Story = { args: { digest: '585441277' } };

export const Spanish: Story = {
    globals: { locale: 'es' },
    args: { digest: '585441277' },
};

export const Vietnamese: Story = { globals: { locale: 'vi' } };

export const Chinese: Story = { globals: { locale: 'zh' } };
