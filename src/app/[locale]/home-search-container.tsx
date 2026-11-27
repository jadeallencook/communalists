'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { HeroSearch } from '@/components/organisms/hero-search';
import { useLocationPicker } from '@/hooks/use-location-picker';
import { useRouter } from '@/i18n/navigation';
import { DEFAULT_PLACE, homeSearchHref } from '@/lib/organizations/directory';
import { focusAreasByUse } from '@/lib/organizations/options';
import type { PlaceOption } from '@/lib/places/types';

/**
 * Wires the homepage search: the city box starts on the profile's city (if
 * any), and "Connect with organizations" opens /find with the chosen focus
 * area and city, or the starting city when none is chosen.
 */
export function HomeSearchContainer({
    profileCity,
}: {
    profileCity: PlaceOption | null;
}) {
    const locale = useLocale();
    const router = useRouter();
    const t = useTranslations('Organizations.focusAreas');
    const [focusArea, setFocusArea] = useState<string | null>(null);
    const location = useLocationPicker({ locale, selected: profileCity });

    return (
        <HeroSearch
            action={`/${locale}/find`}
            focusArea={{
                options: focusAreasByUse().map((value) => ({
                    value,
                    label: t(value),
                })),
                selected: focusArea,
                onSelect: setFocusArea,
            }}
            location={location}
            onSubmit={(event) => {
                event.preventDefault();
                router.push(
                    homeSearchHref({
                        focusArea,
                        place: location.selected && {
                            ...location.selected,
                            country: location.country,
                        },
                        startingSlug: profileCity?.slug ?? DEFAULT_PLACE.slug,
                    })
                );
            }}
        />
    );
}
