'use client';

import {
    ChevronDownIcon,
    ChevronRightIcon,
    MinusIcon,
    PlusIcon,
    SlidersHorizontalIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useRef, useState, type FormEvent } from 'react';

import { Button } from '@/components/atoms/button';
import { Field, FieldLabel } from '@/components/atoms/field';
import {
    LocationField,
    type LocationFieldProps,
} from '@/components/molecules/location-field';
import {
    FEATURED_FOCUS_AREAS,
    focusAreasByUse,
    RADIUS_MILES,
    REACH_SCOPES,
} from '@/lib/organizations/options';
import type { DirectorySearch } from '@/lib/organizations/directory';
import { cn } from '@/lib/utils';

export interface OrganizationFiltersProps {
    /** Where the form submits (GET) without JavaScript: the /find page. */
    action: string;
    /** The search shown, from the URL. */
    search: DirectorySearch;
    /** The city picker, from useLocationPicker. */
    location: Omit<LocationFieldProps, 'error' | 'hint'>;
    /** Languages to offer, already named in the UI language. */
    languageOptions: { value: string; label: string }[];
    /** How many filters narrow the search (activeFilterCount), for the mobile Filters button. */
    activeFilters: number;
    /** Start with the filters shown on small screens (for previews). */
    defaultOpen?: boolean;
    /** Called whenever a filter changes, with the form's current values. */
    onFiltersChange?: (form: HTMLFormElement) => void;
}

const selectClass =
    'h-8 w-full rounded-lg border border-control bg-transparent px-2.5 text-sm dark:bg-input/30';

const chipClass =
    'rounded-full border px-2.5 py-1 text-sm transition-colors select-none hover:bg-muted';

/**
 * One filter as toggle chips (native checkboxes). With `shown`, only that
 * many show at first, followed by a "+ N more" chip that reveals the rest in
 * the same row; it starts open when a hidden one is chosen.
 */
function Chips({
    name,
    options,
    checked,
    shown,
    more,
}: {
    name: string;
    options: { value: string; label: string }[];
    checked: string[];
    shown?: number;
    /** Labels for the show-more chip, needed with `shown`. It sits inside the
        filter's fieldset, so screen readers hear the filter's name with it. */
    more?: {
        label: (count: number) => string;
        fewer: string;
    };
}) {
    const limit = shown ?? options.length;
    const hiddenChosen = options
        .slice(limit)
        .some((option) => checked.includes(option.value));
    const [expanded, setExpanded] = useState(hiddenChosen);
    const firstHidden = useRef<HTMLInputElement>(null);
    const listId = useId();
    const extra = options.length - limit;

    return (
        <div id={listId} className="flex flex-wrap gap-1.5">
            {options.map((option, i) => (
                <label
                    key={option.value}
                    // Hidden, not removed, so a chosen one still submits.
                    hidden={!expanded && i >= limit}
                    className={cn(
                        chipClass,
                        'cursor-pointer border-control has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring'
                    )}
                >
                    <input
                        ref={i === limit ? firstHidden : undefined}
                        type="checkbox"
                        name={name}
                        value={option.value}
                        defaultChecked={checked.includes(option.value)}
                        className="sr-only"
                    />
                    {option.label}
                </label>
            ))}
            {extra > 0 && more && (
                <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={listId}
                    onClick={() => {
                        const next = !expanded;
                        setExpanded(next);
                        // Opening: go to the first new chip, not the end of the list.
                        if (next)
                            requestAnimationFrame(() =>
                                firstHidden.current?.focus()
                            );
                    }}
                    className={cn(
                        chipClass,
                        'flex items-center gap-1 border-dashed border-control text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
                    )}
                >
                    {expanded ? (
                        <MinusIcon aria-hidden className="size-3.5" />
                    ) : (
                        <PlusIcon aria-hidden className="size-3.5" />
                    )}
                    {expanded ? more.fewer : more.label(extra)}
                </button>
            )}
        </div>
    );
}

/** A filter group that folds away; open when something in it is chosen. */
function Group({
    title,
    count,
    children,
}: {
    title: string;
    /** How many are chosen: a badge, and the group starts open. */
    count: number;
    children: React.ReactNode;
}) {
    return (
        <details open={count > 0} className="group flex flex-col gap-2">
            <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-md text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                <ChevronRightIcon
                    aria-hidden
                    className="size-4 text-muted-foreground transition-transform group-open:rotate-90 motion-reduce:transition-none"
                />
                {title}
                {count > 0 && (
                    <span className="rounded-full bg-muted px-1.5 text-xs text-foreground">
                        {count}
                    </span>
                )}
            </summary>
            {/* Screen readers still hear which group a chip is in. */}
            <fieldset className="pt-2">
                <legend className="sr-only">{title}</legend>
                {children}
            </fieldset>
        </details>
    );
}

/**
 * The /find filters: city, distance, kinds of groups, focus areas, languages.
 * No logic: it reports changes. On small screens everything but the city
 * folds behind a Filters button, so results start near the top.
 */
export function OrganizationFilters({
    action,
    search,
    location,
    languageOptions,
    activeFilters,
    defaultOpen = false,
    onFiltersChange,
}: OrganizationFiltersProps) {
    const t = useTranslations('Find');
    const [open, setOpen] = useState(defaultOpen);
    const panelId = useId();
    const tOrg = useTranslations('Organizations');
    const changed = (event: FormEvent<HTMLFormElement>) =>
        onFiltersChange?.(event.currentTarget);
    const narrowed = search.reach.length < REACH_SCOPES.length;

    return (
        <form
            action={action}
            method="get"
            onChange={changed}
            onSubmit={(event) => {
                // With JavaScript, results already follow every change.
                if (onFiltersChange) {
                    event.preventDefault();
                    onFiltersChange(event.currentTarget);
                }
            }}
            className="flex flex-col gap-6"
            aria-label={t('filtersTitle')}
        >
            <LocationField {...location} hint={t('cityHint')} />

            {/* Small screens only; on large ones the filters always show. */}
            <Button
                type="button"
                variant="outline"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen(!open)}
                className="w-full justify-between lg:hidden"
            >
                <span className="flex items-center gap-2">
                    <SlidersHorizontalIcon aria-hidden />
                    {t('filtersTitle')}
                    {activeFilters > 0 && (
                        <>
                            <span
                                aria-hidden
                                className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground"
                            >
                                {activeFilters}
                            </span>
                            <span className="sr-only">
                                {t('filtersOn', { count: activeFilters })}
                            </span>
                        </>
                    )}
                </span>
                <ChevronDownIcon
                    aria-hidden
                    className={cn(
                        'transition-transform motion-reduce:transition-none',
                        open && 'rotate-180'
                    )}
                />
            </Button>

            {/* Hidden, not removed, so the form still submits every filter. */}
            <div
                id={panelId}
                className={cn(
                    'flex-col gap-6',
                    open ? 'flex' : 'hidden lg:flex'
                )}
            >
                <Field>
                    <FieldLabel htmlFor="radius">{t('distance')}</FieldLabel>
                    <select
                        id="radius"
                        name="radius"
                        defaultValue={search.radiusMiles}
                        className={selectClass}
                    >
                        {RADIUS_MILES.map((miles) => (
                            <option key={miles} value={miles}>
                                {t('distanceOption', { miles })}
                            </option>
                        ))}
                    </select>
                </Field>

                {/* Always open: it's the filter people reach for most. The most
                common areas show first, then "+ N more" in the same row. */}
                <fieldset className="flex flex-col gap-2">
                    <legend className="mb-2 text-sm font-medium">
                        {t('focusAreas')}
                    </legend>
                    <Chips
                        name="focusAreas"
                        checked={search.focusAreas}
                        options={focusAreasByUse().map((area) => ({
                            value: area,
                            label: tOrg(`focusAreas.${area}`),
                        }))}
                        shown={FEATURED_FOCUS_AREAS}
                        more={{
                            label: (count) => t('moreFocusAreas', { count }),
                            fewer: t('fewerFocusAreas'),
                        }}
                    />
                </fieldset>

                <Group title={t('languages')} count={search.languages.length}>
                    <Chips
                        name="languages"
                        checked={search.languages}
                        options={languageOptions}
                    />
                </Group>

                {/* Rarely changed, so it's last and folds away; open when narrowed. */}
                <Group
                    title={t('reach')}
                    count={narrowed ? search.reach.length : 0}
                >
                    <Chips
                        name="reach"
                        checked={search.reach}
                        options={REACH_SCOPES.map((scope) => ({
                            value: scope,
                            label: tOrg(`reach.${scope}.label`),
                        }))}
                    />
                </Group>
            </div>

            <noscript>
                <Button type="submit">{t('search')}</Button>
            </noscript>
        </form>
    );
}
