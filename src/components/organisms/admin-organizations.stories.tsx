import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { organizations } from './admin-fixtures';
import { AdminOrganizations } from './admin-organizations';

const meta = {
    title: 'Components/Organisms/AdminOrganizations',
    component: AdminOrganizations,
    parameters: { layout: 'padded' },
    args: organizations,
} satisfies Meta<typeof AdminOrganizations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MissingContact: Story = {};

export const MissingAddress: Story = {
    args: {
        gap: 'address',
        missing: organizations.recent.slice(0, 1),
    },
};

export const Searching: Story = {
    args: { query: 'oak', results: organizations.recent.slice(1, 2) },
};

export const NoResults: Story = {
    args: { query: 'zzz', results: [] },
};

/** As many results as the search returns: asks to type more. */
export const ManyResults: Story = {
    args: {
        query: 'e',
        searchLimit: 2,
        results: organizations.missing,
    },
};

export const NothingMissing: Story = {
    args: {
        gapCounts: { contact: 0, phone: 0, email: 0, website: 0, address: 0 },
        missing: [],
        recent: [],
    },
};

export const LongNames: Story = {
    args: {
        recent: [
            {
                ...organizations.recent[0],
                name: 'Comité de Ayuda Mutua de los Barrios del Este de San José y Alrededores',
                handle: 'comite-de-ayuda-mutua-barrios',
                missingDetails: ['phone', 'email', 'website', 'address'],
            },
        ],
    },
};
