'use client';

import { MinusIcon, PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

export interface FocusAreaOption {
    value: string;
    /** Already translated, e.g. "Food". */
    label: string;
}

export interface FocusAreaPillsProps {
    /** In the order to show them (broadest and most common first). */
    options: FocusAreaOption[];
    /** How many show before "+ N more". The rest are added to the right. */
    shown: number;
    /** The chosen key, or null for any focus area. */
    selected: string | null;
    onSelect: (value: string | null) => void;
    /** Field name for the hidden input, so the form submits the choice. */
    name?: string;
    /** Start with every pill shown (for previews). */
    defaultExpanded?: boolean;
    /** For the strip, e.g. to let it run past its container to the screen edge. */
    className?: string;
}

const pillClass =
    'inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full border px-3 text-sm whitespace-nowrap transition-colors select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none';

/**
 * Pick one focus area (a "tag") from a row of pills. Clicking a pill picks
 * it, clicking another switches, and clicking the chosen one clears it.
 * The pills sit two rows high, filling each column top to bottom, so the
 * most common are on the left; "+ N more" adds the rest to the right, and
 * the rows scroll sideways when they're longer than the space they have.
 */
export function FocusAreaPills({
    options,
    shown,
    selected,
    onSelect,
    name = 'focusAreas',
    defaultExpanded = false,
    className,
}: FocusAreaPillsProps) {
    const t = useTranslations('FocusAreaPills');
    const labelId = useId();
    const stripId = useId();
    const chosenHidden = options
        .slice(shown)
        .some((option) => option.value === selected);
    const [expanded, setExpanded] = useState(defaultExpanded || chosenHidden);
    const firstHidden = useRef<HTMLButtonElement>(null);
    const extra = options.length - shown;
    const visible = expanded ? options : options.slice(0, shown);

    return (
        <div className={cn('flex min-w-0 flex-col gap-2', className)}>
            <input type="hidden" name={name} value={selected ?? ''} />
            <span
                id={labelId}
                className="text-sm leading-snug font-medium select-none"
            >
                {t('label')}
            </span>
            {/* Padding gives the focus ring room inside the scrolling strip. */}
            <div
                id={stripId}
                role="group"
                aria-labelledby={labelId}
                className="-my-1 grid [scrollbar-width:thin] auto-cols-max grid-flow-col grid-rows-2 gap-1.5 overflow-x-auto px-0.5 py-1 pr-4"
            >
                {visible.map((option, i) => {
                    const pressed = option.value === selected;
                    return (
                        <button
                            key={option.value}
                            ref={i === shown ? firstHidden : undefined}
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
                {extra > 0 && (
                    <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={stripId}
                        onClick={() => {
                            const next = !expanded;
                            setExpanded(next);
                            // Opening: go to the first new pill, not the end of the list.
                            if (next)
                                requestAnimationFrame(() =>
                                    firstHidden.current?.focus()
                                );
                        }}
                        className={cn(
                            pillClass,
                            'border-dashed border-control text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {expanded ? (
                            <MinusIcon aria-hidden className="size-3.5" />
                        ) : (
                            <PlusIcon aria-hidden className="size-3.5" />
                        )}
                        {expanded ? t('fewer') : t('more', { count: extra })}
                    </button>
                )}
            </div>
        </div>
    );
}
