import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
    AdminDefinitionsPage,
    AdminDefinitionsPageLoading,
} from './admin-definitions-page';

const meta = {
    title: 'Pages/Admin Definitions',
    component: AdminDefinitionsPage,
    parameters: { layout: 'fullscreen' },
    args: {
        words: [
            {
                slug: 'free-fridge',
                word: 'Free fridge',
                definition:
                    'A refrigerator in a public place where anyone can leave food or take what they need, at any time, for free. Also called a community fridge.',
                lang: 'en',
                updatedOn: 'Nov 26, 2026',
            },
            {
                slug: 'mutual-aid',
                word: 'Mutual aid',
                definition:
                    'Neighbors helping each other directly with what they need, like food, rides or rent, and sharing what they have. Everyone can give and receive.',
                lang: 'en',
                updatedOn: 'Nov 25, 2026',
            },
            {
                slug: 'unclaimed-organization-with-a-very-long-address-for-testing',
                word: 'Unclaimed organization with a very long name that wraps onto more lines',
                definition:
                    "A group's page on Communalists that our volunteers added so neighbors can find help nearby. The group doesn't run the page yet, so details may be out of date.",
                lang: 'en',
            },
        ],
    },
} satisfies Meta<typeof AdminDefinitionsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Words: Story = {};
export const Empty: Story = { args: { words: [] } };
/** Back from saving: the result is announced and takes focus. */
export const Saved: Story = {
    args: { saved: { slug: 'mutual-aid', word: 'Mutual aid' } },
};
/** Back from a CSV import. */
export const Imported: Story = { args: { imported: 10 } };
/** Back from removing a word. */
export const Removed: Story = { args: { removed: 'owner' } };
export const Loading: Story = {
    render: () => <AdminDefinitionsPageLoading />,
};
