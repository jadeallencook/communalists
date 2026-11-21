'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';

import { SignUpForm } from '@/components/organisms/sign-up-form';
import { usePlaceSearch } from '@/hooks/use-place-search';
import { useSignUpForm } from '@/hooks/use-sign-up-form';
import { countryName } from '@/lib/places/client';
import {
    SUPPORTED_COUNTRIES,
    type CountryCode,
    type PlaceOption,
} from '@/lib/places/types';

import { signUp } from './actions';

/** Connects the presentational SignUpForm to the signUp action and place search. */
export function SignUpFormContainer() {
    const locale = useLocale();
    const { state, formAction, pending } = useSignUpForm(signUp);

    const [country, setCountry] = useState<CountryCode>('US');
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<PlaceOption | null>(null);
    const { results, loading, failed } = usePlaceSearch(country, query);

    return (
        <SignUpForm
            state={state}
            formAction={formAction}
            pending={pending}
            locale={locale}
            location={{
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
            }}
        />
    );
}
