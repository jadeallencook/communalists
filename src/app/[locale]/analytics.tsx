'use client';

import Script from 'next/script';
import { useEffect } from 'react';

import {
    readTracked,
    sanitizeAnalyticsPayload,
    TRACKED_SELECTOR,
    UMAMI_DOMAINS,
    UMAMI_SCRIPT_URL,
    UMAMI_WEBSITE_ID,
    type AnalyticsData,
} from '@/lib/analytics';
import { flushQueuedEvents, sendEvent } from '@/lib/analytics/browser';

declare global {
    interface Window {
        communalistsBeforeSend?: (
            type: string,
            payload: { url?: string; referrer?: string }
        ) => object | null;
    }
}

// Umami looks this hook up by name before every send (checked against
// cloud.umami.is/script.js, 2026-11-26), so it's set when this module loads,
// before the tracker can run.
if (typeof window !== 'undefined') {
    window.communalistsBeforeSend = (_type, payload) =>
        sanitizeAnalyticsPayload(payload, window.location.origin);
}

/**
 * Analytics for the whole site (documentation/technical/analytics.md):
 * - reports clicks on any element marked with `track()` (src/lib/analytics),
 *   so presentational components only add attributes;
 * - with `load`, loads Umami, which counts page views (client navigations
 *   included). Every page view and event passes sanitizeAnalyticsPayload
 *   first. `load` is true on the production deployment only.
 * Renders nothing visible.
 */
export function Analytics({ load }: { load: boolean }) {
    useEffect(() => {
        // Capture phase: runs even if the element stops the click, and
        // before a link navigates away. Keyboard activation fires click too.
        const onClick = (event: MouseEvent) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            const element = target.closest(TRACKED_SELECTOR);
            if (!element) return;
            const tracked = readTracked(element.attributes);
            if (tracked)
                sendEvent(tracked.event, tracked.data as AnalyticsData);
        };
        document.addEventListener('click', onClick, true);
        return () => document.removeEventListener('click', onClick, true);
    }, []);

    if (!load) return null;
    return (
        <Script
            src={UMAMI_SCRIPT_URL}
            strategy="afterInteractive"
            data-website-id={UMAMI_WEBSITE_ID}
            data-domains={UMAMI_DOMAINS}
            data-before-send="communalistsBeforeSend"
            data-exclude-hash="true"
            data-do-not-track="true"
            onLoad={flushQueuedEvents}
        />
    );
}
