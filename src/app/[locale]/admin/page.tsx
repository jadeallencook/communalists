import type { Metadata } from 'next';
import { getFormatter, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { AdminPageLoading } from '@/components/pages/admin-page';
import type { AdminOrganizationItem } from '@/components/organisms/admin-organizations';
import type { AdminAnalyticsProps } from '@/components/organisms/admin-analytics';
import { getUmamiReport, type UmamiReport } from '@/lib/analytics/umami-store';
import { requirePlatformAdmin } from '@/lib/auth/platform-admin';
import { getAdminAuth } from '@/lib/firebase/admin';
import {
    getDirectoryLocal,
    getOrganizationByHandle,
} from '@/lib/organizations';
import { getPendingClaims } from '@/lib/organizations/claim-store';
import {
    DEFAULT_FILTERS,
    filterDirectory,
} from '@/lib/organizations/directory';
import { isDetailGap } from '@/lib/organizations/details';
import { restoreDeadline } from '@/lib/organizations/lifecycle';
import { getRecentlyDeleted } from '@/lib/organizations/lifecycle-store';
import {
    getAdminFeed,
    getDashboardCounts,
    getOrganizationsMissing,
    getRecentOrganizations,
    getWeeklyTrends,
    searchOrganizations,
    SEARCH_LIMIT,
    type AdminOrganization,
} from '@/lib/organizations/stats-store';
import { daysSince, searchTerms } from '@/lib/platform-stats';
import { getPlaceBySlug } from '@/lib/places';
import { isSupportedCountry } from '@/lib/places/types';
import { getUserProfile } from '@/lib/users';

import { AdminContainer } from './admin-container';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Admin');
    return { title: t('metaTitle'), robots: { index: false, follow: false } };
}

type Props = PageProps<'/[locale]/admin'>;

// Super users only; everyone else gets the not-found page. Streams behind <Suspense>.
export default function Page({ searchParams }: Props) {
    return (
        <Suspense fallback={<AdminPageLoading />}>
            <AdminServerContainer searchParams={searchParams} />
        </Suspense>
    );
}

const one = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

async function AdminServerContainer({
    searchParams,
}: {
    searchParams: Props['searchParams'];
}) {
    await requirePlatformAdmin('/admin');
    const params = await searchParams;
    const requestedGap = one(params.gap);
    const gap = isDetailGap(requestedGap) ? requestedGap : 'contact';
    const terms = searchTerms(one(params.q));
    const query = terms ? terms.names[0] : undefined;

    const [
        claims,
        counts,
        trends,
        recent,
        missing,
        results,
        deleted,
        log,
        umami,
        format,
        t,
    ] = await Promise.all([
        getPendingClaims(),
        getDashboardCounts(),
        getWeeklyTrends(),
        getRecentOrganizations(),
        getOrganizationsMissing(gap),
        query ? searchOrganizations(query) : undefined,
        getRecentlyDeleted(),
        getAdminFeed(),
        getUmamiReport(),
        getFormatter(),
        getTranslations('Admin'),
    ]);
    const date = (at?: number) =>
        at ? format.dateTime(new Date(at), { dateStyle: 'medium' }) : '';
    // Measured from when the numbers were counted (up to an hour ago), so
    // the page reads as one moment.
    const now = counts.at;

    // Account emails, so the team can follow up on a request. Never cached,
    // never sent anywhere but this page.
    const emails = new Map<string, string | undefined>();
    await Promise.all(
        [...new Set(claims.map((c) => c.uid))].map(async (uid) => {
            const account = await getAdminAuth()
                .getUser(uid)
                .catch(() => null);
            emails.set(uid, account?.email);
        })
    );
    // Super users' names for the log (cached profile reads).
    const names = new Map<string, string>();
    await Promise.all(
        [...new Set(log.map((e) => e.actorUid))].map(async (uid) => {
            const profile = await getUserProfile(uid);
            names.set(uid, profile?.displayName || t('unknownActor'));
        })
    );

    const analytics = await analyticsProps(umami, (at) =>
        format.dateTime(new Date(at), {
            dateStyle: 'medium',
            timeStyle: 'short',
        })
    );

    const item = (org: AdminOrganization): AdminOrganizationItem => ({
        id: org.id,
        name: org.name,
        handle: org.handle,
        place: org.place,
        unclaimed: org.unclaimed,
        archived: org.archived,
        addedOn: date(org.createdAt),
        missingDetails: org.missingDetails,
    });

    return (
        <AdminContainer
            asOf={format.dateTime(new Date(counts.at), {
                dateStyle: 'medium',
                timeStyle: 'short',
            })}
            claims={claims.map((c) => ({
                orgId: c.orgId,
                uid: c.uid,
                orgName: c.org.name,
                handle: c.org.handle,
                intent: c.intent,
                role: c.role,
                message: c.message,
                claimantName: c.claimant.displayName,
                claimantUsername: c.claimant.username,
                claimantEmail: emails.get(c.uid),
                requestedOn: date(c.requestedAt),
                daysWaiting: daysSince(c.requestedAt, now),
            }))}
            analytics={analytics}
            overview={{
                organizations: counts.organizations,
                users: counts.users,
                claims: counts.claims,
                trends: trends.weeks.map((week, i) => ({
                    label: format.dateTime(new Date(week.start), {
                        month: 'short',
                        day: 'numeric',
                    }),
                    users: trends.users[i],
                    organizations: trends.organizations[i],
                    claims: trends.claims[i],
                })),
            }}
            organizations={{
                query,
                results: results?.map(item),
                searchLimit: SEARCH_LIMIT,
                gap,
                gapCounts: counts.gaps,
                missing: missing.map(item),
                recent: recent.map(item),
            }}
            activity={{
                activity: counts.activity,
                log: log.map((entry) => ({
                    id: entry.id,
                    action: entry.action,
                    orgName: entry.orgName,
                    actorName: names.get(entry.actorUid) ?? t('unknownActor'),
                    targetName: entry.targetName,
                    word: entry.word,
                    on: date(entry.at),
                })),
            }}
            deleted={deleted.map((org) => ({
                orgId: org.id,
                name: org.name,
                deletedOn: date(org.archivedAt),
                restoreUntil: date(restoreDeadline(org.archivedAt)),
            }))}
            definitionCount={counts.definitions}
        />
    );
}

/**
 * Umami's report, with names for the organizations' handles and, for each
 * searched city, how many local organizations /find shows there today
 * (cached directory reads, the same ones /find uses).
 */
async function analyticsProps(
    report: UmamiReport,
    formatTime: (at: number) => string
): Promise<AdminAnalyticsProps> {
    if (report.status !== 'ok') return { status: report.status };
    const [organizations, cities] = await Promise.all([
        Promise.all(
            report.organizations.map(async ({ key, views }) => {
                const org = await getOrganizationByHandle(key);
                return {
                    handle: key,
                    name: org?.status === 'active' ? org.name : undefined,
                    views,
                };
            })
        ),
        Promise.all(
            report.cities.map(async ({ key, views }) => {
                const [country, region, city] = key.split('/');
                const code = country.toUpperCase();
                const place = isSupportedCountry(code)
                    ? getPlaceBySlug(code, region, city)
                    : undefined;
                if (!place) return { slug: key, label: key, views, nearby: 0 };
                const candidates = await getDirectoryLocal({
                    placeId: place.id,
                    lat: place.lat,
                    lng: place.lng,
                });
                const nearby = filterDirectory(candidates, place, {
                    ...DEFAULT_FILTERS,
                    reach: ['local'],
                }).local.length;
                return { slug: key, label: place.label, views, nearby };
            })
        ),
    ]);
    return {
        status: 'ok',
        asOf: formatTime(report.at),
        visitors: report.stats.visitors,
        pageviews: report.stats.pageviews,
        previous: report.stats.previous,
        organizations,
        cities,
        radiusMiles: DEFAULT_FILTERS.radiusMiles,
    };
}
