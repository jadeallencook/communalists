'use client';

import { PlusIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';

import { Button } from '@/components/atoms/button';
import {
    Command,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/atoms/command';
import { FieldDescription, FieldError } from '@/components/atoms/field';

type Word = { slug: string; word: string };

export interface RelatedWordsFieldProps {
    /** For the error summary's link; the wrapper takes focus. */
    id: string;
    /** Words already linked, in the order they were added. */
    selected: Word[];
    /** What's typed in the search. */
    query: string;
    onQueryChange: (query: string) => void;
    /** Matches for `query`, without the words already linked. */
    results: Word[];
    onAdd: (slug: string) => void;
    onRemove: (slug: string) => void;
    /** The most words allowed are linked, so nothing more can be added. */
    atMax: boolean;
    max: number;
    /** The last add or remove, announced to screen readers. `at` makes each one new. */
    change: { kind: 'added' | 'removed'; word: string; at: number } | null;
    /** False when this is the first word: there's nothing to link to, so the form leaves the field out. */
    hasOptions: boolean;
    /** Already translated. */
    error?: string;
}

/**
 * Related words: the ones linked, each with Remove, and a search to add more
 * (the list is too long to show whole). Submits each slug as a hidden
 * `related` input. No logic: searching and limits are the hook's job
 * (`useRelatedWords`).
 */
export function RelatedWordsField({
    id,
    selected,
    query,
    onQueryChange,
    results,
    onAdd,
    onRemove,
    atMax,
    max,
    change,
    hasOptions,
    error,
}: RelatedWordsFieldProps) {
    // `hasOptions` is false only for the first word; the form hides the field then.
    const t = useTranslations('AdminDefinitions.relatedPicker');
    const tForm = useTranslations('AdminDefinitions');
    const inputRef = useRef<HTMLInputElement>(null);
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const statusId = `${id}-status`;
    const typed = query.trim().length > 0;

    return (
        <fieldset id={id} tabIndex={-1} className="flex flex-col gap-3">
            <legend className="mb-1 font-medium">{tForm('related')}</legend>
            {selected.map((w) => (
                <input
                    key={w.slug}
                    type="hidden"
                    name="related"
                    value={w.slug}
                />
            ))}

            {hasOptions && (
                <>
                    <FieldDescription id={hintId}>
                        {tForm('relatedHint', { max })}
                    </FieldDescription>

                    <div className="flex flex-col gap-2">
                        <p id={`${id}-chosen`} className="text-sm font-medium">
                            {t('chosen', { count: selected.length, max })}
                        </p>
                        {selected.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {t('none')}
                            </p>
                        ) : (
                            <ul
                                aria-labelledby={`${id}-chosen`}
                                className="flex flex-wrap gap-2"
                            >
                                {selected.map((w) => (
                                    <li
                                        key={w.slug}
                                        className="flex max-w-full items-center gap-1 rounded-lg border border-control py-1 pr-1 pl-3 text-sm"
                                    >
                                        <span className="break-words">
                                            {w.word}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 shrink-0"
                                            aria-label={t('remove', {
                                                word: w.word,
                                            })}
                                            onClick={() => {
                                                onRemove(w.slug);
                                                // The button is gone, so focus
                                                // goes to the search.
                                                inputRef.current?.focus();
                                            }}
                                        >
                                            <XIcon aria-hidden />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <p aria-hidden className="text-sm font-medium">
                            {t('search')}
                        </p>
                        {/* Matching is done by the hook, so cmdk's own filter is off. */}
                        <Command
                            shouldFilter={false}
                            label={t('search')}
                            className="h-auto gap-1 overflow-visible bg-transparent p-0 **:data-[slot=command-input-wrapper]:p-0"
                        >
                            <CommandInput
                                ref={inputRef}
                                value={query}
                                onValueChange={onQueryChange}
                                placeholder={t('placeholder')}
                                aria-describedby={
                                    [error ? errorId : null, hintId]
                                        .filter(Boolean)
                                        .join(' ') || undefined
                                }
                                aria-invalid={error ? true : undefined}
                            />
                            {typed && (
                                <CommandList className="rounded-lg border border-control bg-popover p-1">
                                    {atMax ? (
                                        <p className="px-2 py-3 text-sm text-muted-foreground">
                                            {t('atMax', { max })}
                                        </p>
                                    ) : results.length === 0 ? (
                                        <p className="px-2 py-3 text-sm text-muted-foreground">
                                            {t('noMatch', { query })}
                                        </p>
                                    ) : (
                                        results.map((w) => (
                                            <CommandItem
                                                key={w.slug}
                                                value={w.slug}
                                                onSelect={() => {
                                                    onAdd(w.slug);
                                                    inputRef.current?.focus();
                                                }}
                                                className="min-h-10"
                                            >
                                                <PlusIcon aria-hidden />
                                                <span className="break-words">
                                                    {w.word}
                                                </span>
                                            </CommandItem>
                                        ))
                                    )}
                                </CommandList>
                            )}
                        </Command>
                    </div>
                </>
            )}

            {error && <FieldError id={errorId}>{error}</FieldError>}

            <p id={statusId} role="status" className="sr-only">
                {change
                    ? t(change.kind, {
                          word: change.word,
                          count: selected.length,
                          max,
                      })
                    : ''}
            </p>
        </fieldset>
    );
}
