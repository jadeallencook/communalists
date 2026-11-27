import { useTranslations } from 'next-intl';
import type { FormEvent } from 'react';

import { Button } from '@/components/atoms/button';
import { Skeleton } from '@/components/atoms/skeleton';
import {
    FocusAreaField,
    type FocusAreaFieldProps,
} from '@/components/molecules/focus-area-field';
import {
    LocationField,
    type LocationFieldProps,
} from '@/components/molecules/location-field';
import { track } from '@/lib/analytics';

export interface HeroSearchProps {
    /** Where the form goes without JavaScript: /{locale}/find, which redirects to the city's path. */
    action: string;
    focusArea: FocusAreaFieldProps;
    location: Omit<LocationFieldProps, 'error' | 'hint' | 'placeholder'>;
    /** With JavaScript: go to /find with the chosen tag and city. */
    onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}

/**
 * The homepage banner's search: an optional focus area and city, then
 * "Connect with organizations", which opens /find with them applied.
 * Both are optional: with neither, /find opens on the visitor's starting city.
 * A solid panel, so its fields keep their normal contrast on the photo.
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
            className="flex w-full max-w-3xl flex-col gap-4 rounded-xl bg-background p-4 text-foreground shadow-lg sm:p-5"
        >
            <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
                <FocusAreaField {...focusArea} />
                <div className="flex flex-col gap-4">
                    <LocationField
                        {...location}
                        placeholder={t('locationPlaceholder')}
                        hint={t('locationHint')}
                    />
                </div>
            </div>
            <Button
                type="submit"
                size="lg"
                className="self-start"
                {...track('browse-organizations', { from: 'hero' })}
            >
                {t('submit')}
            </Button>
        </form>
    );
}

/** While the session (and so the profile's city) is checked: a panel the same size. */
export function HeroSearchPlaceholder() {
    return (
        <Skeleton
            aria-hidden
            className="h-60 w-full max-w-3xl rounded-xl bg-white/25 sm:h-44"
        />
    );
}
