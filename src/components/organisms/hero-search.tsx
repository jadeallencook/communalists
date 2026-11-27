import { useTranslations } from 'next-intl';
import type { FormEvent } from 'react';

import { Button } from '@/components/atoms/button';
import { Skeleton } from '@/components/atoms/skeleton';
import {
    FocusAreaPills,
    type FocusAreaPillsProps,
} from '@/components/molecules/focus-area-pills';
import {
    LocationField,
    type LocationFieldProps,
} from '@/components/molecules/location-field';
import { track } from '@/lib/analytics';

export interface HeroSearchProps {
    /** Where the form goes without JavaScript: /{locale}/find, which redirects to the city's path. */
    action: string;
    focusArea: FocusAreaPillsProps;
    location: Omit<LocationFieldProps, 'error' | 'hint' | 'placeholder'>;
    /** With JavaScript: go to /find with the chosen tag and city. */
    onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}

/**
 * The homepage banner's search, in one line: "Connect with organizations",
 * the city, then focus-area pills, which opens /find with them applied.
 * Both are optional: with neither, /find opens on the visitor's starting city.
 * Sits in the banner's translucent band (dark theme), so it reads on the photo.
 * The pills may run past the header's right edge to the screen edge.
 * On phones the pills go under the button and city.
 */
export function HeroSearch({
    action,
    focusArea,
    location,
    onSubmit,
}: HeroSearchProps) {
    const t = useTranslations('Home.search');
    return (
        <form
            role="search"
            aria-label={t('label')}
            action={action}
            method="get"
            onSubmit={onSubmit}
            className="flex w-full flex-col gap-4 md:flex-row md:items-start"
        >
            <div className="flex flex-wrap items-start gap-4 md:shrink-0 md:flex-nowrap">
                <div className="flex flex-col gap-2">
                    {/* Lines the button up with the city box under its label. */}
                    <span
                        aria-hidden
                        className="invisible text-sm leading-snug select-none"
                    >
                        &nbsp;
                    </span>
                    <Button
                        type="submit"
                        {...track('browse-organizations', { from: 'hero' })}
                    >
                        {t('submit')}
                    </Button>
                </div>
                <div className="flex min-w-48 flex-1 flex-col gap-4 md:w-64 md:flex-none">
                    <LocationField {...location} hint={t('locationHint')} />
                </div>
            </div>
            {/* Runs past the container to the screen edge: (screen - 72rem) / 2 + the 1rem padding. */}
            <FocusAreaPills
                {...focusArea}
                className="-mr-4 flex-1 md:-mr-[calc((100vw-min(100vw,72rem))/2+1rem)]"
            />
        </form>
    );
}

/** While the session (and so the profile's city) is checked: a row the same height. */
export function HeroSearchPlaceholder() {
    return (
        <Skeleton
            aria-hidden
            className="h-40 w-full rounded-lg bg-white/15 md:h-20"
        />
    );
}
