import { useFormatter, useTranslations } from 'next-intl';

import { StatTile } from '@/components/molecules/stat-tile';
import { WeeklyBars } from '@/components/molecules/weekly-bars';
import { comparePeriods, percent } from '@/lib/platform-stats';

export interface AdminOverviewProps {
    organizations: {
        active: number;
        unclaimed: number;
        archived: number;
        claimed: number;
        addedLast30: number;
        addedPrevious30: number;
        claimedLast30: number;
    };
    users: { total: number; last7: number; last30: number; previous30: number };
    claims: {
        approved: number;
        denied: number;
        receivedLast30: number;
        receivedPrevious30: number;
    };
    /** Oldest first. `label` is the week's first day, already formatted. */
    trends: {
        label: string;
        users: number;
        organizations: number;
        claims: number;
    }[];
}

const TREND_SERIES = ['users', 'organizations', 'claims'] as const;

/** The super-user dashboard's numbers and weekly trends. */
export function AdminOverview({
    organizations: orgs,
    users,
    claims,
    trends,
}: AdminOverviewProps) {
    const t = useTranslations('Admin');
    const format = useFormatter();
    const n = (value: number) => format.number(value);
    const compare = (current: number, previous: number) => {
        const { change, trend } = comparePeriods(current, previous);
        return {
            trend,
            text: t('stats.compare', { trend, change: n(change) }),
        };
    };
    // Pages the team added: still unclaimed, or claimed since.
    const teamAdded = orgs.unclaimed + orgs.claimed;

    return (
        <div className="flex flex-col gap-8">
            <section
                aria-labelledby="admin-overview"
                className="flex flex-col gap-3"
            >
                <h2
                    id="admin-overview"
                    className="font-heading text-xl font-semibold"
                >
                    {t('sections.overview')}
                </h2>
                <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <StatTile
                        label={t('stats.organizations')}
                        value={n(orgs.active)}
                        detail={t('stats.organizationsDetail', {
                            unclaimed: n(orgs.unclaimed),
                            archived: n(orgs.archived),
                        })}
                    />
                    <StatTile
                        label={t('stats.claimed')}
                        value={t('stats.claimedValue', {
                            percent: percent(orgs.claimed, teamAdded),
                        })}
                        detail={t('stats.claimedDetail', {
                            claimed: n(orgs.claimed),
                            total: n(teamAdded),
                            last30: n(orgs.claimedLast30),
                        })}
                    />
                    <StatTile
                        label={t('stats.added')}
                        value={n(orgs.addedLast30)}
                        comparison={compare(
                            orgs.addedLast30,
                            orgs.addedPrevious30
                        )}
                    />
                    <StatTile
                        label={t('stats.users')}
                        value={n(users.total)}
                        detail={t('stats.usersDetail', {
                            count: n(users.last7),
                        })}
                    />
                    <StatTile
                        label={t('stats.newUsers')}
                        value={n(users.last30)}
                        comparison={compare(users.last30, users.previous30)}
                    />
                    <StatTile
                        label={t('stats.claims')}
                        value={n(claims.receivedLast30)}
                        comparison={compare(
                            claims.receivedLast30,
                            claims.receivedPrevious30
                        )}
                        detail={t('stats.claimsDetail', {
                            approved: n(claims.approved),
                            denied: n(claims.denied),
                        })}
                    />
                </dl>
            </section>

            <section
                aria-labelledby="admin-trends"
                className="flex flex-col gap-3"
            >
                <h2
                    id="admin-trends"
                    className="font-heading text-xl font-semibold"
                >
                    {t('sections.trends')}
                </h2>
                <p className="-mt-1 text-sm text-muted-foreground">
                    {t('trendsHint')}
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                    {TREND_SERIES.map((series) => {
                        const weeks = trends.map((week) => ({
                            label: week.label,
                            count: week[series],
                        }));
                        const total = weeks.reduce((s, w) => s + w.count, 0);
                        return (
                            <WeeklyBars
                                key={series}
                                id={`trend-${series}`}
                                title={t(`trends.${series}`)}
                                weeks={weeks}
                                summary={t('chartSummary', {
                                    total: n(total),
                                    latest: n(weeks.at(-1)?.count ?? 0),
                                })}
                                showTable={t('showTable')}
                                weekColumn={t('weekColumn')}
                                countColumn={t('countColumn')}
                            />
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
