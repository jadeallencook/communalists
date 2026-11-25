import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { Suspense } from 'react';

import {
    OrganizationPage,
    OrganizationPageLoading,
} from '@/components/pages/organization-page';
import { isPlatformAdmin } from '@/lib/auth/platform-admin';
import { getSessionUser } from '@/lib/auth/session';
import {
    getMembershipFresh,
    getOrganizationByHandle,
    getOrganizationByHandleFresh,
    getOrgPeople,
} from '@/lib/organizations';
import {
    isStaff,
    joinState,
    sortMembers,
    visibleMembers,
} from '@/lib/organizations/membership';
import { handleProblem } from '@/lib/organizations/handle';
import { phoneForDisplay } from '@/lib/phone';
import { redirect } from '@/i18n/navigation';

import { JoinPanelContainer } from './join-panel-container';

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

    const profile = {
        name: org.name,
        handle: org.handle,
        focusAreas: org.focusAreas,
        description: org.description,
        place: org.location.label,
        reach: org.reach,
        languages: org.languages,
        memberCount: org.memberCount,
        streetAddress: org.streetAddress,
        website: org.website,
        contactEmail: org.contactEmail,
        phone: phoneForDisplay(org.phone) ?? undefined,
        foundedYear: org.foundedYear,
        socials: org.socials,
        unlisted: org.visibility === 'unlisted',
    };
    const user = await getSessionUser();

    // Unclaimed: no members, no joining. Super users manage it as owners.
    if (org.unclaimed) {
        return (
            <OrganizationPage
                role={null}
                join={null}
                members={{
                    people: [],
                    total: 0,
                    setting: org.memberListVisibility,
                    viewerIsMember: false,
                }}
                profile={profile}
                unclaimed={{ canManage: isPlatformAdmin(user?.uid) }}
            />
        );
    }

    // Members-only content is an access decision: always a fresh read.
    const [membership, people, locale] = await Promise.all([
        user ? getMembershipFresh(org.id, user.uid) : null,
        getOrgPeople(org.id),
        getLocale(),
    ]);
    const role = membership?.status === 'active' ? membership.role : null;

    // Requests and bans are staff-only: only active members leave this function.
    const active = sortMembers(
        people.filter((p) => p.status === 'active'),
        locale
    );
    const named =
        visibleMembers(org.memberListVisibility, role) === 'everyone'
            ? active
            : active.filter((p) => p.role !== 'member');

    return (
        <OrganizationPage
            role={role}
            join={
                <JoinPanelContainer
                    state={joinState(!!user, org.joinPolicy, membership)}
                    orgId={org.id}
                    handle={org.handle}
                    name={org.name}
                />
            }
            members={{
                people: named.map(({ uid, displayName, username, role }) => ({
                    uid,
                    displayName,
                    username,
                    role,
                })),
                total: active.length,
                setting: org.memberListVisibility,
                viewerIsMember: !!role,
            }}
            pendingRequests={
                isStaff(role)
                    ? people.filter((p) => p.status === 'pending').length
                    : 0
            }
            profile={{ ...profile, memberCount: active.length }}
        />
    );
}
