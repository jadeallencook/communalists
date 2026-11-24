import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { ClaimOrganizationForm } from '@/components/organisms/claim-organization-form';

import {
    ClaimOrganizationPage,
    ClaimOrganizationPageLoading,
} from './claim-organization-page';

const meta = {
    title: 'Pages/Claim Organization',
    component: ClaimOrganizationPage,
    parameters: { layout: 'fullscreen' },
    args: {
        name: 'Eastside Shower Day',
        handle: 'eastside-shower-day',
        orgId: 'org1',
        locale: 'en',
        state: 'form',
        cancelAction: fn(),
        form: (
            <ClaimOrganizationForm
                name="Eastside Shower Day"
                orgId="org1"
                handle="eastside-shower-day"
                locale="en"
                state={{}}
                formAction={fn()}
            />
        ),
    },
} satisfies Meta<typeof ClaimOrganizationPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Form: Story = {};
/** Sent and waiting for the team: Cancel request. */
export const Pending: Story = {
    args: {
        state: 'pending',
        pendingIntent: 'claim',
        pendingSince: 'Nov 24, 2026',
    },
};
export const PendingTakeDown: Story = {
    args: {
        state: 'pending',
        pendingIntent: 'remove',
        pendingSince: 'Nov 24, 2026',
    },
};
/** The last request was denied: a note, and the form to try again. */
export const Denied: Story = { args: { state: 'deniedCanRetry' } };
export const Loading: Story = {
    render: () => <ClaimOrganizationPageLoading />,
};
