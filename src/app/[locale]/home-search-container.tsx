'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { HeroSearch } from '@/components/organisms/hero-search';
import { useLocationPicker } from '@/hooks/use-location-picker';
import { useRouter } from '@/i18n/navigation';
import { DEFAULT_PLACE, homeSearchHref } from '@/lib/organizations/directory';
import { focusAreasByUse, HOME_FOCUS_AREAS } from '@/lib/organizations/options';
import type { PlaceOption } from '@/lib/places/types';

/**
 * Wires the homepage search: the broadest focus areas as pills (one at a
 * time), the city box starts on the profile's city, or San Francisco, and
 * "Find organizations" opens /find with the chosen focus area and city, or
 * the starting city when none is chosen.
 */
export function HomeSearchContainer({
    startingCity,
}: {
    /** The profile's city, or San Francisco (DEFAULT_PLACE). */
    startingCity: PlaceOption;
}) {
    const locale = useLocale();
    const router = useRouter();
    const t = useTranslations('Organizations.focusAreas');
    const [focusArea, setFocusArea] = useState<string | null>(null);
    const location = useLocationPicker({ locale, selected: startingCity });

    return (
        <HeroSearch
            action={`/${locale}/find`}
            focusArea={{
                options: focusAreasByUse()
                    .slice(0, HOME_FOCUS_AREAS)
                    .map((value) => ({ value, label: t(value) })),
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
                        startingSlug: startingCity.slug ?? DEFAULT_PLACE.slug,
                    })
                );
            }}
        />
    );
}
