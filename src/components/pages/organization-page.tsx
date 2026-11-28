import { LockIcon, PencilIcon, ShieldIcon, UsersIcon } from 'lucide-react';
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
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/atoms/dialog';
import { Skeleton } from '@/components/atoms/skeleton';
import { UnclaimedNotice } from '@/components/organisms/unclaimed-notice';
import { organizationPath } from '@/lib/paths';

export interface OrganizationPageProps {
    profile: OrganizationProfileProps;
    /** The viewer's role when they're an active member; null for everyone else. */
    role: 'owner' | 'moderator' | 'member' | null;
    /** The join area (JoinPanel, wired by a container). */
    join: ReactNode;
    members: MemberListProps;
    /** Owners and moderators: open requests, shown on the Manage members link. */
    pendingRequests?: number;
    /**
     * Not claimed yet: the notice with "Claim it" replaces joining and the
     * member list. `canManage` (super users) adds the edit tools.
     */
    unclaimed?: { canManage: boolean };
    /**
     * Super users who own it and are its only member: hand it to the team as
     * unclaimed (for one made without ticking "unclaimed"). `formAction` is
     * makeUnclaimedAction.
     */
    /** Other organizations nearby (NearbyOrganizations), at the end of the page. */
    nearby?: ReactNode;
    /**
     * The public discussion (listed organizations only), after the members
     * and before nearby groups. Streams in on its own.
     */
    discussion?: ReactNode;
    makeUnclaimed?: {
        orgId: string;
        locale: string;
        formAction: (formData: FormData) => void | Promise<void>;
    };
}

const roleKey = {
    owner: 'roleOwner',
    moderator: 'roleModerator',
    member: 'roleMember',
} as const;

/** /organization/{handle}: the public profile, plus a members' space for members. */
export function OrganizationPage({
    profile,
    role,
    join,
    members,
    pendingRequests = 0,
    unclaimed,
    makeUnclaimed,
    nearby,
    discussion,
}: OrganizationPageProps) {
    const t = useTranslations('Organizations');
    const tm = useTranslations('Membership');
    const tu = useTranslations('Unclaimed');
    const staff = role === 'owner' || role === 'moderator';
    if (unclaimed) {
        return (
            <section className="mx-auto w-full max-w-5xl px-4 py-12">
                <OrganizationProfile {...profile} unclaimed>
                    <UnclaimedNotice
                        name={profile.name}
                        handle={profile.handle}
                    />
                    {unclaimed.canManage && (
                        <section className="flex flex-col gap-2 rounded-lg border p-5">
                            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
                                <ShieldIcon aria-hidden className="size-4" />
                                {tu('adminTitle')}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {tu('adminBody')}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <Button asChild variant="outline">
                                    <Link
                                        href={organizationPath(
                                            profile.handle,
                                            'edit'
                                        )}
                                    >
                                        <PencilIcon aria-hidden />
                                        {tm('editOrganization')}
                                    </Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/admin">{tu('adminLink')}</Link>
                                </Button>
                            </div>
                        </section>
                    )}
                    {discussion}
                    {nearby}
                </OrganizationProfile>
            </section>
        );
    }
    return (
        <section className="mx-auto w-full max-w-5xl px-4 py-12">
            {/* Visitors: Join / Ask to join, in the header. Members: Leave,
                inside their space. */}
            <OrganizationProfile {...profile} action={!role && join}>
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
                            <div className="mt-2 flex flex-wrap gap-2">
                                <Button asChild variant="outline">
                                    <Link
                                        href={organizationPath(
                                            profile.handle,
                                            'edit'
                                        )}
                                    >
                                        <PencilIcon aria-hidden />
                                        {tm('editOrganization')}
                                    </Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link
                                        href={organizationPath(
                                            profile.handle,
                                            'members'
                                        )}
                                    >
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
                                {makeUnclaimed && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">
                                                <ShieldIcon aria-hidden />
                                                {tu('makeUnclaimed')}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <form
                                                action={
                                                    makeUnclaimed.formAction
                                                }
                                                className="contents"
                                            >
                                                <input
                                                    type="hidden"
                                                    name="orgId"
                                                    value={makeUnclaimed.orgId}
                                                />
                                                <input
                                                    type="hidden"
                                                    name="handle"
                                                    value={profile.handle}
                                                />
                                                <input
                                                    type="hidden"
                                                    name="locale"
                                                    value={makeUnclaimed.locale}
                                                />
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        {tu(
                                                            'makeUnclaimedTitle',
                                                            {
                                                                name: profile.name,
                                                            }
                                                        )}
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        {tu(
                                                            'makeUnclaimedBody'
                                                        )}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                        >
                                                            {tu('keepOwner')}
                                                        </Button>
                                                    </DialogClose>
                                                    <Button type="submit">
                                                        {tu(
                                                            'makeUnclaimedConfirm'
                                                        )}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        )}
                        <div className="mt-2 border-t pt-3">{join}</div>
                    </section>
                )}
                <MemberList {...members} />
                {discussion}
                {nearby}
            </OrganizationProfile>
        </section>
    );
}

/** Shown while the organization loads. */
export function OrganizationPageLoading() {
    return (
        <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12">
            <div className="flex items-start gap-4">
                <Skeleton className="size-16 rounded-xl" />
                <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-9 w-2/3" />
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-1/2" />
                </div>
            </div>
            <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_18rem] md:gap-x-12">
                <div className="flex flex-col gap-3">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-20 w-full" />
                </div>
                <Skeleton className="h-44 w-full rounded-lg" />
            </div>
        </section>
    );
}
