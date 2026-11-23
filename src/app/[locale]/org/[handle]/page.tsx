import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { Suspense } from 'react';

import {
    OrganizationPage,
    OrganizationPageLoading,
} from '@/components/pages/organization-page';
import { getSessionUser } from '@/lib/auth/session';
import {
    getMembershipFresh,
    getOrganizationByHandle,
    getOrganizationByHandleFresh,
} from '@/lib/organizations';
import { handleProblem } from '@/lib/organizations/handle';
import { redirect } from '@/i18n/navigation';

type Props = PageProps<'/[locale]/org/[handle]'>;

/** Cached lookup; a miss is confirmed fresh (it may have just been created on another instance). */
async function findOrganization(raw: string) {
    const handle = decodeURIComponent(raw).toLowerCase();
    if (handleProblem(handle)) return { handle, org: null };
    const org =
        (await getOrganizationByHandle(handle)) ??
        (await getOrganizationByHandleFresh(handle));
    return { handle, org };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { org } = await findOrganization((await params).handle);
    if (!org) return {};
    return {
        title: org.name,
        description: org.description.slice(0, 160) || undefined,
        // Unlisted groups don't want to be found; keep them out of search engines too.
        robots:
            org.visibility === 'unlisted'
                ? { index: false, follow: false }
                : undefined,
    };
}

// The handle and membership are per request, so they stream behind <Suspense>.
export default function Page({ params }: Props) {
    return (
        <Suspense fallback={<OrganizationPageLoading />}>
            <OrganizationContainer params={params} />
        </Suspense>
    );
}

async function OrganizationContainer({ params }: Pick<Props, 'params'>) {
    const raw = (await params).handle;
    const { handle, org } = await findOrganization(raw);
    if (!org) notFound();
    if (raw !== handle) {
        return redirect({ href: `/org/${handle}`, locale: await getLocale() });
    }

    // Members-only content is an access decision: always a fresh read.
    const user = await getSessionUser();
    const membership = user ? await getMembershipFresh(org.id, user.uid) : null;
    const role = membership?.status === 'active' ? membership.role : null;

    return (
        <OrganizationPage
            role={role}
            profile={{
                name: org.name,
                handle: org.handle,
                focusAreas: org.focusAreas,
                description: org.description,
                place: org.location.label,
                reach: org.reach,
                languages: org.languages,
                memberCount: org.memberCount,
                website: org.website,
                contactEmail: org.contactEmail,
                socials: org.socials,
                unlisted: org.visibility === 'unlisted',
            }}
        />
    );
}
