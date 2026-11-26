// Sends analytics events from the browser through Umami's tracker
// (window.umami), which src/app/[locale]/analytics.tsx loads on production
// only. Web only (it uses window), but no React or Next. Events sent before
// the tracker loads wait in a short queue; without the tracker (local dev,
// previews) nothing leaves the browser, and dev builds log each event to the
// console instead.

import type { AnalyticsData, AnalyticsEvent, AnalyticsEvents } from '.';

interface Umami {
    track(event: string, data?: AnalyticsData): void;
}

declare global {
    interface Window {
        umami?: Umami;
    }
}

const MAX_QUEUED = 20;
let queue: [string, AnalyticsData | undefined][] = [];

/** Sends `event` now, or once the tracker has loaded. */
export function sendEvent(event: string, data?: AnalyticsData) {
    if (process.env.NODE_ENV === 'development')
        console.debug('[analytics]', event, data ?? {});
    const umami = typeof window === 'undefined' ? undefined : window.umami;
    if (umami) umami.track(event, data);
    else if (queue.length < MAX_QUEUED) queue.push([event, data]);
}

/** The typed form, for code that reports an event itself (not a click). */
export function trackEvent<E extends AnalyticsEvent>(
    event: E,
    ...[data]: AnalyticsEvents[E] extends Record<string, never>
        ? []
        : [AnalyticsEvents[E]]
) {
    sendEvent(event, data as AnalyticsData | undefined);
}

/** Called when the tracker has loaded: sends what was waiting. */
export function flushQueuedEvents() {
    const umami = window.umami;
    if (!umami) return;
    const waiting = queue;
    queue = [];
    for (const [event, data] of waiting) umami.track(event, data);
}
