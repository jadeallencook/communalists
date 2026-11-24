import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { ClaimOrganizationForm } from './claim-organization-form';

const meta = {
    title: 'Components/Organisms/Claim Organization Form',
    component: ClaimOrganizationForm,
    args: {
        name: 'Eastside Shower Day',
        orgId: 'org1',
        handle: 'eastside-shower-day',
        locale: 'en',
        state: {},
        formAction: fn(),
    },
} satisfies Meta<typeof ClaimOrganizationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Errors: Story = {
    args: {
        state: {
            fieldErrors: { role: 'roleRequired', message: 'messageTooShort' },
            values: { intent: 'claim', role: '', message: 'call me' },
        },
    },
};
/** Asking for the page to be taken down instead. */
export const TakeDown: Story = {
    args: {
        state: {
            values: {
                intent: 'remove',
                role: 'Pastor',
                message:
                    "We don't want to be listed. Call the church office to confirm.",
            },
        },
    },
};
export const AlreadyClaimed: Story = {
    args: { state: { formError: 'notUnclaimed' } },
};
export const Submitting: Story = { args: { pending: true } };
