'use client';

import { useLocale } from 'next-intl';

import { AccountSetupForm } from '@/components/organisms/account-setup-form';
import { useAccountSetupForm } from '@/hooks/use-account-setup-form';
import { useLocationPicker } from '@/hooks/use-location-picker';
import type { CountryCode, PlaceOption } from '@/lib/places/types';
import { localeNames, routing } from '@/i18n/routing';

import { saveAccountSetup } from './actions';

/** Connects AccountSetupForm to the saveAccountSetup action and city search. */
export function AccountSetupFormContainer({
    next,
    name,
    preferredLocale,
    country,
    place,
}: {
    next: string;
    name?: string;
    preferredLocale?: string;
    country?: CountryCode;
    place?: PlaceOption | null;
}) {
    const locale = useLocale();
    const { state, formAction, pending } =
        useAccountSetupForm(saveAccountSetup);
    const location = useLocationPicker({ locale, country, selected: place });

    return (
        <AccountSetupForm
            state={state}
            formAction={formAction}
            pending={pending}
            locale={locale}
            next={next}
            defaults={{ name, preferredLocale: preferredLocale ?? locale }}
            languages={routing.locales.map((code) => ({
                code,
                name: localeNames[code],
            }))}
            location={location}
        />
    );
}
