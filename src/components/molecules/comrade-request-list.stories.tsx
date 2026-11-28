import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { SAMPLE_PHOTO } from './photo-fixtures';
import { ComradeRequestList } from './comrade-request-list';

const now = Date.now();
const hour = 60 * 60 * 1000;

const meta = {
    title: 'Components/Molecules/Comrade Request List',
    component: ComradeRequestList,
    args: {
        requests: [
            {
                uid: 'seed-luis',
                name: 'Luis Hernández',
                username: 'luis-hernandez',
                photo: SAMPLE_PHOTO,
                at: now - 2 * hour,
            },
            {
                uid: 'seed-thanh',
                name: 'Thanh Nguyen',
                username: 'thanh-nguyen',
                at: now - 50 * hour,
            },
        ],
        next: '/dashboard',
        locale: 'en',
        formAction: fn(),
        from: 'dashboard',
    },
    decorators: [
        (Story) => (
            <div className="max-w-3xl">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ComradeRequestList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoWaiting: Story = {};
export const LongName: Story = {
    args: {
        requests: [
            {
                uid: 'x',
                name: 'Maria de los Ángeles Rodríguez-Hernández García',
                username: 'maria-de-los-angeles-rodriguez',
                at: now - 5 * 60 * 1000,
            },
        ],
    },
};
/** Just answered the last one: the card stays to announce it, then hides next time. */
export const JustAnswered: Story = {
    args: { requests: [], notice: "You're comrades now." },
};
/** No requests: nothing shows. */
export const Empty: Story = { args: { requests: [] } };
export const Pending: Story = { args: { pending: true } };
export const Error: Story = {
    args: { error: 'Something went wrong. Try again.' },
};
/** They couldn't be loaded: the card says so, the dashboard still shows. */
export const LoadFailed: Story = { args: { requests: null } };
