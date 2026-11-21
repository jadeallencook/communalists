'use client';

import { useEffect, useState } from 'react';

import { fetchPlaces } from '@/lib/places/client';
import { MIN_QUERY_LENGTH } from '@/lib/places/search';
import type { CountryCode, PlaceOption } from '@/lib/places/types';

export type PlaceSearchFn = (
    country: CountryCode,
    query: string,
    signal: AbortSignal
) => Promise<PlaceOption[]>;

interface Options {
    /** Defaults to the /api/places endpoint; pass a mock in Storybook and tests. */
    search?: PlaceSearchFn;
    debounceMs?: number;
}

/**
 * Type-ahead city search. Waits for a pause in typing, cancels stale
 * requests, and keeps the last results visible while new ones load.
 */
export function usePlaceSearch(
    country: CountryCode,
    query: string,
    { search = fetchPlaces, debounceMs = 200 }: Options = {}
) {
    const trimmed = query.trim();
    const key = `${country}|${trimmed}`;
    const tooShort = trimmed.length < MIN_QUERY_LENGTH;
    const [result, setResult] = useState<{
        key: string;
        options: PlaceOption[];
        failed: boolean;
    }>({ key: '', options: [], failed: false });

    useEffect(() => {
        if (tooShort) return;
        const controller = new AbortController();
        const timer = setTimeout(() => {
            search(country, trimmed, controller.signal)
                .then((options) => setResult({ key, options, failed: false }))
                .catch(() => {
                    if (!controller.signal.aborted) {
                        setResult({ key, options: [], failed: true });
                    }
                });
        }, debounceMs);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [country, trimmed, key, tooShort, search, debounceMs]);

    if (tooShort) return { results: [], loading: false, failed: false };
    return {
        results: result.options,
        loading: result.key !== key,
        failed: result.key === key && result.failed,
    };
}
