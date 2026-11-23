import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { FindOrganizationsPageLoading } from '@/components/pages/find-organizations-page';
import { getSessionUser } from '@/lib/auth/session';
import {
    getDirectoryInternational,
    getDirectoryLocal,
    getDirectoryNational,
} from '@/lib/organizations';
import {
    filterDirectory,
    parseDirectorySearch,
} from '@/lib/organizations/directory';
import { getPlace } from '@/lib/places';
import { getUserProfile } from '@/lib/users';

import { FindContainer } from './find-container';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Find');
    return { title: t('metaTitle'), description: t('intro') };
}

// Public. The search lives in the URL (shareable); signed-in visitors with no
// city in the URL search from their profile's city. Reads the URL and the
// session, so it streams behind <Suspense>. Design: features/16 →
// "Finding organizations".
export default function Page({ searchParams }: PageProps<'/[locale]/find'>) {
    return (
        <Suspense fallback={<FindOrganizationsPageLoading />}>
            <FindServerContainer searchParams={searchParams} />
        </Suspense>
    );
}

async function FindServerContainer({
    searchParams,
}: Pick<PageProps<'/[locale]/find'>, 'searchParams'>) {
    const [params, user] = await Promise.all([searchParams, getSessionUser()]);
    const search = parseDirectorySearch(params);
    if (!search.placeId && user) {
        const home = (await getUserProfile(user.uid))?.location;
        if (home) {
            search.country = home.country;
            search.placeId = home.placeId;
        }
    }
    const place = search.placeId
        ? getPlace(search.country, search.placeId)
        : null;

    let results = null;
    if (place) {
        const [local, national, international] = await Promise.all([
            search.reach.includes('local')
                ? getDirectoryLocal({
                      placeId: place.id,
                      lat: place.lat,
                      lng: place.lng,
                  })
                : [],
            search.reach.includes('national')
                ? getDirectoryNational(place.country)
                : [],
            search.reach.includes('international')
                ? getDirectoryInternational()
                : [],
        ]);
        results = filterDirectory(
            [...local, ...national, ...international],
            place,
            search
        );
    }

    return (
        <FindContainer
            search={search}
            place={place ? { id: place.id, label: place.label } : null}
            results={results}
            canCreate={!!user}
        />
    );
}
