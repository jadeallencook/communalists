import { PlusIcon, UsersIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import { Skeleton } from '@/components/atoms/skeleton';
import {
    OrganizationCard,
    type OrganizationCardProps,
} from '@/components/molecules/organization-card';
import { Link } from '@/i18n/navigation';

export interface DashboardPageProps {
    name: string;
    /** The profile's city, e.g. "San Jose, California". */
    areaLabel?: string;
    /** Organizations the user is an active member of. */
    organizations: OrganizationCardProps[];
    /** False once the user owns the most organizations allowed. */
    canCreate: boolean;
}

/**
 * The signed-in home: your organizations, creating one, and (soon) finding
 * ones near you. A user can't do much until they're in an organization.
 */
export function DashboardPage({
    name,
    areaLabel,
    organizations,
    canCreate,
}: DashboardPageProps) {
    const t = useTranslations('Dashboard');
    const createButton = canCreate ? (
        <Button asChild>
            <Link href="/org/new">
                <PlusIcon aria-hidden />
                {t('create')}
            </Link>
        </Button>
    ) : null;

    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-12">
            <header className="flex flex-col gap-2">
                <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                    {t('greeting', { name })}
                </h1>
                {areaLabel && (
                    <p className="text-muted-foreground">
                        {t('area', { location: areaLabel })}
                    </p>
                )}
            </header>

            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-heading text-xl font-semibold">
                        {t('organizationsTitle')}
                    </h2>
                    {organizations.length > 0 && createButton}
                </div>
                {organizations.length > 0 ? (
                    <ul className="flex flex-col gap-2">
                        {organizations.map((org) => (
                            <li key={org.handle}>
                                <OrganizationCard {...org} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-6">
                        <UsersIcon
                            aria-hidden
                            className="size-5 text-muted-foreground"
                        />
                        <div className="flex flex-col gap-1">
                            <p className="font-medium">{t('emptyTitle')}</p>
                            <p className="text-sm text-muted-foreground">
                                {t('emptyBody')}
                            </p>
                        </div>
                        {createButton}
                    </div>
                )}
                {!canCreate && (
                    <p className="text-sm text-muted-foreground">
                        {t('ownedLimit')}
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="font-heading text-xl font-semibold">
                    {t('findTitle')}
                </h2>
                <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                    <span>{t('nextBrowse')}</span>
                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                        {t('comingSoon')}
                    </span>
                </div>
            </div>
        </section>
    );
}

/** Shown while the account loads: the page's shape, so it fills in rather than flashing a loading screen. */
export function DashboardPageLoading() {
    const t = useTranslations('Dashboard');
    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-12">
            <p role="status" className="sr-only">
                {t('loading')}
            </p>
            <header className="flex flex-col gap-2">
                <Skeleton className="h-9 w-56 sm:h-10" />
                <Skeleton className="h-5 w-64" />
            </header>
            <div className="flex flex-col gap-3">
                <Skeleton className="h-7 w-44" />
                <Skeleton className="h-28 w-full rounded-lg" />
            </div>
            <div className="flex flex-col gap-3">
                <Skeleton className="h-7 w-36" />
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
            </div>
        </section>
    );
}
