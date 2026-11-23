import { ChevronRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { FormEvent } from 'react';

import { Button } from '@/components/atoms/button';
import { Field, FieldLabel } from '@/components/atoms/field';
import {
    LocationField,
    type LocationFieldProps,
} from '@/components/molecules/location-field';
import {
    OFFERED_FOCUS_AREAS,
    RADIUS_MILES,
    REACH_SCOPES,
} from '@/lib/organizations/options';
import type { DirectorySearch } from '@/lib/organizations/directory';

export interface OrganizationFiltersProps {
    /** Where the form submits (GET) without JavaScript: the /find page. */
    action: string;
    /** The search shown, from the URL. */
    search: DirectorySearch;
    /** The city picker, from useLocationPicker. */
    location: Omit<LocationFieldProps, 'error' | 'hint'>;
    /** Languages to offer, already named in the UI language. */
    languageOptions: { value: string; label: string }[];
    /** Called whenever a filter changes, with the form's current values. */
    onFiltersChange?: (form: HTMLFormElement) => void;
}

const selectClass =
    'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30';

/** One filter as toggle chips (native checkboxes, so it works without JavaScript). */
function Chips({
    name,
    options,
    checked,
}: {
    name: string;
    options: { value: string; label: string }[];
    checked: string[];
}) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {options.map((option) => (
                <label
                    key={option.value}
                    className="cursor-pointer rounded-full border px-2.5 py-1 text-sm transition-colors select-none hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
                >
                    <input
                        type="checkbox"
                        name={name}
                        value={option.value}
                        defaultChecked={checked.includes(option.value)}
                        className="sr-only"
                    />
                    {option.label}
                </label>
            ))}
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
    count: number;
    children: React.ReactNode;
}) {
    return (
        <details open={count > 0} className="group flex flex-col gap-2">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
                <ChevronRightIcon
                    aria-hidden
                    className="size-4 text-muted-foreground transition-transform group-open:rotate-90"
                />
                {title}
                {count > 0 && (
                    <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
                        {count}
                    </span>
                )}
            </summary>
            <div className="pt-2">{children}</div>
        </details>
    );
}

/** The /find filters: city, distance, kinds of groups, focus areas, languages. No logic: it reports changes. */
export function OrganizationFilters({
    action,
    search,
    location,
    languageOptions,
    onFiltersChange,
}: OrganizationFiltersProps) {
    const t = useTranslations('Find');
    const tOrg = useTranslations('Organizations');
    const changed = (event: FormEvent<HTMLFormElement>) =>
        onFiltersChange?.(event.currentTarget);

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

            <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-medium">
                    {t('reach')}
                </legend>
                <Chips
                    name="reach"
                    checked={search.reach}
                    options={REACH_SCOPES.map((scope) => ({
                        value: scope,
                        label: tOrg(`reach.${scope}.label`),
                    }))}
                />
            </fieldset>

            <Group title={t('focusAreas')} count={search.focusAreas.length}>
                <Chips
                    name="focusAreas"
                    checked={search.focusAreas}
                    options={OFFERED_FOCUS_AREAS.map((area) => ({
                        value: area,
                        label: tOrg(`focusAreas.${area}`),
                    }))}
                />
            </Group>

            <Group title={t('languages')} count={search.languages.length}>
                <Chips
                    name="languages"
                    checked={search.languages}
                    options={languageOptions}
                />
            </Group>

            <noscript>
                <Button type="submit">{t('search')}</Button>
            </noscript>
        </form>
    );
}
