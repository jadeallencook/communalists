import { CheckIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface StepBarProps<S extends string> {
    /** Already translated: names the navigation for screen readers. */
    label: string;
    steps: { value: S; label: string }[];
    current: S;
    onChange: (step: S) => void;
    /** Steps that are done (shows a check). */
    done?: S[];
}

/**
 * Numbered steps people can jump between. The current one has
 * `aria-current="step"`. Wraps to two rows on narrow screens.
 */
export function StepBar<S extends string>({
    label,
    steps,
    current,
    onChange,
    done = [],
}: StepBarProps<S>) {
    return (
        <nav aria-label={label}>
            <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {steps.map((step, index) => {
                    const isCurrent = step.value === current;
                    return (
                        <li key={step.value} className="flex">
                            <button
                                type="button"
                                aria-current={isCurrent ? 'step' : undefined}
                                onClick={() => onChange(step.value)}
                                className={cn(
                                    'flex min-h-11 w-full items-center gap-2 rounded-md border border-control px-3 py-2 text-left text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                                    isCurrent &&
                                        'border-2 border-foreground font-semibold'
                                )}
                            >
                                <span
                                    aria-hidden
                                    className={cn(
                                        'flex size-6 shrink-0 items-center justify-center rounded-full border border-control text-xs',
                                        isCurrent &&
                                            'border-foreground bg-foreground text-background'
                                    )}
                                >
                                    {done.includes(step.value) && !isCurrent ? (
                                        <CheckIcon className="size-3.5" />
                                    ) : (
                                        index + 1
                                    )}
                                </span>
                                {step.label}
                            </button>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
