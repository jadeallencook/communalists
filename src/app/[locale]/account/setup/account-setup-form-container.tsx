'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';

import { AccountSetupForm } from '@/components/organisms/account-setup-form';
import { useAccountSetupForm } from '@/hooks/use-account-setup-form';
import { useHandleAvailability } from '@/hooks/use-handle-availability';
import { useLocationPicker } from '@/hooks/use-location-picker';
import { fetchUsernameAvailability } from '@/lib/organizations/client';
import { suggestHandle } from '@/lib/organizations/handle';
import type { CountryCode, PlaceOption } from '@/lib/places/types';
import { localeNames, routing } from '@/i18n/routing';

import { saveAccountSetup } from './actions';

/** Connects AccountSetupForm to the saveAccountSetup action, city search, and a username suggested from the name. */
export function AccountSetupFormContainer({
    next,
    name,
    preferredLocale,
    country,
    place,
    username: savedUsername,
}: {
    next: string;
    name?: string;
    /** Already chosen (rare in setup), else suggested from the name. */
    username?: string;
    preferredLocale?: string;
    country?: CountryCode;
    place?: PlaceOption | null;
}) {
    const locale = useLocale();
    const { state, formAction, pending } =
        useAccountSetupForm(saveAccountSetup);
    const location = useLocationPicker({ locale, country, selected: place });
    const [username, setUsername] = useState(
        savedUsername ?? suggestHandle(name ?? '')
    );
    const [usernameEdited, setUsernameEdited] = useState(!!savedUsername);
    const usernameStatus = useHandleAvailability(username, {
        check: fetchUsernameAvailability,
        current: savedUsername,
    });

    return (
        <AccountSetupForm
            onNameChange={(next) => {
                if (!usernameEdited) setUsername(suggestHandle(next));
            }}
            username={username}
            onUsernameChange={(next) => {
                setUsernameEdited(next !== '');
                setUsername(next);
            }}
            usernameStatus={usernameStatus}
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
