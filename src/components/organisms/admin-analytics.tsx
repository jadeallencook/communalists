import { SearchIcon } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';

import { StatTile } from '@/components/molecules/stat-tile';
import { Link } from '@/i18n/navigation';
import { FEW_RESULTS } from '@/lib/analytics/reports';
import { comparePeriods } from '@/lib/platform-stats';
import { organizationPath, findPath } from '@/lib/paths';

export interface AdminAnalyticsOrganization {
    handle: string;
    /** Undefined when no active organization has this handle anymore. */
    name?: string;
    views: number;
}

export interface AdminAnalyticsCity {
    /** The /find/organizations path, "us/ca/oakland". */
    slug: string;
    /** "Oakland, California"; the slug when the city isn't known. */
    label: string;
    views: number;
    /** Local organizations /find/organizations shows there today, before filters. */
    nearby: number;
}

export type AdminAnalyticsProps =
    | { status: 'notConfigured' | 'error' }
    | {
          status: 'ok';
          /** Already formatted. */
          asOf: string;
          visitors: number;
          pageviews: number;
          previous?: { visitors?: number; pageviews?: number };
          organizations: AdminAnalyticsOrganization[];
          cities: AdminAnalyticsCity[];
          /** The distance "nearby" means. */
          radiusMiles: number;
      };

/** Umami's numbers on the super-user dashboard: visitors, popular pages, searched cities. */
export function AdminAnalytics(props: AdminAnalyticsProps) {
    const t = useTranslations('Admin');
    const format = useFormatter();
    const n = (value: number) => format.number(value);
    const compare = (current: number, previous?: number) => {
        if (previous === undefined) return undefined;
        const { change, trend } = comparePeriods(current, previous);
        return {
            trend,
            text: t('stats.compare', { trend, change: n(change) }),
        };
    };

    return (
        <section
            aria-labelledby="admin-analytics"
            className="flex flex-col gap-3"
        >
            <h2
                id="admin-analytics"
                className="font-heading text-xl font-semibold"
            >
                {t('sections.analytics')}
            </h2>
            <p className="-mt-1 text-sm text-muted-foreground">
                {t('analytics.hint')}
            </p>

            {props.status !== 'ok' ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    {t(`analytics.${props.status}`)}
                </p>
            ) : (
                <>
                    <p className="text-sm text-muted-foreground">
                        {t('analytics.asOf', { time: props.asOf })}
                    </p>
                    <dl className="grid gap-3 sm:grid-cols-2">
                        <StatTile
                            label={t('analytics.visitors')}
                            value={n(props.visitors)}
                            comparison={compare(
                                props.visitors,
                                props.previous?.visitors
                            )}
                        />
                        <StatTile
                            label={t('analytics.pageviews')}
                            value={n(props.pageviews)}
                            comparison={compare(
                                props.pageviews,
                                props.previous?.pageviews
                            )}
                        />
                    </dl>

                    <div className="grid gap-6 md:grid-cols-2">
                        <section
                            aria-labelledby="admin-top-orgs"
                            className="flex flex-col gap-2"
                        >
                            <h3
                                id="admin-top-orgs"
                                className="font-heading text-lg font-semibold"
                            >
                                {t('analytics.orgsTitle')}
                            </h3>
                            {props.organizations.length === 0 ? (
                                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                    {t('analytics.orgsEmpty')}
                                </p>
                            ) : (
                                <ol className="flex flex-col divide-y rounded-lg border">
                                    {props.organizations.map((org) => (
                                        <li
                                            key={org.handle}
                                            className="flex items-baseline justify-between gap-3 p-3 text-sm"
                                        >
                                            <span className="flex min-w-0 flex-col">
                                                {org.name ? (
                                                    <Link
                                                        href={organizationPath(
                                                            org.handle
                                                        )}
                                                        className="font-medium break-words underline underline-offset-2"
                                                    >
                                                        {org.name}
                                                    </Link>
                                                ) : (
                                                    <span className="font-medium break-words">
                                                        /organization/
                                                        {org.handle}
                                                    </span>
                                                )}
                                                {!org.name && (
                                                    <span className="text-muted-foreground">
                                                        {t(
                                                            'analytics.unknownOrganization'
                                                        )}
                                                    </span>
                                                )}
                                            </span>
                                            <span className="shrink-0 tabular-nums">
                                                {t('analytics.views', {
                                                    count: org.views,
                                                })}
                                            </span>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </section>

                        <section
                            aria-labelledby="admin-top-cities"
                            className="flex flex-col gap-2"
                        >
                            <h3
                                id="admin-top-cities"
                                className="font-heading text-lg font-semibold"
                            >
                                {t('analytics.citiesTitle')}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {t('analytics.citiesHint', {
                                    radius: props.radiusMiles,
                                    few: FEW_RESULTS,
                                })}
                            </p>
                            {props.cities.length === 0 ? (
                                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                    {t('analytics.citiesEmpty')}
                                </p>
                            ) : (
                                <ol className="flex flex-col divide-y rounded-lg border">
                                    {props.cities.map((city) => (
                                        <li
                                            key={city.slug}
                                            className="flex items-baseline justify-between gap-3 p-3 text-sm"
                                        >
                                            <span className="flex min-w-0 flex-col gap-0.5">
                                                <Link
                                                    href={`${findPath('organizations')}/${city.slug}`}
                                                    className="font-medium break-words underline underline-offset-2"
                                                >
                                                    {city.label}
                                                </Link>
                                                <span className="flex flex-wrap items-center gap-2 text-muted-foreground">
                                                    {t('analytics.nearby', {
                                                        count: city.nearby,
                                                    })}
                                                    {city.nearby <
                                                        FEW_RESULTS && (
                                                        <span className="inline-flex items-center gap-1 rounded-full border border-foreground px-2 py-0.5 text-xs font-medium text-foreground">
                                                            <SearchIcon
                                                                aria-hidden
                                                                className="size-3.5"
                                                            />
                                                            {t(
                                                                'analytics.needsResearch'
                                                            )}
                                                        </span>
                                                    )}
                                                </span>
                                            </span>
                                            <span className="shrink-0 tabular-nums">
                                                {t('analytics.views', {
                                                    count: city.views,
                                                })}
                                            </span>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </section>
                    </div>
                </>
            )}
        </section>
    );
}
