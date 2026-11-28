'use client';

import {
    CalendarIcon,
    ChevronDownIcon,
    ExternalLinkIcon,
    GlobeIcon,
    LanguagesIcon,
    MapPinIcon,
    UsersIcon,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';

import { Link } from '@/i18n/navigation';
import { languageName } from '@/lib/organizations/client';
import type { OrgLanguage } from '@/lib/organizations/options';
import { SOCIAL_PLATFORMS, socialUrl, type SocialLink } from '@/lib/socials';
import { cn } from '@/lib/utils';

import {
    OrganizationCardSummary,
    type OrganizationCardProps,
} from './organization-card';
import { track } from '@/lib/analytics';
import { organizationPath } from '@/lib/paths';

export interface OrganizationListingProps extends Omit<
    OrganizationCardProps,
    'role'
> {
    description: string;
    languages: OrgLanguage[];
    memberCount: number;
    /** A local group's area: "Within 10 mi of San Jose, California". */
    servesWithin?: { miles: number; place: string };
    foundedYear?: number;
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
 * One search result. The top is a link to the organization's page (the
 * name is underlined); the "Show details" bar opens a drawer with the
 * description (cut at four lines; tap it or "Read more" for the rest), a
 * local group's area, its founding year, languages, members, and the
 * group's own links.
 */
export function OrganizationListing({
    description,
    languages,
    memberCount,
    servesWithin,
    foundedYear,
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
    const descriptionId = useId();
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    // Whether the four-line cut hides part of the description, and
    // whether the visitor asked to see all of it.
    const [clamped, setClamped] = useState(false);
    const [fullDescription, setFullDescription] = useState(false);

    // Measure while cut; the observer catches the drawer opening (it
    // measures zero while hidden) and width changes like rotating a phone.
    useEffect(() => {
        const el = descriptionRef.current;
        if (!el || fullDescription) return;
        const check = () => setClamped(el.scrollHeight > el.clientHeight + 1);
        check();
        const observer = new ResizeObserver(check);
        observer.observe(el);
        return () => observer.disconnect();
    }, [description, fullDescription]);

    const expandFromText = () => {
        // Don't fight someone selecting text to copy it.
        if (window.getSelection()?.toString()) return;
        setFullDescription(true);
    };

    // How to join isn't here: visitors read "Request to join" as something
    // to do, not a fact. The group's page explains it beside the button.
    const facts: { icon: typeof MapPinIcon; label?: string; text: string }[] = [
        // Nationwide and international results sit under their own
        // heading, and the card already says where they're based.
        ...(servesWithin
            ? [
                  {
                      icon: MapPinIcon,
                      text: t('reachSummary.local', servesWithin),
                  },
              ]
            : []),
        ...(foundedYear
            ? [
                  {
                      icon: CalendarIcon,
                      text: t('page.since', { year: String(foundedYear) }),
                  },
              ]
            : []),
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
            {/* The card's top opens the page. The name is always underlined so
                it reads as a link; hover thickens the line. */}
            <Link
                href={organizationPath(card.handle)}
                data-card
                {...track('org-open', { org: card.handle, from: 'find' })}
                className="group/card flex items-center gap-4 p-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset [&_[data-name]]:underline [&_[data-name]]:underline-offset-4 hover:[&_[data-name]]:decoration-2"
            >
                {/* Results don't label unclaimed groups (2026-11-26);
                    their page still says so. */}
                <OrganizationCardSummary {...card} unclaimed={false} />
            </Link>

            {/* The drawer handle: stays put while the details open below it. */}
            <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen(!open)}
                {...(open ? {} : track('org-details', { org: card.handle }))}
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
                <div className="flex flex-col items-start gap-1">
                    {/* Tapping cut-off text opens the rest; the button
                        below does the same for keyboards and screen
                        readers. */}
                    <p
                        ref={descriptionRef}
                        id={descriptionId}
                        onClick={
                            clamped && !fullDescription
                                ? expandFromText
                                : undefined
                        }
                        className={cn(
                            'text-sm break-words whitespace-pre-line',
                            !fullDescription && 'line-clamp-4',
                            clamped && !fullDescription && 'cursor-pointer',
                            !description && 'text-muted-foreground'
                        )}
                    >
                        {description || t('page.noDescription')}
                    </p>
                    {clamped && (
                        <button
                            type="button"
                            aria-expanded={fullDescription}
                            aria-controls={descriptionId}
                            onClick={() => setFullDescription(!fullDescription)}
                            className="rounded-sm text-sm font-medium underline underline-offset-4 hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                            {fullDescription
                                ? tFind('showLess')
                                : tFind('readMore')}
                            <span className="sr-only">: {card.name}</span>
                        </button>
                    )}
                </div>

                <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                    {facts.map(({ icon: Icon, label, text }) => (
                        <li key={text} className="flex items-center gap-1.5">
                            <Icon aria-hidden className="size-4 shrink-0" />
                            {/* "Since 2019" and "Within 10 mi of…" say what
                                they are; the others get a label. */}
                            {label && (
                                <span className="sr-only">{label}: </span>
                            )}
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
                                    {...track('org-website', {
                                        org: card.handle,
                                        url: website,
                                    })}
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
                                    {...track('org-social', {
                                        org: card.handle,
                                        platform,
                                    })}
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
