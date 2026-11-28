'use client';

import { useLocale } from 'next-intl';
import { useState, useTransition } from 'react';

import { OrganizationFilters } from '@/components/organisms/organization-filters';
import { FindOrganizationsPage } from '@/components/pages/find-organizations-page';
import { useLocationPicker } from '@/hooks/use-location-picker';
import { useRouter } from '@/i18n/navigation';
import { languageName } from '@/lib/organizations/client';
import {
    activeFilterCount,
    directoryFilterParams,
    directoryHref,
    parseDirectorySearch,
    type DirectoryResults,
    type DirectorySearch,
} from '@/lib/organizations/directory';
import { ORG_LANGUAGES } from '@/lib/organizations/options';
import type { PlaceOption } from '@/lib/places/types';
import { findPath } from '@/lib/paths';

/**
 * Wires /find/organizations: every filter change replaces the URL (so a search can be
 * shared), the server re-renders the results, and the old ones dim meanwhile.
 */
export function FindContainer({
    search,
    place,
    results,
    canCreate,
}: {
    search: DirectorySearch;
    place: PlaceOption | null;
    results: DirectoryResults | null;
    canCreate: boolean;
}) {
    const locale = useLocale();
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const picker = useLocationPicker({
        locale,
        country: search.country,
        selected: place,
    });

    // Next keeps this page alive (hidden) between visits, DOM included, and
    // the filter checkboxes are uncontrolled. So when the search changes from
    // outside the form (the homepage search, back/forward, a link), remount
    // the form and reset the city so they match the URL again. Searches the
    // form made itself (`ownSearches`, newest last) are left alone, so
    // focus stays put while people click.
    const searchKey = keyOf(search);
    const [shownKey, setShownKey] = useState(searchKey);
    const [ownSearches, setOwnSearches] = useState<string[]>([]);
    const [formKey, setFormKey] = useState(0);
    if (searchKey !== shownKey) {
        setShownKey(searchKey);
        const own = ownSearches.indexOf(searchKey);
        if (own === -1) {
            setOwnSearches([]);
            setFormKey((key) => key + 1);
            if (place) picker.onSelect(place);
        } else {
            setOwnSearches(ownSearches.slice(own + 1));
        }
    }
    // The path for a city id: the one just chosen, or the one on the page.
    const slugFor = (id?: string) =>
        id === picker.selected?.id
            ? picker.selected?.slug
            : id === place?.id
              ? place?.slug
              : undefined;
    // The city goes in the path (/find/organizations/us/ca/oakland), filters in the query.
    // `slug` is passed when the city was just chosen (the picker's state
    // hasn't updated yet). Without a known path, the old ?placeId= form
    // lets the server redirect to it.
    const go = (next: DirectorySearch, slug = slugFor(next.placeId)) => {
        setOwnSearches((keys) => [...keys.slice(-9), keyOf(next)]);
        let href: string;
        if (!next.placeId) {
            href = directoryHref(next);
        } else if (slug) {
            href = directoryHref(next, slug);
        } else {
            const query = new URLSearchParams({
                country: next.country,
                placeId: next.placeId,
            });
            for (const [key, value] of directoryFilterParams(next))
                query.append(key, value);
            href = `${findPath('organizations')}?${query}`;
        }
        startTransition(() => router.replace(href, { scroll: false }));
    };
    const location = {
        ...picker,
        onSelect: (next: PlaceOption) => {
            picker.onSelect(next);
            go(
                { ...search, country: picker.country, placeId: next.id },
                next.slug
            );
        },
    };

    return (
        <FindOrganizationsPage
            filters={
                <OrganizationFilters
                    key={formKey}
                    action={`/${locale}${findPath('organizations')}`}
                    search={search}
                    activeFilters={activeFilterCount(search)}
                    location={location}
                    languageOptions={ORG_LANGUAGES.map((code) => ({
                        value: code,
                        label: languageName(code, locale),
                    }))}
                    onFiltersChange={(form) => {
                        const data = new FormData(form);
                        const text = (key: string) =>
                            (data.get(key) as string | null) ?? undefined;
                        const list = (key: string) =>
                            data.getAll(key) as string[];
                        const next = parseDirectorySearch({
                            country: text('country'),
                            placeId: text('placeId'),
                            radius: text('radius'),
                            focusAreas: list('focusAreas'),
                            languages: list('languages'),
                            reach: list('reach'),
                        });
                        // Typing in the city box changes the form too, but
                        // not the search: nothing to load until a city or
                        // filter actually changes.
                        if (sameSearch(next, search)) return;
                        go(next);
                    }}
                />
            }
            results={results}
            cityLabel={place?.label}
            radiusMiles={search.radiusMiles}
            reach={search.reach}
            pending={pending}
            canCreate={canCreate}
        />
    );
}

/** Same city and same filters: the URL wouldn't change. */
const sameSearch = (a: DirectorySearch, b: DirectorySearch) =>
    a.country === b.country &&
    a.placeId === b.placeId &&
    directoryFilterParams(a).toString() === directoryFilterParams(b).toString();

/** One string per search: city and filters, as in the URL. */
const keyOf = (search: DirectorySearch) =>
    `${search.country}/${search.placeId ?? ''}?${directoryFilterParams(search)}`;
