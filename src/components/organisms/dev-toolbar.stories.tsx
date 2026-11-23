import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

import type { DevToolbarCorner } from '@/hooks/use-dev-toolbar-corner';

import { DevToolbar } from './dev-toolbar';

const accounts = [
    {
        email: 'comrade1@communalists.com',
        summary:
            'Comrade One (en) · owns South Bay Mutual Aid · moderates Oakland Auto Club',
    },
    {
        email: 'comrade2@communalists.com',
        summary: 'Comrade Two (es) · member of South Bay Mutual Aid',
    },
    {
        email: 'comrade3@communalists.com',
        summary: 'No profile: goes to account setup',
    },
];

const meta = {
    title: 'Components/Organisms/Dev Toolbar',
    component: DevToolbar,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Local development only: the layout renders it when `isLocalDev()` (next dev + emulators + a demo- project), and its actions check that again. English only on purpose.',
            },
        },
    },
    args: {
        accounts,
        locale: 'en',
        signInAction: fn(),
        resetAction: fn(),
        corner: 'bottom-right',
        onCornerChange: fn(),
        defaultOpen: true,
    },
    decorators: [
        (Story) => (
            <div className="h-[520px]">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof DevToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};
export const Closed: Story = { args: { defaultOpen: false } };
export const Resetting: Story = { args: { resetPending: true } };
export const ResetDone: Story = { args: { resetStatus: 'done' } };
export const ResetFailed: Story = { args: { resetStatus: 'failed' } };

/** Change the position from the menu; it moves straight away. */
export const MovingCorners: Story = {
    render: function Render(args) {
        const [corner, setCorner] = useState<DevToolbarCorner>('top-left');
        return (
            <DevToolbar {...args} corner={corner} onCornerChange={setCorner} />
        );
    },
};
