import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { DeleteOrganizationSection } from './delete-organization-section';

const meta = {
    title: 'Components/Organisms/Delete Organization Section',
    component: DeleteOrganizationSection,
    args: {
        name: 'South Bay Mutual Aid',
        orgId: 'org1',
        locale: 'en',
        typed: '',
        onTypedChange: fn(),
        confirmed: false,
        formAction: fn(),
    },
} satisfies Meta<typeof DeleteOrganizationSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Open the dialog: Delete stays disabled until the name is typed. */
export const Default: Story = {};
export const NameTyped: Story = {
    args: { typed: 'south bay mutual aid', confirmed: true },
};
export const Error: Story = {
    args: {
        typed: 'South Bay',
        error: "The name you typed doesn't match.",
    },
};
export const Deleting: Story = {
    args: { typed: 'South Bay Mutual Aid', confirmed: true, pending: true },
};
