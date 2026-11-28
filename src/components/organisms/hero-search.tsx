import { ArrowRightIcon } from 'lucide-react';
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
    /** Where the form goes without JavaScript: /{locale}/find/organizations, which redirects to the city's path. */
    action: string;
    focusArea: FocusAreaPillsProps;
    location: Omit<LocationFieldProps, 'error' | 'hint' | 'placeholder'>;
    /** With JavaScript: go to /find/organizations with the chosen tag and city. */
    onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}

/**
 * The homepage banner's search, in one line: the city, focus-area pills,
 * then "Find organizations", which opens /find/organizations with them applied. Both
 * are optional: with neither, /find/organizations opens on the visitor's starting city.
 * Sits in the banner's translucent band (dark theme), so it reads on the
 * photo, and lines up with the header's edges. On phones the three stack.
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
            className="flex w-full flex-col gap-4 md:flex-row md:items-start md:gap-6"
        >
            <div className="flex flex-col md:w-64 md:shrink-0">
                {/* Only the GeoNames credit: the label and button say what the city does. */}
                <LocationField {...location} hint={null} />
            </div>
            <FocusAreaPills {...focusArea} className="flex-1" />
            <div className="flex flex-col gap-2 md:shrink-0">
                {/* Lines the button up with the city box under its label. */}
                <span
                    aria-hidden
                    className="hidden text-sm leading-snug select-none md:invisible md:block"
                >
                    &nbsp;
                </span>
                <Button
                    type="submit"
                    {...track('browse-organizations', { from: 'hero' })}
                >
                    {t('submit')}
                    <ArrowRightIcon aria-hidden />
                </Button>
            </div>
        </form>
    );
}

/** While the session (and so the profile's city) is checked: a row the same height. */
export function HeroSearchPlaceholder() {
    return (
        <Skeleton
            aria-hidden
            className="h-72 w-full rounded-lg bg-white/15 md:h-24"
        />
    );
}
