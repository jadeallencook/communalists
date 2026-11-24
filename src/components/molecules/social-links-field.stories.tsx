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
            { platform: 'instagram', handle: 'sbma' },
            { platform: 'facebookGroup', handle: 'southbaymutualaid' },
            { platform: 'bluesky', handle: 'sbma.bsky.social' },
        ],
    },
};
export const WithError: Story = {
    args: {
        links: [{ platform: 'x', handle: 'south bay mutual aid' }],
        error: "One of the usernames isn't valid. Type just the username, like sbma.",
    },
};

function Interactive() {
    const [links, setLinks] = useState<SocialLink[]>([]);
    return <SocialLinksField links={links} onChange={setLinks} />;
}
/** Add, change and remove rows. */
export const Playground: Story = { render: () => <Interactive /> };
