'use client';

import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/atoms/button';
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/atoms/command';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@/components/atoms/field';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/atoms/popover';
import { cn } from '@/lib/utils';
import type { CountryCode, PlaceOption } from '@/lib/places/types';

export interface LocationFieldProps {
    countries: { code: CountryCode; name: string }[];
    country: CountryCode;
    onCountryChange: (country: CountryCode) => void;
    /** Text typed into the city search. */
    query: string;
    onQueryChange: (query: string) => void;
    options: PlaceOption[];
    loading?: boolean;
    /** The search request failed (network, server). */
    failed?: boolean;
    selected: PlaceOption | null;
    onSelect: (place: PlaceOption) => void;
    /** Already-translated error message. */
    error?: string;
    /** Start with the city list open (for previews). */
    defaultOpen?: boolean;
    /** Minimum characters before searching; shown as a hint until reached. */
    minQueryLength?: number;
    /** Replaces the default hint (which talks about the user's own city). */
    hint?: string;
    /** Replaces "Choose your city" on the button while no city is chosen. */
    placeholder?: string;
}

/**
 * Country select (hidden while only one country is supported) + type-ahead
 * city picker. Submits `country` and `placeId` as hidden inputs. Purely presentational: searching is the caller's job.
 */
export function LocationField({
    countries,
    country,
    onCountryChange,
    query,
    onQueryChange,
    options,
    loading = false,
    failed = false,
    selected,
    onSelect,
    error,
    defaultOpen = false,
    minQueryLength = 2,
    hint,
    placeholder,
}: LocationFieldProps) {
    const t = useTranslations('LocationField');
    const [open, setOpen] = useState(defaultOpen);
    const tooShort = query.trim().length < minQueryLength;

    let status: string | null = null;
    if (tooShort) status = t('typeMore');
    else if (failed) status = t('failed');
    else if (loading && options.length === 0) status = t('searching');

    return (
        <>
            <input type="hidden" name="country" value={country} />
            <input type="hidden" name="placeId" value={selected?.id ?? ''} />

            {/* Only a choice once there's more than one country to pick. */}
            {countries.length > 1 && (
                <Field>
                    <FieldLabel htmlFor="country">{t('country')}</FieldLabel>
                    <select
                        id="country"
                        value={country}
                        onChange={(event) =>
                            onCountryChange(event.target.value as CountryCode)
                        }
                        className="h-8 w-full rounded-lg border border-control bg-transparent px-2.5 text-sm dark:bg-input/30"
                    >
                        {countries.map(({ code, name }) => (
                            <option key={code} value={code}>
                                {name}
                            </option>
                        ))}
                    </select>
                </Field>
            )}

            <Field data-invalid={!!error}>
                <FieldLabel htmlFor="placeId-trigger">{t('city')}</FieldLabel>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id="placeId-trigger"
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            aria-invalid={error ? true : undefined}
                            aria-describedby={
                                error ? 'placeId-error' : undefined
                            }
                            className={cn(
                                'w-full justify-between font-normal',
                                !selected && 'text-muted-foreground'
                            )}
                        >
                            {selected?.label ?? placeholder ?? t('choose')}
                            <ChevronsUpDownIcon
                                aria-hidden
                                className="opacity-50"
                            />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-(--radix-popover-trigger-width) p-0"
                        align="start"
                    >
                        {/* Results come from the server, so cmdk's own filtering is off. */}
                        <Command shouldFilter={false}>
                            <CommandInput
                                value={query}
                                onValueChange={onQueryChange}
                                placeholder={t('search')}
                            />
                            <CommandList aria-busy={loading}>
                                {status ? (
                                    <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                        {status}
                                    </p>
                                ) : (
                                    <CommandEmpty>{t('empty')}</CommandEmpty>
                                )}
                                {!tooShort &&
                                    options.map((option) => (
                                        <CommandItem
                                            key={option.id}
                                            value={option.id}
                                            onSelect={() => {
                                                onSelect(option);
                                                setOpen(false);
                                            }}
                                        >
                                            {option.label}
                                            <CheckIcon
                                                aria-hidden
                                                className={cn(
                                                    'ml-auto',
                                                    selected?.id === option.id
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
                {error ? (
                    <FieldError id="placeId-error">{error}</FieldError>
                ) : (
                    <FieldDescription>
                        {hint ?? t('hint')}{' '}
                        <a
                            href="https://www.geonames.org/"
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-2"
                        >
                            {t('attribution')}
                        </a>
                    </FieldDescription>
                )}
            </Field>
        </>
    );
}
