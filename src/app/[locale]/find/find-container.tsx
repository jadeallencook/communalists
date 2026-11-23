'use client';

import { useLocale } from 'next-intl';
import { useTransition } from 'react';

import { OrganizationFilters } from '@/components/organisms/organization-filters';
import { FindOrganizationsPage } from '@/components/pages/find-organizations-page';
import { useLocationPicker } from '@/hooks/use-location-picker';
import { useRouter } from '@/i18n/navigation';
import { languageName } from '@/lib/organizations/client';
import {
    directorySearchParams,
    parseDirectorySearch,
    type DirectoryResults,
    type DirectorySearch,
} from '@/lib/organizations/directory';
import { ORG_LANGUAGES } from '@/lib/organizations/options';
import type { PlaceOption } from '@/lib/places/types';

/**
 * Wires /find: every filter change replaces the URL (so a search can be
 * shared), the server re-renders the results, and the old ones dim meanwhile.
 */
export function FindContainer({
    search,
    place,
    results,
    canCreate,
}: {
    search: DirectorySearch;
    place: PlaceOption | null;
    results: DirectoryResults | null;
    canCreate: boolean;
}) {
    const locale = useLocale();
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const go = (next: DirectorySearch) => {
        const query = directorySearchParams(next).toString();
        startTransition(() =>
            router.replace(query ? `/find?${query}` : '/find', {
                scroll: false,
            })
        );
    };
    const picker = useLocationPicker({
        locale,
        country: search.country,
        selected: place,
    });
    const location = {
        ...picker,
        onSelect: (next: PlaceOption) => {
            picker.onSelect(next);
            go({ ...search, country: picker.country, placeId: next.id });
        },
    };

    return (
        <FindOrganizationsPage
            filters={
                <OrganizationFilters
                    action={`/${locale}/find`}
                    search={search}
                    location={location}
                    languageOptions={ORG_LANGUAGES.map((code) => ({
                        value: code,
                        label: languageName(code, locale),
                    }))}
                    onFiltersChange={(form) => {
                        const data = new FormData(form);
                        const text = (key: string) =>
                            (data.get(key) as string | null) ?? undefined;
                        const list = (key: string) =>
                            data.getAll(key) as string[];
                        go(
                            parseDirectorySearch({
                                country: text('country'),
                                placeId: text('placeId'),
                                radius: text('radius'),
                                focusAreas: list('focusAreas'),
                                languages: list('languages'),
                                reach: list('reach'),
                            })
                        );
                    }}
                />
            }
            results={results}
            cityLabel={place?.label}
            radiusMiles={search.radiusMiles}
            reach={search.reach}
            pending={pending}
            canCreate={canCreate}
        />
    );
}
