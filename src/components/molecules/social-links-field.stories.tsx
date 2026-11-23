import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

import { SocialLinksField, type SocialLink } from './social-links-field';

const meta = {
    title: 'Components/Molecules/Social Links Field',
    component: SocialLinksField,
    args: { links: [], onChange: fn() },
    decorators: [
        (Story) => (
            <div className="max-w-xl">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof SocialLinksField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const WithLinks: Story = {
    args: {
        links: [
            { platform: 'instagram', url: 'https://instagram.com/sbma' },
            { platform: 'discord', url: 'https://discord.gg/abc' },
        ],
    },
};
export const WithError: Story = {
    args: {
        links: [{ platform: 'facebook', url: 'https://instagram.com/sbma' }],
        error: "One of the links isn't on the platform chosen for it.",
    },
};

function Interactive() {
    const [links, setLinks] = useState<SocialLink[]>([]);
    return <SocialLinksField links={links} onChange={setLinks} />;
}
/** Add, change and remove rows. */
export const Playground: Story = { render: () => <Interactive /> };
