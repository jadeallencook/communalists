'use client';

import { useMemo, useState } from 'react';

import type { RelatedWordsFieldProps } from '@/components/molecules/related-words-field';
import { RELATED_MAX, searchWords } from '@/lib/definitions';

interface Options {
    /** Every other word, already in the UI language and sorted. */
    options: { slug: string; word: string }[];
    /** Slugs already linked (the word being edited). */
    initial?: string[];
    max?: number;
}

/**
 * The related-words picker: what's chosen, what's typed, and the matches.
 * Chosen slugs that aren't in `options` are dropped (the word was removed),
 * as saving would drop them anyway.
 */
export function useRelatedWords({
    options,
    initial = [],
    max = RELATED_MAX,
}: Options): Omit<RelatedWordsFieldProps, 'error' | 'id'> {
    const [chosen, setChosen] = useState<string[]>(() =>
        initial.filter((slug) => options.some((o) => o.slug === slug))
    );
    const [query, setQuery] = useState('');
    const [change, setChange] =
        useState<RelatedWordsFieldProps['change']>(null);

    const selected = useMemo(
        () =>
            chosen.flatMap((slug) => {
                const found = options.find((o) => o.slug === slug);
                return found ? [found] : [];
            }),
        [chosen, options]
    );
    const results = useMemo(
        () =>
            searchWords(
                options.filter((o) => !chosen.includes(o.slug)),
                query
            ),
        [options, chosen, query]
    );

    return {
        selected,
        query,
        onQueryChange: setQuery,
        results,
        atMax: chosen.length >= max,
        max,
        change,
        onAdd: (slug) => {
            const found = options.find((o) => o.slug === slug);
            if (!found || chosen.includes(slug) || chosen.length >= max) return;
            setChosen([...chosen, slug]);
            setQuery('');
            setChange({ kind: 'added', word: found.word, at: Date.now() });
        },
        onRemove: (slug) => {
            const found = options.find((o) => o.slug === slug);
            setChosen(chosen.filter((s) => s !== slug));
            if (found)
                setChange({
                    kind: 'removed',
                    word: found.word,
                    at: Date.now(),
                });
        },
        hasOptions: options.length > 0,
    };
}
