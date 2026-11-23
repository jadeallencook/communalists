import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { HeroActions, HeroActionsPlaceholder } from './hero-actions';

const meta = {
    title: 'Components/Molecules/Hero Actions',
    component: HeroActions,
    args: { signedIn: false },
    decorators: [
        (Story) => (
            <div className="bg-neutral-800 p-8">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof HeroActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {};
export const SignedIn: Story = { args: { signedIn: true } };
/** While the session is checked: empty, same height. */
export const Loading: Story = { render: () => <HeroActionsPlaceholder /> };
