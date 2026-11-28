'use client';

import { useTranslations } from 'next-intl';
import { useId } from 'react';

import { cn } from '@/lib/utils';

export interface FocusAreaOption {
    value: string;
    /** Already translated, e.g. "Food". */
    label: string;
}

export interface FocusAreaPillsProps {
    /** In the order to show them (broadest and most common first). Keep it short: every one shows. */
    options: FocusAreaOption[];
    /** The chosen key, or null for any focus area. */
    selected: string | null;
    onSelect: (value: string | null) => void;
    /** Field name for the hidden input, so the form submits the choice. */
    name?: string;
    className?: string;
}

const pillClass =
    'inline-flex min-h-8 items-center rounded-full border px-3 text-sm whitespace-nowrap transition-colors select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none';

/**
 * Pick one focus area (a "tag") from a few pills. Clicking a pill picks
 * it, clicking another switches, and clicking the chosen one clears it.
 * Each pill is as wide as its label, and they wrap onto as many lines as
 * the space needs.
 */
export function FocusAreaPills({
    options,
    selected,
    onSelect,
    name = 'focusAreas',
    className,
}: FocusAreaPillsProps) {
    const t = useTranslations('FocusAreaPills');
    const labelId = useId();

    return (
        <div className={cn('flex min-w-0 flex-col gap-2', className)}>
            <input type="hidden" name={name} value={selected ?? ''} />
            <span
                id={labelId}
                className="text-sm leading-snug font-medium select-none"
            >
                {t('label')}
            </span>
            <div
                role="group"
                aria-labelledby={labelId}
                className="flex flex-wrap gap-1.5"
            >
                {options.map((option) => {
                    const pressed = option.value === selected;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={pressed}
                            onClick={() =>
                                onSelect(pressed ? null : option.value)
                            }
                            className={cn(
                                pillClass,
                                pressed
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-control hover:bg-muted'
                            )}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
