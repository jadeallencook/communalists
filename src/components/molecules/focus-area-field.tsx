'use client';

import { CheckIcon, ChevronsUpDownIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLayoutEffect, useState } from 'react';

import { Button } from '@/components/atoms/button';
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/atoms/command';
import { Field, FieldLabel } from '@/components/atoms/field';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/atoms/popover';
import { cn } from '@/lib/utils';

export interface FocusAreaOption {
    value: string;
    /** Already translated, e.g. "Food". */
    label: string;
}

export interface FocusAreaFieldProps {
    /** In the order to list them (most common first). */
    options: FocusAreaOption[];
    /** The chosen key, or null for any focus area. */
    selected: string | null;
    onSelect: (value: string | null) => void;
    /** Field name for the hidden input, so the form also works without JavaScript. */
    name?: string;
    id?: string;
    /** Start with the list open (for previews). */
    defaultOpen?: boolean;
}

/**
 * Type-ahead picker for one focus area (a "tag"). Opening it lists them all;
 * typing narrows the list with cmdk's fuzzy match ("hous", "helth"…). Only a
 * listed focus area can be chosen: typed text alone is never a search.
 */
export function FocusAreaField({
    options,
    selected,
    onSelect,
    name = 'focusAreas',
    id = 'focus-area-trigger',
    defaultOpen = false,
}: FocusAreaFieldProps) {
    const t = useTranslations('FocusAreaField');
    const [open, setOpen] = useState(defaultOpen);
    const [query, setQuery] = useState('');
    const show = (next: boolean) => {
        setOpen(next);
        if (!next) setQuery('');
    };
    // Next keeps a page alive while it's hidden: close the list and drop the
    // typed text when leaving, so Back shows the chosen tag, not a stale search.
    useLayoutEffect(() => () => show(false), []);
    const chosen = options.find((option) => option.value === selected);

    return (
        <Field>
            <input type="hidden" name={name} value={chosen?.value ?? ''} />
            <FieldLabel htmlFor={id}>{t('label')}</FieldLabel>
            <div className="flex gap-2">
                <Popover open={open} onOpenChange={show}>
                    <PopoverTrigger asChild>
                        <Button
                            id={id}
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className={cn(
                                'min-w-0 flex-1 justify-between font-normal',
                                !chosen && 'text-muted-foreground'
                            )}
                        >
                            <span className="truncate">
                                {chosen?.label ?? t('placeholder')}
                            </span>
                            <ChevronsUpDownIcon
                                aria-hidden
                                className="opacity-50"
                            />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-(--radix-popover-trigger-width) min-w-56 p-0"
                        align="start"
                    >
                        <Command>
                            <CommandInput
                                value={query}
                                onValueChange={setQuery}
                                placeholder={t('search')}
                            />
                            <CommandList>
                                <CommandEmpty>{t('empty')}</CommandEmpty>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        // cmdk filters on `value`; the label is what people type.
                                        value={option.label}
                                        keywords={[option.value]}
                                        onSelect={() => {
                                            onSelect(option.value);
                                            show(false);
                                        }}
                                    >
                                        {option.label}
                                        <CheckIcon
                                            aria-hidden
                                            className={cn(
                                                'ml-auto',
                                                option.value === selected
                                                    ? 'opacity-100'
                                                    : 'opacity-0'
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                {chosen && (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={t('clear', { focusArea: chosen.label })}
                        onClick={() => {
                            onSelect(null);
                            // This button disappears; keep focus on the picker.
                            document.getElementById(id)?.focus();
                        }}
                    >
                        <XIcon aria-hidden />
                    </Button>
                )}
            </div>
        </Field>
    );
}
