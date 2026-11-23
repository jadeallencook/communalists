import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { OrganizationMembersPageLoading } from '@/components/pages/organization-members-page';
import { requireAccount } from '@/lib/auth/require-account';
import {
    getMembershipFresh,
    getModerationLog,
    getOrganizationByHandle,
    getOrganizationByHandleFresh,
    getOrgPeople,
} from '@/lib/organizations';
import { handleProblem } from '@/lib/organizations/handle';
import { canActOn, isStaff, sortMembers } from '@/lib/organizations/membership';
import { redirect } from '@/i18n/navigation';

import { MembersContainer } from './members-container';

type Props = PageProps<'/[locale]/org/[handle]/members'>;

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Membership');
    return { title: t('manageTitle'), robots: { index: false } };
}

// Owners and moderators only. Reads the session, so it streams behind <Suspense>.
export default function Page({ params }: Props) {
    return (
        <Suspense fallback={<OrganizationMembersPageLoading />}>
            <MembersServerContainer params={params} />
        </Suspense>
    );
}

async function MembersServerContainer({ params }: Pick<Props, 'params'>) {
    const handle = decodeURIComponent((await params).handle).toLowerCase();
    if (handleProblem(handle)) notFound();
    const { user } = await requireAccount(`/org/${handle}/members`);
    const org =
        (await getOrganizationByHandle(handle)) ??
        (await getOrganizationByHandleFresh(handle));
    if (!org) notFound();

    // Access decision: fresh. Everyone else goes back to the public page.
    const membership = await getMembershipFresh(org.id, user.uid);
    const role = membership?.status === 'active' ? membership.role : null;
    const locale = await getLocale();
    if (!isStaff(role)) return redirect({ href: `/org/${handle}`, locale });

    const [people, log] = await Promise.all([
        getOrgPeople(org.id),
        getModerationLog(org.id),
    ]);
    const oldestFirst = (a: { since?: number }, b: { since?: number }) =>
        (a.since ?? 0) - (b.since ?? 0);

    return (
        <MembersContainer
            orgId={org.id}
            name={org.name}
            handle={org.handle}
            requests={people
                .filter((p) => p.status === 'pending')
                .sort(oldestFirst)
                .map(({ uid, displayName, since }) => ({
                    uid,
                    displayName,
                    since,
                }))}
            members={sortMembers(
                people.filter((p) => p.status === 'active'),
                locale
            ).map(({ uid, displayName, since, role: theirs }) => ({
                uid,
                displayName,
                since,
                role: theirs,
                canAct: uid !== user.uid && canActOn(role, theirs),
            }))}
            banned={people
                .filter((p) => p.status === 'banned')
                .sort(oldestFirst)
                .map(({ uid, displayName, since, banReason }) => ({
                    uid,
                    displayName,
                    since,
                    reason: banReason,
                }))}
            log={log}
        />
    );
}
