import { Suspense } from 'react';

import {
    HeroActions,
    HeroActionsPlaceholder,
} from '@/components/molecules/hero-actions';
import { HomeJoinBand, HomePage } from '@/components/pages/home-page';
import { getSessionUser } from '@/lib/auth/session';
import { startingCitySlug } from '@/lib/organizations/starting-city';

// The page is static; only the buttons depend on the session, so they stream
// in behind <Suspense> (no flash of sign-up buttons for signed-in users).
export default function Page() {
    return (
        <HomePage
            heroActions={
                <Suspense fallback={<HeroActionsPlaceholder />}>
                    <HomeHeroActions />
                </Suspense>
            }
            join={
                <Suspense fallback={null}>
                    <HomeJoin />
                </Suspense>
            }
        />
    );
}

async function HomeHeroActions() {
    const user = await getSessionUser();
    // Browse goes straight to the visitor's city (their profile's, or the default).
    const city = await startingCitySlug(user?.uid);
    return <HeroActions signedIn={!!user} findHref={`/find/${city}`} />;
}

async function HomeJoin() {
    const user = await getSessionUser();
    return user ? null : <HomeJoinBand />;
}
