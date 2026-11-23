'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';

import { AccountSetupForm } from '@/components/organisms/account-setup-form';
import { useAccountSetupForm } from '@/hooks/use-account-setup-form';
import { useHandleAvailability } from '@/hooks/use-handle-availability';
import { useLocationPicker } from '@/hooks/use-location-picker';
import { fetchUsernameAvailability } from '@/lib/organizations/client';
import type { CountryCode, PlaceOption } from '@/lib/places/types';
import { localeNames, routing } from '@/i18n/routing';

import { saveAccountSettings } from './actions';

/** Connects the profile form, in settings mode, to saveAccountSettings and city search. */
export function AccountSettingsFormContainer({
    name,
    preferredLocale,
    country,
    place,
    username: savedUsername,
    usernameLockedReason,
}: {
    name: string;
    username: string;
    usernameLockedReason?: string;
    preferredLocale: string;
    country?: CountryCode;
    place: PlaceOption;
}) {
    const locale = useLocale();
    const { state, formAction, pending } =
        useAccountSetupForm(saveAccountSettings);
    const location = useLocationPicker({ locale, country, selected: place });
    const [username, setUsername] = useState(savedUsername);
    const usernameStatus = useHandleAvailability(username, {
        check: fetchUsernameAvailability,
        current: savedUsername,
    });

    return (
        <AccountSetupForm
            username={username}
            onUsernameChange={(next) => {
                if (!usernameLockedReason) setUsername(next);
            }}
            usernameStatus={usernameStatus}
            usernameLockedReason={usernameLockedReason}
            mode="settings"
            state={state}
            formAction={formAction}
            pending={pending}
            locale={locale}
            defaults={{ name, preferredLocale }}
            languages={routing.locales.map((code) => ({
                code,
                name: localeNames[code],
            }))}
            location={location}
        />
    );
}
