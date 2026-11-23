import { LockIcon, UsersIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Button } from '@/components/atoms/button';
import {
    MemberList,
    type MemberListProps,
} from '@/components/organisms/member-list';
import { Link } from '@/i18n/navigation';

import {
    OrganizationProfile,
    type OrganizationProfileProps,
} from '@/components/organisms/organization-profile';
import { Skeleton } from '@/components/atoms/skeleton';

export interface OrganizationPageProps {
    profile: OrganizationProfileProps;
    /** The viewer's role when they're an active member; null for everyone else. */
    role: 'owner' | 'moderator' | 'member' | null;
    /** The join area (JoinPanel, wired by a container). */
    join: ReactNode;
    members: MemberListProps;
    /** Owners and moderators: open requests, shown on the Manage members link. */
    pendingRequests?: number;
}

const roleKey = {
    owner: 'roleOwner',
    moderator: 'roleModerator',
    member: 'roleMember',
} as const;

/** /org/{handle}: the public profile, plus a members' space for members. */
export function OrganizationPage({
    profile,
    role,
    join,
    members,
    pendingRequests = 0,
}: OrganizationPageProps) {
    const t = useTranslations('Organizations');
    const tm = useTranslations('Membership');
    const staff = role === 'owner' || role === 'moderator';
    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-12">
            <OrganizationProfile {...profile} />
            {/* Visitors: Join / Ask to join. Members: Leave, inside their space. */}
            {!role && join}
            {role && (
                <section className="flex flex-col gap-2 rounded-lg border p-5">
                    <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
                        <LockIcon aria-hidden className="size-4" />
                        {t('page.membersTitle')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {t('page.membersBody', {
                            role: t(`page.${roleKey[role]}`),
                        })}
                    </p>
                    {staff && (
                        <Button
                            asChild
                            variant="outline"
                            className="mt-2 self-start"
                        >
                            <Link href={`/org/${profile.handle}/members`}>
                                <UsersIcon aria-hidden />
                                {tm('manage')}
                                {pendingRequests > 0 && (
                                    <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                                        {tm('requestCount', {
                                            count: pendingRequests,
                                        })}
                                    </span>
                                )}
                            </Link>
                        </Button>
                    )}
                    <div className="mt-2 border-t pt-3">{join}</div>
                </section>
            )}
            <MemberList {...members} />
        </section>
    );
}

/** Shown while the organization loads. */
export function OrganizationPageLoading() {
    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
            <div className="flex items-start gap-4">
                <Skeleton className="size-16 rounded-xl" />
                <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-9 w-2/3" />
                    <Skeleton className="h-5 w-1/2" />
                </div>
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-52" />
            </div>
        </section>
    );
}
