import { MapPinIcon, PlusIcon, SearchXIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Button } from '@/components/atoms/button';
import { Skeleton } from '@/components/atoms/skeleton';
import { OrganizationListing } from '@/components/molecules/organization-listing';
import { Link } from '@/i18n/navigation';
import type {
    DirectoryResult,
    DirectoryResults,
} from '@/lib/organizations/directory';
import type { ReachScope } from '@/lib/organizations/options';
import { cn } from '@/lib/utils';
import { track } from '@/lib/analytics';

export interface FindOrganizationsPageProps {
    /** The filters form (OrganizationFilters, wired by a container). */
    filters: ReactNode;
    /** Null until a city is chosen. */
    results: DirectoryResults | null;
    /** The city searched from, e.g. "San Jose, California". */
    cityLabel?: string;
    radiusMiles: number;
    /** Which sections to show (the reach filter). */
    reach: ReachScope[];
    /** New results are loading: the old ones dim. */
    pending?: boolean;
    /** Offer "Create organization" (signed in). */
    canCreate?: boolean;
}

/** Search for organizations: filters beside results grouped by reach. */
export function FindOrganizationsPage({
    filters,
    results,
    cityLabel,
    radiusMiles,
    reach,
    pending = false,
    canCreate = false,
}: FindOrganizationsPageProps) {
    const t = useTranslations('Find');

    return (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12">
            <header className="flex flex-col gap-2">
                <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                    {t('title')}
                </h1>
                <p className="max-w-2xl text-muted-foreground">{t('intro')}</p>
            </header>

            <div className="grid gap-10 lg:grid-cols-[18rem_1fr]">
                <aside className="lg:sticky lg:top-20 lg:self-start">
                    {filters}
                </aside>

                <div
                    className={cn(
                        'flex min-w-0 flex-col gap-10 transition-opacity',
                        pending && 'opacity-50'
                    )}
                    aria-busy={pending}
                >
                    <p role="status" className="sr-only">
                        {pending ? t('updating') : ''}
                    </p>
                    {results === null ? (
                        <Notice icon={<MapPinIcon />} text={t('chooseCity')} />
                    ) : (
                        <>
                            {reach.includes('local') && (
                                <Section
                                    title={t('localTitle', {
                                        city: cityLabel ?? '',
                                    })}
                                    results={results.local}
                                    empty={t('noneLocal', {
                                        miles: radiusMiles,
                                    })}
                                    local
                                />
                            )}
                            {reach.includes('national') && (
                                <Section
                                    title={t('nationalTitle')}
                                    results={results.national}
                                    empty={t('noneOther')}
                                />
                            )}
                            {reach.includes('international') && (
                                <Section
                                    title={t('internationalTitle')}
                                    results={results.international}
                                    empty={t('noneOther')}
                                />
                            )}
                        </>
                    )}
                    {canCreate && (
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed p-4">
                            <span className="text-sm text-muted-foreground">
                                {t('createPrompt')}
                            </span>
                            <Button asChild variant="outline" size="sm">
                                <Link
                                    href="/org/new"
                                    {...track('create-organization', {
                                        from: 'find',
                                    })}
                                >
                                    <PlusIcon aria-hidden />
                                    {t('create')}
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function Section({
    title,
    results,
    empty,
    local = false,
}: {
    title: string;
    results: DirectoryResult[];
    empty: string;
    local?: boolean;
}) {
    const t = useTranslations('Find');
    return (
        <div className="flex flex-col gap-3">
            <h2 className="font-heading text-xl font-semibold">
                {title}
                <span className="ml-2 text-base font-normal text-muted-foreground">
                    {results.length}
                </span>
            </h2>
            {results.length > 0 ? (
                <ul className="flex flex-col gap-2">
                    {results.map(({ org, distanceMiles }) => (
                        <li key={org.id}>
                            <OrganizationListing
                                name={org.name}
                                handle={org.handle}
                                focusAreas={org.focusAreas}
                                unclaimed={org.unclaimed}
                                description={org.description}
                                languages={org.languages}
                                servesWithin={
                                    org.reach === 'local' && org.radiusMiles
                                        ? {
                                              miles: org.radiusMiles,
                                              place: org.location.label,
                                          }
                                        : undefined
                                }
                                foundedYear={org.foundedYear}
                                memberCount={org.memberCount}
                                website={org.website}
                                socials={org.socials}
                                detail={
                                    local
                                        ? distanceMiles < 1
                                            ? t('inCity', {
                                                  city: org.location.label,
                                              })
                                            : t('away', {
                                                  miles: distanceMiles,
                                                  city: org.location.label,
                                              })
                                        : t('basedIn', {
                                              city: org.location.label,
                                          })
                                }
                            />
                        </li>
                    ))}
                </ul>
            ) : local ? (
                <Notice icon={<SearchXIcon />} text={empty} />
            ) : (
                // Nationwide and international are often empty; a line is enough.
                <p className="text-sm text-muted-foreground">{empty}</p>
            )}
        </div>
    );
}

function Notice({ icon, text }: { icon: ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground [&_svg]:size-5 [&_svg]:shrink-0">
            <span aria-hidden>{icon}</span>
            {text}
        </div>
    );
}

/** Shown while the search loads: the page's shape. */
export function FindOrganizationsPageLoading() {
    const t = useTranslations('Find');
    return (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12">
            <p role="status" className="sr-only">
                {t('loading')}
            </p>
            <header className="flex flex-col gap-2">
                <Skeleton className="h-9 w-64 sm:h-10" />
                <Skeleton className="h-5 w-full max-w-xl" />
            </header>
            <div className="grid gap-10 lg:grid-cols-[18rem_1fr]">
                <div className="flex flex-col gap-6">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                </div>
                <div className="flex flex-col gap-3">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-[74px] w-full rounded-lg" />
                    <Skeleton className="h-[74px] w-full rounded-lg" />
                    <Skeleton className="h-[74px] w-full rounded-lg" />
                </div>
            </div>
        </section>
    );
}
