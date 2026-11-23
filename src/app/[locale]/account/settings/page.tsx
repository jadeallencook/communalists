import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import {
    AccountSettingsPage,
    AccountSettingsPageLoading,
} from '@/components/pages/account-settings-page';
import { requireAccount } from '@/lib/auth/require-account';
import { isSupportedCountry } from '@/lib/places/types';

import { AccountSettingsFormContainer } from './account-settings-form-container';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('AccountSettings');
    return { title: t('metaTitle'), robots: { index: false } };
}

export default function Page() {
    return (
        <Suspense fallback={<AccountSettingsPageLoading />}>
            <AccountSettingsContainer />
        </Suspense>
    );
}

async function AccountSettingsContainer() {
    const { user, profile } = await requireAccount('/account/settings');
    const { location } = profile;
    return (
        <AccountSettingsPage
            email={user.email}
            form={
                <AccountSettingsFormContainer
                    name={profile.displayName}
                    preferredLocale={profile.locale}
                    country={
                        isSupportedCountry(location.country)
                            ? location.country
                            : undefined
                    }
                    place={{ id: location.placeId, label: location.label }}
                />
            }
        />
    );
}
