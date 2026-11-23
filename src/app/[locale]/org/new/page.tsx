import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import {
    CreateOrganizationPage,
    CreateOrganizationPageLoading,
} from '@/components/pages/create-organization-page';
import { requireAccount } from '@/lib/auth/require-account';
import { isSupportedCountry } from '@/lib/places/types';

import { CreateOrganizationFormContainer } from './create-organization-form-container';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Organizations');
    return { title: t('new.metaTitle'), robots: { index: false } };
}

export default function Page() {
    return (
        <Suspense fallback={<CreateOrganizationPageLoading />}>
            <CreateOrganizationContainer />
        </Suspense>
    );
}

async function CreateOrganizationContainer() {
    const { profile } = await requireAccount('/org/new');
    const { location } = profile;
    return (
        <CreateOrganizationPage
            form={
                <CreateOrganizationFormContainer
                    // Start at the creator's own city; most groups are local.
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
