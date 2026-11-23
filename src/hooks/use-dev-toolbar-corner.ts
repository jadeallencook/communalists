'use client';

import { useCallback, useSyncExternalStore } from 'react';

export const DEV_TOOLBAR_CORNERS = [
    'bottom-right',
    'bottom-left',
    'top-right',
    'top-left',
] as const;
export type DevToolbarCorner = (typeof DEV_TOOLBAR_CORNERS)[number];

const KEY = 'communalists:devToolbarCorner';
const EVENT = 'communalists:devToolbarCorner';
const DEFAULT: DevToolbarCorner = 'bottom-right';

function read(): DevToolbarCorner {
    try {
        const value = window.localStorage.getItem(KEY);
        return DEV_TOOLBAR_CORNERS.includes(value as DevToolbarCorner)
            ? (value as DevToolbarCorner)
            : DEFAULT;
    } catch {
        return DEFAULT; // storage blocked (private window, etc.)
    }
}

function subscribe(onChange: () => void) {
    window.addEventListener('storage', onChange);
    window.addEventListener(EVENT, onChange);
    return () => {
        window.removeEventListener('storage', onChange);
        window.removeEventListener(EVENT, onChange);
    };
}

/**
 * Which corner the dev toolbar sits in, remembered in this browser.
 * The server renders the default; the saved corner applies after hydration.
 */
export function useDevToolbarCorner() {
    const corner = useSyncExternalStore(subscribe, read, () => DEFAULT);
    const setCorner = useCallback((next: DevToolbarCorner) => {
        try {
            window.localStorage.setItem(KEY, next);
        } catch {
            // Not remembered, but still moves for this page view.
        }
        window.dispatchEvent(new Event(EVENT));
    }, []);
    return [corner, setCorner] as const;
}
