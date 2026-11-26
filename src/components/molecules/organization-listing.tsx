'use client';

import {
    ChevronDownIcon,
    DoorOpenIcon,
    ExternalLinkIcon,
    GlobeIcon,
    LanguagesIcon,
    UsersIcon,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useId, useState } from 'react';

import { Link } from '@/i18n/navigation';
import { languageName } from '@/lib/organizations/client';
import type { JoinPolicy, OrgLanguage } from '@/lib/organizations/options';
import { SOCIAL_PLATFORMS, socialUrl, type SocialLink } from '@/lib/socials';
import { cn } from '@/lib/utils';

import {
    OrganizationCardSummary,
    type OrganizationCardProps,
} from './organization-card';

export interface OrganizationListingProps extends Omit<
    OrganizationCardProps,
    'role'
> {
    description: string;
    languages: OrgLanguage[];
    joinPolicy: JoinPolicy;
    memberCount: number;
    website?: string;
    socials?: SocialLink[];
    /** Start expanded (for previews). */
    defaultOpen?: boolean;
}

const host = (url: string) => {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
};

const chipClass =
    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';

/**
 * One search result. The top is a link to the organization's page; the
 * "Show details" bar under it opens a drawer with the description,
 * languages, how to join, members, and the group's own links.
 */
export function OrganizationListing({
    description,
    languages,
    joinPolicy,
    memberCount,
    website,
    // Entries cached before links were added have none.
    socials = [],
    defaultOpen = false,
    ...card
}: OrganizationListingProps) {
    const t = useTranslations('Organizations');
    const tFind = useTranslations('Find');
    const locale = useLocale();
    const [open, setOpen] = useState(defaultOpen);
    const panelId = useId();

    const facts = [
        ...(languages.length > 0
            ? [
                  {
                      icon: LanguagesIcon,
                      label: t('page.languages'),
                      text: languages
                          .map((code) => languageName(code, locale))
                          .join(', '),
                  },
              ]
            : []),
        {
            icon: DoorOpenIcon,
            label: tFind('joining'),
            text: t(`joinPolicies.${joinPolicy}.label`),
        },
        // An unclaimed group has no members on the platform yet.
        ...(card.unclaimed
            ? []
            : [
                  {
                      icon: UsersIcon,
                      label: tFind('members'),
                      text: t('page.members', { count: memberCount }),
                  },
              ]),
    ];

    return (
        <div className="overflow-hidden rounded-lg border transition-colors has-[a[data-card]:hover]:border-foreground/30">
            {/* The card's top opens the page: name underlined on hover. */}
            <Link
                href={`/org/${card.handle}`}
                data-card
                className="group/card flex items-center gap-4 p-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset [&_[data-name]]:underline-offset-4 hover:[&_[data-name]]:underline"
            >
                <OrganizationCardSummary {...card} />
            </Link>

            {/* The drawer handle: stays put while the details open below it. */}
            <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-center gap-1.5 border-t px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
            >
                {open ? tFind('hideDetails') : tFind('showDetails')}
                <span className="sr-only">: {card.name}</span>
                <ChevronDownIcon
                    aria-hidden
                    className={cn(
                        'size-4 transition-transform motion-reduce:transition-none',
                        open && 'rotate-180'
                    )}
                />
            </button>

            <div
                id={panelId}
                hidden={!open}
                className="flex flex-col gap-4 border-t bg-muted/20 p-4"
            >
                <p
                    className={cn(
                        'line-clamp-4 text-sm break-words whitespace-pre-line',
                        !description && 'text-muted-foreground'
                    )}
                >
                    {description || t('page.noDescription')}
                </p>

                <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                    {facts.map(({ icon: Icon, label, text }) => (
                        <li key={label} className="flex items-center gap-1.5">
                            <Icon aria-hidden className="size-4 shrink-0" />
                            <span className="sr-only">{label}: </span>
                            {text}
                        </li>
                    ))}
                </ul>

                {(website || socials.length > 0) && (
                    <ul
                        className="flex flex-wrap gap-2"
                        aria-label={t('page.links')}
                    >
                        {website && (
                            <li>
                                <a
                                    href={website}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className={chipClass}
                                >
                                    <GlobeIcon
                                        aria-hidden
                                        className="size-3.5"
                                    />
                                    {host(website)}
                                    <ExternalLinkIcon
                                        aria-hidden
                                        className="size-3 text-muted-foreground"
                                    />
                                </a>
                            </li>
                        )}
                        {socials.map(({ platform, handle }) => (
                            <li key={platform}>
                                <a
                                    href={socialUrl(platform, handle)}
                                    target="_blank"
                                    rel="noopener noreferrer nofollow ugc"
                                    className={chipClass}
                                >
                                    {SOCIAL_PLATFORMS[platform].name}
                                    <ExternalLinkIcon
                                        aria-hidden
                                        className="size-3 text-muted-foreground"
                                    />
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
