'use client';

import { useCallback, useEffect, useState } from 'react';

import type { DefinitionPreview } from '@/lib/definitions';

export type DefinitionPreviews =
    | { status: 'idle' | 'loading' | 'error' }
    | { status: 'ready'; previews: Record<string, DefinitionPreview> };

type Fetcher = (locale: string) => Promise<Record<string, DefinitionPreview>>;

const fetchPreviews: Fetcher = async (locale) => {
    const response = await fetch(
        `/api/definitions?locale=${encodeURIComponent(locale)}`
    );
    if (!response.ok) throw new Error(`definitions ${response.status}`);
    return response.json();
};

// One request per language per page load, shared by every marked word.
const loaded = new Map<string, Promise<Record<string, DefinitionPreview>>>();

/**
 * The short definitions for marked words, loaded only once a page asks
 * (`load()`), so pages without marked words fetch nothing. `fetcher` is
 * injectable for stories and tests.
 */
export function useDefinitionPreviews(
    locale: string,
    fetcher: Fetcher = fetchPreviews
) {
    const [wanted, setWanted] = useState(false);
    // The result for one locale; anything else (none yet, or another
    // locale's) means it's still loading.
    const [result, setResult] = useState<{
        locale: string;
        state: DefinitionPreviews;
    } | null>(null);
    const load = useCallback(() => setWanted(true), []);

    useEffect(() => {
        if (!wanted) return;
        let live = true;
        const key = fetcher === fetchPreviews ? locale : null;
        let request = key ? loaded.get(key) : undefined;
        if (!request) {
            request = fetcher(locale);
            if (key) {
                loaded.set(key, request);
                request.catch(() => loaded.delete(key)); // retry next time
            }
        }
        request.then(
            (previews) =>
                live &&
                setResult({ locale, state: { status: 'ready', previews } }),
            () => live && setResult({ locale, state: { status: 'error' } })
        );
        return () => {
            live = false;
        };
    }, [wanted, locale, fetcher]);

    const state: DefinitionPreviews = !wanted
        ? { status: 'idle' }
        : result?.locale === locale
          ? result.state
          : { status: 'loading' };
    return { state, load };
}
