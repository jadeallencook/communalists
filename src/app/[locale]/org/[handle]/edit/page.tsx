import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import {
    EditOrganizationPage,
    EditOrganizationPageLoading,
} from '@/components/pages/edit-organization-page';
import { isPlatformAdmin } from '@/lib/auth/platform-admin';
import { requireAccount } from '@/lib/auth/require-account';
import {
    getMembershipFresh,
    getOrganizationByHandleFresh,
} from '@/lib/organizations';
import { handleProblem, nextHandleChangeAt } from '@/lib/organizations/handle';
import { isStaff } from '@/lib/organizations/membership';
import { effectiveRole } from '@/lib/platform-admin';
import { isSupportedCountry } from '@/lib/places/types';
import { redirect } from '@/i18n/navigation';

import { EditOrganizationFormContainer } from './edit-organization-form-container';

type Props = PageProps<'/[locale]/org/[handle]/edit'>;

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Organizations');
    return { title: t('edit.metaTitle'), robots: { index: false } };
}

// Owners and moderators. Reads the session, so it streams behind <Suspense>.
export default function Page({ params }: Props) {
    return (
        <Suspense fallback={<EditOrganizationPageLoading />}>
            <EditServerContainer params={params} />
        </Suspense>
    );
}

async function EditServerContainer({ params }: Pick<Props, 'params'>) {
    const handle = decodeURIComponent((await params).handle).toLowerCase();
    if (handleProblem(handle)) notFound();
    const { user } = await requireAccount(`/org/${handle}/edit`);
    // Fresh: the form must start from what's saved now, not a cached copy.
    const org = await getOrganizationByHandleFresh(handle);
    if (!org) notFound();

    const [membership, locale, t, format] = await Promise.all([
        getMembershipFresh(org.id, user.uid),
        getLocale(),
        getTranslations('Organizations'),
        getFormatter(),
    ]);
    // On an unclaimed organization, super users act as owners.
    const role = effectiveRole(
        membership?.status === 'active' ? membership.role : null,
        org,
        isPlatformAdmin(user.uid)
    );
    if (!isStaff(role)) return redirect({ href: `/org/${handle}`, locale });

    const nextChange = nextHandleChangeAt(org.handleChangedAt);
    const handleLockedReason =
        role !== 'owner'
            ? t('edit.handleOwnersOnly')
            : nextChange
              ? t('edit.handleCooldown', {
                    date: format.dateTime(new Date(nextChange), {
                        dateStyle: 'medium',
                    }),
                })
              : undefined;

    return (
        <EditOrganizationPage
            name={org.name}
            handle={org.handle}
            form={
                <EditOrganizationFormContainer
                    handleLockedReason={handleLockedReason}
                    org={{
                        id: org.id,
                        name: org.name,
                        handle: org.handle,
                        focusAreas: org.focusAreas,
                        country: isSupportedCountry(org.location.country)
                            ? org.location.country
                            : undefined,
                        place: {
                            id: org.location.placeId,
                            label: org.location.label,
                        },
                        reach: org.reach.scope,
                        socials: org.socials,
                        values: {
                            description: org.description,
                            radiusMiles: String(org.reach.radiusMiles ?? 25),
                            languages: org.languages,
                            website: org.website ?? '',
                            contactEmail: org.contactEmail ?? '',
                            joinPolicy: org.joinPolicy,
                            visibility: org.visibility,
                            memberListVisibility: org.memberListVisibility,
                        },
                    }}
                />
            }
        />
    );
}
