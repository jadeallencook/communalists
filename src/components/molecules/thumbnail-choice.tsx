import { CheckIcon } from 'lucide-react';

import { Skeleton } from '@/components/atoms/skeleton';
import { cn } from '@/lib/utils';

export interface ThumbnailOption {
    value: string;
    /** Already translated: the option's name (its picture is decorative). */
    label: string;
    description?: string;
    /** A picture of the option, or nothing while it's drawn. */
    image?: string;
    /** Colour swatches instead of a picture. */
    swatches?: string[];
}

export interface ThumbnailChoiceProps {
    name: string;
    legend: string;
    hint?: string;
    /** Groups of options, each with its own heading (leave `label` out for none). */
    groups: { label?: string; options: ThumbnailOption[] }[];
    value: string;
    onChange: (value: string) => void;
    /** Width ÷ height of the pictures. */
    aspect?: number;
    /** Hide the legend visually (still read out), when a heading above says the same. */
    legendHidden?: boolean;
    /** `wide` fits more per row (for swatches). */
    size?: 'normal' | 'wide';
}

/**
 * Pick one option by its picture: native radio buttons (arrow keys move
 * between them), each named by its text, with a visible check on the chosen
 * one. Scales to many options, grouped under headings.
 */
export function ThumbnailChoice({
    name,
    legend,
    hint,
    groups,
    value,
    onChange,
    aspect = 1,
    size = 'normal',
    legendHidden = false,
}: ThumbnailChoiceProps) {
    const hintId = `${name}-hint`;
    return (
        <fieldset
            className="flex min-w-0 flex-col gap-3"
            aria-describedby={hint ? hintId : undefined}
        >
            <legend
                className={cn(
                    'mb-1.5 text-base font-medium',
                    legendHidden && 'sr-only'
                )}
            >
                {legend}
            </legend>
            {hint && (
                <p id={hintId} className="text-sm text-muted-foreground">
                    {hint}
                </p>
            )}
            {groups.map((group, index) => {
                const options = (
                    <div
                        className={cn(
                            'grid gap-3',
                            size === 'wide'
                                ? 'grid-cols-2 sm:grid-cols-3'
                                : 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4'
                        )}
                    >
                        {group.options.map((option) => {
                            const checked = option.value === value;
                            return (
                                <label
                                    key={option.value}
                                    className={cn(
                                        'relative flex cursor-pointer flex-col gap-2 rounded-lg border border-control p-2 text-sm has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50',
                                        checked && 'border-2 border-foreground'
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name={name}
                                        value={option.value}
                                        checked={checked}
                                        onChange={() => onChange(option.value)}
                                        className="sr-only"
                                    />
                                    {option.swatches ? (
                                        <span
                                            aria-hidden
                                            className="flex h-10 overflow-hidden rounded-md border border-control"
                                        >
                                            {option.swatches.map((color, i) => (
                                                <span
                                                    // Two roles can share a colour.
                                                    key={i}
                                                    className="flex-1"
                                                    style={{
                                                        backgroundColor: color,
                                                    }}
                                                />
                                            ))}
                                        </span>
                                    ) : option.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element -- a data URL drawn in the browser
                                        <img
                                            src={option.image}
                                            alt=""
                                            className="w-full rounded-md object-cover"
                                            style={{ aspectRatio: aspect }}
                                        />
                                    ) : (
                                        <Skeleton
                                            className="w-full rounded-md motion-reduce:animate-none"
                                            style={{ aspectRatio: aspect }}
                                        />
                                    )}
                                    <span className="flex items-start gap-1.5">
                                        {checked && (
                                            <CheckIcon
                                                aria-hidden
                                                className="mt-0.5 size-4 shrink-0"
                                            />
                                        )}
                                        <span className="flex flex-col">
                                            <span className="font-medium">
                                                {option.label}
                                            </span>
                                            {option.description && (
                                                <span className="text-muted-foreground">
                                                    {option.description}
                                                </span>
                                            )}
                                        </span>
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                );
                return group.label ? (
                    <fieldset
                        key={group.label}
                        className="flex min-w-0 flex-col gap-2"
                    >
                        <legend className="mb-1 text-sm font-medium">
                            {group.label}
                        </legend>
                        {options}
                    </fieldset>
                ) : (
                    <div key={index}>{options}</div>
                );
            })}
        </fieldset>
    );
}
