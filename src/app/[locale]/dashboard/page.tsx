import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import {
    DashboardPage,
    DashboardPageLoading,
} from '@/components/pages/dashboard-page';
import { isPlatformAdmin } from '@/lib/auth/platform-admin';
import { requireAccount } from '@/lib/auth/require-account';
import { getPendingClaims } from '@/lib/organizations/claim-store';
import { getDirectoryLocal, getMemberships } from '@/lib/organizations';
import {
    DEFAULT_RADIUS_MILES,
    filterDirectory,
} from '@/lib/organizations/directory';
import { MAX_OWNED_ORGANIZATIONS } from '@/lib/organizations/options';

const NEARBY_COUNT = 3;

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Dashboard');
    return { title: t('metaTitle') };
}

// requireAccount sends signed-out visitors to sign-in and incomplete accounts
// to setup. It reads cookies, so it streams behind <Suspense>.
export default function Page() {
    return (
        <Suspense fallback={<DashboardPageLoading />}>
            <DashboardContainer />
        </Suspense>
    );
}

async function DashboardContainer() {
    const { user, profile } = await requireAccount('/dashboard');
    const home = profile.location;
    const admin = isPlatformAdmin(user.uid);
    const [memberships, candidates, t, claims] = await Promise.all([
        getMemberships(user.uid),
        getDirectoryLocal({
            placeId: home.placeId,
            lat: home.lat,
            lng: home.lng,
        }),
        getTranslations('Find'),
        admin ? getPendingClaims() : null,
    ]);
    const owned = memberships.filter((m) => m.role === 'owner').length;
    // The closest few local groups the user isn't in; /find/organizations has the rest.
    const mine = new Set(memberships.map((m) => m.orgId));
    const nearby = filterDirectory(
        candidates.filter((org) => !mine.has(org.id)),
        home,
        {
            radiusMiles: DEFAULT_RADIUS_MILES,
            focusAreas: [],
            languages: [],
            reach: ['local'],
        }
    ).local.slice(0, NEARBY_COUNT);
    return (
        <DashboardPage
            name={profile.displayName}
            areaLabel={profile.location.label}
            organizations={memberships.map(({ org, role }) => ({
                name: org.name,
                handle: org.handle,
                focusAreas: org.focusAreas,
                role,
            }))}
            canCreate={owned < MAX_OWNED_ORGANIZATIONS}
            nearby={nearby.map(({ org, distanceMiles }) => ({
                name: org.name,
                handle: org.handle,
                focusAreas: org.focusAreas,
                unclaimed: org.unclaimed,
                detail:
                    distanceMiles < 1
                        ? t('inCity', { city: org.location.label })
                        : t('away', {
                              miles: distanceMiles,
                              city: org.location.label,
                          }),
            }))}
            nearbyRadiusMiles={DEFAULT_RADIUS_MILES}
            admin={claims ? { pendingClaims: claims.length } : undefined}
        />
    );
}
