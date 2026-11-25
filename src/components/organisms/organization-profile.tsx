import {
    GlobeIcon,
    LanguagesIcon,
    CalendarIcon,
    MailIcon,
    MapPinIcon,
    PhoneIcon,
    NavigationIcon,
    UsersIcon,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { initials } from '@/lib/initials';
import { languageName } from '@/lib/organizations/client';
import { type FocusArea, type ReachScope } from '@/lib/organizations/options';
import {
    SOCIAL_PLATFORMS,
    socialLabel,
    socialUrl,
    type SocialLink,
} from '@/lib/socials';

export interface OrganizationProfileProps {
    name: string;
    handle: string;
    /** What the group works on, 1 to 3. */
    focusAreas: FocusArea[];
    description: string;
    /** The city, e.g. "San Jose, California". */
    place: string;
    reach: { scope: ReachScope; radiusMiles?: number };
    languages: string[];
    memberCount: number;
    /** Optional public street address, with a directions link. */
    streetAddress?: string;
    website?: string;
    contactEmail?: string;
    /** Already formatted for the viewer, with a `tel:` link (src/lib/phone.ts). */
    phone?: { text: string; href: string };
    /** The year the group started. */
    foundedYear?: number;
    socials: SocialLink[];
    unlisted?: boolean;
    /** Not claimed yet: an "Unclaimed" label, and no member count (it has no members). */
    unclaimed?: boolean;
    /** The name's heading level: 1 on its own page, lower when shown inside another page (a preview). */
    headingLevel?: 1 | 2 | 3 | 4;
}

/** A map search for the address; nothing is sent until someone clicks. */
const directionsUrl = (address: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

const host = (url: string) => {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
};

/** An organization's public profile: who they are, where, in which languages, and how to reach them. */
export function OrganizationProfile({
    name,
    handle,
    focusAreas,
    description,
    place,
    reach,
    languages,
    memberCount,
    streetAddress,
    website,
    contactEmail,
    phone,
    foundedYear,
    socials,
    unlisted = false,
    unclaimed = false,
    headingLevel = 1,
}: OrganizationProfileProps) {
    const Name = `h${headingLevel}` as const;
    const Section = `h${headingLevel + 1}` as 'h2' | 'h3' | 'h4' | 'h5';
    const t = useTranslations('Organizations');
    const locale = useLocale();
    const reachText =
        reach.scope === 'local'
            ? t('reachSummary.local', { miles: reach.radiusMiles ?? 0, place })
            : t(`reachSummary.${reach.scope}`, { place });

    const facts = [
        { icon: MapPinIcon, text: reachText },
        ...(unclaimed
            ? []
            : [
                  {
                      icon: UsersIcon,
                      text: t('page.members', { count: memberCount }),
                  },
              ]),
        ...(foundedYear
            ? [
                  {
                      icon: CalendarIcon,
                      text: t('page.since', { year: String(foundedYear) }),
                  },
              ]
            : []),
        {
            icon: LanguagesIcon,
            text: languages
                .map((code) => languageName(code, locale))
                .join(', '),
        },
    ];

    return (
        <article className="flex flex-col gap-8">
            <header className="flex items-start gap-4">
                <span
                    aria-hidden
                    className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted text-xl font-semibold"
                >
                    {initials(name)}
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                    <Name className="font-heading text-3xl font-semibold tracking-tight text-balance">
                        {name}
                    </Name>
                    <p className="flex flex-wrap items-center gap-2 text-muted-foreground">
                        /org/{handle}
                        {unclaimed && (
                            <span className="rounded-full border px-2.5 py-0.5 text-xs text-foreground">
                                {t('page.unclaimed')}
                            </span>
                        )}
                    </p>
                    {focusAreas.length > 0 && (
                        <ul
                            aria-label={t('page.focusAreas')}
                            className="mt-1 flex flex-wrap gap-1.5"
                        >
                            {focusAreas.map((area) => (
                                <li
                                    key={area}
                                    className="rounded-full bg-muted px-2.5 py-0.5 text-xs"
                                >
                                    {t(`focusAreas.${area}`)}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </header>

            {unlisted && (
                <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                    {t('page.unlisted')}
                </p>
            )}

            <p className="text-pretty whitespace-pre-line">
                {description || (
                    <span className="text-muted-foreground">
                        {t('page.noDescription')}
                    </span>
                )}
            </p>

            <ul className="flex flex-col gap-2 text-sm">
                {facts.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-2">
                        <Icon
                            aria-hidden
                            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                        />
                        <span>{text}</span>
                    </li>
                ))}
                {streetAddress && (
                    <li className="flex items-start gap-2">
                        <NavigationIcon
                            aria-hidden
                            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                        />
                        <span className="flex flex-wrap gap-x-2">
                            <span>{streetAddress}</span>
                            <a
                                href={directionsUrl(streetAddress)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-2"
                                aria-label={t('page.directionsTo', {
                                    address: streetAddress,
                                })}
                            >
                                {t('page.directions')}
                            </a>
                        </span>
                    </li>
                )}
            </ul>

            {(website || contactEmail || phone || socials.length > 0) && (
                <section className="flex flex-col gap-2">
                    <Section className="font-heading text-lg font-semibold">
                        {t('page.links')}
                    </Section>
                    <ul className="flex flex-wrap gap-2 text-sm">
                        {website && (
                            <li>
                                <a
                                    href={website}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 hover:bg-muted"
                                >
                                    <GlobeIcon aria-hidden className="size-4" />
                                    {host(website)}
                                </a>
                            </li>
                        )}
                        {phone && (
                            <li>
                                <a
                                    href={phone.href}
                                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 hover:bg-muted"
                                >
                                    <PhoneIcon aria-hidden className="size-4" />
                                    {phone.text}
                                </a>
                            </li>
                        )}
                        {contactEmail && (
                            <li>
                                <a
                                    href={`mailto:${contactEmail}`}
                                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 hover:bg-muted"
                                >
                                    <MailIcon aria-hidden className="size-4" />
                                    {contactEmail}
                                </a>
                            </li>
                        )}
                        {socials.map(({ platform, handle }) => (
                            <li key={platform}>
                                <a
                                    href={socialUrl(platform, handle)}
                                    target="_blank"
                                    rel="noopener noreferrer nofollow ugc"
                                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 hover:bg-muted"
                                >
                                    {SOCIAL_PLATFORMS[platform].name}
                                    <span className="text-muted-foreground">
                                        {socialLabel(platform, handle)}
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </article>
    );
}
