import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import {
    DashboardPage,
    DashboardPageLoading,
} from '@/components/pages/dashboard-page';
import { requireAccount } from '@/lib/auth/require-account';
import { getMemberships } from '@/lib/organizations';
import { MAX_OWNED_ORGANIZATIONS } from '@/lib/organizations/options';

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
    const memberships = await getMemberships(user.uid);
    const owned = memberships.filter((m) => m.role === 'owner').length;
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
        />
    );
}
