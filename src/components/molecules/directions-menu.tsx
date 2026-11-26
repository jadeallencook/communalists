'use client';

import { ChevronDownIcon, ExternalLinkIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu';
import { directionsUrl, MAP_PROVIDER_NAMES, MAP_PROVIDERS } from '@/lib/maps';

export interface DirectionsMenuProps {
    /** The organization's public street address. */
    address: string;
    /** Start open (for previews). */
    defaultOpen?: boolean;
}

/** "Get directions": choose Apple Maps, Google Maps or OpenStreetMap. */
export function DirectionsMenu({
    address,
    defaultOpen = false,
}: DirectionsMenuProps) {
    const t = useTranslations('Organizations');
    return (
        <DropdownMenu defaultOpen={defaultOpen}>
            <DropdownMenuTrigger className="inline-flex w-fit items-center gap-1 rounded-sm underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                {t('page.directions')}
                <span className="sr-only">
                    {t('page.directionsFor', { address })}
                </span>
                <ChevronDownIcon aria-hidden className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuLabel>
                    {t('page.directionsWith')}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {MAP_PROVIDERS.map((provider) => (
                    <DropdownMenuItem key={provider} asChild>
                        <a
                            href={directionsUrl(provider, address)}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {MAP_PROVIDER_NAMES[provider]}
                            <span className="sr-only">{t('page.newTab')}</span>
                            <ExternalLinkIcon
                                aria-hidden
                                className="ml-auto text-muted-foreground"
                            />
                        </a>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
