'use client';

import { useEffect } from 'react';

import type {
    AnalyticsData,
    AnalyticsEvent,
    AnalyticsEvents,
} from '@/lib/analytics';
import { sendEvent } from '@/lib/analytics/browser';

/**
 * Reports an analytics event when it's rendered, and again whenever the
 * event or its data change (e.g. `org-view` on an organization's page, or
 * `find-search` for each new search). Renders nothing.
 */
type Props = {
    [E in AnalyticsEvent]: { event: E; data: AnalyticsEvents[E] };
}[AnalyticsEvent];

export function TrackEvent({ event, data }: Props) {
    const key = JSON.stringify(data);
    useEffect(() => {
        sendEvent(event, JSON.parse(key) as AnalyticsData);
    }, [event, key]);
    return null;
}
