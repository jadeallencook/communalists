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
import {
    allowedRoleChanges,
    canActOn,
    isStaff,
    sortMembers,
} from '@/lib/organizations/membership';
import { redirect } from '@/i18n/navigation';
import { organizationPath } from '@/lib/paths';
import { getComradeUids } from '@/lib/comrades/store';
import { visiblePhoto } from '@/lib/profiles';

import { MembersContainer } from './members-container';

type Props = PageProps<'/[locale]/organization/[handle]/members'>;

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
    const { user } = await requireAccount(organizationPath(handle, 'members'));
    const org =
        (await getOrganizationByHandle(handle)) ??
        (await getOrganizationByHandleFresh(handle));
    if (!org) notFound();

    // Access decision: fresh. Everyone else goes back to the public page.
    const membership = await getMembershipFresh(org.id, user.uid);
    const role = membership?.status === 'active' ? membership.role : null;
    const locale = await getLocale();
    if (!isStaff(role))
        return redirect({ href: organizationPath(handle), locale });

    const [people, log, comrades] = await Promise.all([
        getOrgPeople(org.id),
        getModerationLog(org.id),
        // Only for photos: if it fails, comrades just see initials.
        getComradeUids(user.uid).catch(() => new Set<string>()),
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
                .map(({ uid, displayName, since, photo, visibility }) => ({
                    uid,
                    displayName,
                    since,
                    // Not in the group yet: shown only if their profile is
                    // public, or they're the viewer's comrade.
                    photo: visiblePhoto(
                        photo,
                        visibility ?? 'name',
                        comrades.has(uid) ? 'comrade' : 'signedIn'
                    ),
                }))}
            members={sortMembers(
                people.filter((p) => p.status === 'active'),
                locale
            ).map(
                ({
                    uid,
                    displayName,
                    since,
                    role: theirs,
                    photo,
                    visibility,
                }) => ({
                    uid,
                    displayName,
                    since,
                    photo: visiblePhoto(
                        photo,
                        visibility ?? 'name',
                        uid === user.uid
                            ? 'self'
                            : comrades.has(uid)
                              ? 'comrade'
                              : 'groupmate'
                    ),
                    role: theirs,
                    canAct: uid !== user.uid && canActOn(role, theirs),
                    roleChanges:
                        uid === user.uid
                            ? []
                            : allowedRoleChanges(role, theirs),
                })
            )}
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
