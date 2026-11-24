import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import {
    ClaimOrganizationPage,
    ClaimOrganizationPageLoading,
} from '@/components/pages/claim-organization-page';
import { requireAccount } from '@/lib/auth/require-account';
import { getOrganizationByHandleFresh } from '@/lib/organizations';
import { getClaimRequestFresh } from '@/lib/organizations/claim-store';
import { claimPageState } from '@/lib/organizations/claims';
import { handleProblem } from '@/lib/organizations/handle';
import { redirect } from '@/i18n/navigation';

import { cancelClaimAction } from './actions';
import { ClaimFormContainer } from './claim-form-container';

type Props = PageProps<'/[locale]/org/[handle]/claim'>;

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Claim');
    return { title: t('metaTitle'), robots: { index: false } };
}

// Signed in, for unclaimed organizations only. Streams behind <Suspense>.
export default function Page({ params }: Props) {
    return (
        <Suspense fallback={<ClaimOrganizationPageLoading />}>
            <ClaimContainer params={params} />
        </Suspense>
    );
}

async function ClaimContainer({ params }: Pick<Props, 'params'>) {
    const handle = decodeURIComponent((await params).handle).toLowerCase();
    if (handleProblem(handle)) notFound();
    const { user } = await requireAccount(`/org/${handle}/claim`);
    const locale = await getLocale();
    const org = await getOrganizationByHandleFresh(handle);
    if (!org) notFound();
    // Claimed already: nothing to ask for here.
    if (!org.unclaimed) return redirect({ href: `/org/${handle}`, locale });

    const [request, format] = await Promise.all([
        getClaimRequestFresh(org.id, user.uid),
        getFormatter(),
    ]);
    const state = claimPageState(request);
    return (
        <ClaimOrganizationPage
            name={org.name}
            handle={org.handle}
            orgId={org.id}
            locale={locale}
            state={state}
            pendingIntent={request?.intent}
            pendingSince={
                request?.requestedAt
                    ? format.dateTime(new Date(request.requestedAt), {
                          dateStyle: 'medium',
                      })
                    : undefined
            }
            cancelAction={cancelClaimAction}
            form={
                <ClaimFormContainer
                    name={org.name}
                    orgId={org.id}
                    handle={org.handle}
                />
            }
        />
    );
}
