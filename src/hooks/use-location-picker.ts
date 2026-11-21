'use client';

import { useState } from 'react';

import type { LocationFieldProps } from '@/components/molecules/location-field';
import { countryName } from '@/lib/places/client';
import {
    SUPPORTED_COUNTRIES,
    type CountryCode,
    type PlaceOption,
} from '@/lib/places/types';

import { usePlaceSearch, type PlaceSearchFn } from './use-place-search';

interface Options {
    /** UI locale, for country names. */
    locale: string;
    country?: CountryCode;
    /** A place already on the profile, shown as chosen. */
    selected?: PlaceOption | null;
    /** Defaults to /api/places; pass a mock in Storybook. */
    search?: PlaceSearchFn;
}

/** Everything LocationField needs: country, search text, results and the chosen city. */
export function useLocationPicker({
    locale,
    country: initialCountry = 'US',
    selected: initialSelected = null,
    search,
}: Options): Omit<LocationFieldProps, 'error'> {
    const [country, setCountry] = useState<CountryCode>(initialCountry);
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(initialSelected);
    const { results, loading, failed } = usePlaceSearch(
        country,
        query,
        search ? { search } : undefined
    );

    return {
        countries: SUPPORTED_COUNTRIES.map((code) => ({
            code,
            name: countryName(code, locale),
        })),
        country,
        onCountryChange: (next) => {
            setCountry(next);
            setSelected(null);
            setQuery('');
        },
        query,
        onQueryChange: setQuery,
        options: results,
        loading,
        failed,
        selected,
        onSelect: setSelected,
    };
}
