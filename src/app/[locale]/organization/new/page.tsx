import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import {
    CreateOrganizationPage,
    CreateOrganizationPageLoading,
} from '@/components/pages/create-organization-page';
import { isPlatformAdmin } from '@/lib/auth/platform-admin';
import { requireAccount } from '@/lib/auth/require-account';
import { isSupportedCountry } from '@/lib/places/types';
import { NEW_ORGANIZATION_PATH } from '@/lib/paths';

import { CreateOrganizationFormContainer } from './create-organization-form-container';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Organizations');
    return { title: t('new.metaTitle'), robots: { index: false } };
}

type Props = PageProps<'/[locale]/organization/new'>;

export default function Page({ searchParams }: Props) {
    return (
        <Suspense fallback={<CreateOrganizationPageLoading />}>
            <CreateOrganizationContainer searchParams={searchParams} />
        </Suspense>
    );
}

async function CreateOrganizationContainer({
    searchParams,
}: Pick<Props, 'searchParams'>) {
    const { user, profile } = await requireAccount(NEW_ORGANIZATION_PATH);
    const { location } = profile;
    // Super users can add unclaimed organizations; /admin links here with ?unclaimed=1.
    const unclaimedOption = isPlatformAdmin(user.uid)
        ? { checked: (await searchParams).unclaimed === '1' }
        : undefined;
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
                    unclaimedOption={unclaimedOption}
                />
            }
        />
    );
}
