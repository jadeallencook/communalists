// Sample notifications for stories (not used by the app).
import { fn } from 'storybook/test';

import { ComradeRespondForm } from '@/components/molecules/comrade-request-list';
import { SAMPLE_PHOTO } from '@/components/molecules/photo-fixtures';

import type { NotificationItem } from './notification-list';

const now = Date.now();
const hour = 60 * 60 * 1000;

export const sampleNotifications: NotificationItem[] = [
    {
        id: 'n1',
        kind: 'comradeRequest',
        actor: {
            name: 'Luis Hernández',
            username: 'luis-hernandez',
            photo: SAMPLE_PHOTO,
        },
        at: now - 20 * 60 * 1000,
        unread: true,
        actions: (
            <ComradeRespondForm
                uid="seed-luis"
                name="Luis Hernández"
                next="/notifications"
                locale="en"
                formAction={fn()}
                from="notifications"
            />
        ),
    },
    {
        id: 'n2',
        kind: 'comradeAccepted',
        actor: { name: 'Aisha Mohamed', username: 'aisha-mohamed' },
        at: now - 26 * hour,
        unread: true,
    },
    {
        id: 'n3',
        kind: 'comradeAccepted',
        actor: { name: 'Thanh Nguyen', username: 'thanh-nguyen' },
        at: now - 9 * 24 * hour,
        unread: false,
    },
];
