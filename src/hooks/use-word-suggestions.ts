'use client';

import { useEffect, useMemo } from 'react';

import { closestWords, type DefinitionPreview } from '@/lib/definitions';

import { useDefinitionPreviews } from './use-definition-previews';

type Fetcher = (locale: string) => Promise<Record<string, DefinitionPreview>>;

/**
 * Words close to an address that isn't a word, for the dictionary's
 * not-found page. Uses the same word list as marked words (one cached
 * request per language). Empty while loading or if it can't load: the
 * page works without suggestions.
 */
export function useWordSuggestions(
    address: string,
    locale: string,
    fetcher?: Fetcher
) {
    const previews = useDefinitionPreviews(locale, fetcher);
    const { load } = previews;
    useEffect(() => {
        load();
    }, [load]);
    const state = previews.state;
    return useMemo(() => {
        if (state.status !== 'ready') return [];
        const items = Object.entries(state.previews).map(([slug, p]) => ({
            slug,
            word: p.word,
            lang: p.lang,
        }));
        return closestWords(items, address);
    }, [state, address]);
}
