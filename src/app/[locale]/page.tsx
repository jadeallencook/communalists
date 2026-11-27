import { Suspense } from 'react';

import { HeroSearchPlaceholder } from '@/components/organisms/hero-search';
import { HomeJoinBand, HomePage } from '@/components/pages/home-page';
import { getSessionUser } from '@/lib/auth/session';
import { startingCity } from '@/lib/organizations/starting-city';

import { HomeSearchContainer } from './home-search-container';

// The page is static; only the banner's search (which starts on the
// profile's city, or San Francisco) and the sign-up band depend on the session, so they
// stream in behind <Suspense>.
export default function Page() {
    return (
        <HomePage
            heroSearch={
                <Suspense fallback={<HeroSearchPlaceholder />}>
                    <HomeHeroSearch />
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

async function HomeHeroSearch() {
    const user = await getSessionUser();
    return <HomeSearchContainer startingCity={await startingCity(user?.uid)} />;
}

async function HomeJoin() {
    const user = await getSessionUser();
    return user ? null : <HomeJoinBand />;
}
