import {
    AtSignIcon,
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
import type { ReactNode } from 'react';

import { DirectionsMenu } from '@/components/molecules/directions-menu';
import { Avatar } from '@/components/molecules/avatar';
import { languageName } from '@/lib/organizations/client';
import { type FocusArea, type ReachScope } from '@/lib/organizations/options';
import {
    SOCIAL_PLATFORMS,
    socialLabel,
    socialUrl,
    type SocialLink,
} from '@/lib/socials';
import { track } from '@/lib/analytics';

export interface OrganizationProfileProps {
    name: string;
    handle: string;
    /** The logo's large link, if it has one. */
    photo?: string;
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
    /** Join, Ask to join…: a card heading the side column (under the header on narrow screens). */
    action?: ReactNode;
    /** The Endorse card (EndorsePanel), under the action in the side column. */
    endorse?: ReactNode;
    /** More of the main column, after About: members, notices, nearby groups. */
    children?: ReactNode;
}

const host = (url: string) => {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
};

/**
 * An organization's public profile: a header (name, handle, city, focus
 * areas), About, and a side column with the action (Join…), Details and
 * Contact. Two columns once the
 * profile itself is wide enough (a container query, so a narrow preview stays
 * one column); on one column the cards come right after About.
 */
export function OrganizationProfile({
    name,
    handle,
    photo,
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
    action,
    endorse,
    children,
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
        ...(languages.length > 0
            ? [
                  {
                      icon: LanguagesIcon,
                      text: languages
                          .map((code) => languageName(code, locale))
                          .join(', '),
                  },
              ]
            : []),
    ];
    const hasContact = !!(
        website ||
        contactEmail ||
        phone ||
        socials.length > 0
    );

    return (
        // From @3xl: the header, About and the rest on the left; the action
        // and cards in a right-hand column level with the name. On one
        // column it's the same order as the markup: header, About, the
        // action and cards, then the rest.
        <article className="@container">
            <div className="grid gap-8 @3xl:grid-cols-[minmax(0,1fr)_18rem] @3xl:gap-x-12 @3xl:gap-y-10">
                <div className="flex min-w-0 flex-col gap-8 @3xl:col-start-1 @3xl:row-start-1">
                    <header className="flex min-w-0 items-start gap-4">
                        <Avatar
                            name={name}
                            photo={photo}
                            shape="square"
                            size={80}
                        />
                        <div className="flex min-w-0 flex-col gap-1.5">
                            <Name className="font-heading text-3xl font-semibold tracking-tight text-balance break-words">
                                {name}
                            </Name>
                            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
                                <span>@{handle}</span>
                                <span className="inline-flex items-center gap-1.5">
                                    <MapPinIcon
                                        aria-hidden
                                        className="size-4 shrink-0"
                                    />
                                    {place}
                                </span>
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

                    <section className="flex flex-col gap-3">
                        <Section className="font-heading text-lg font-semibold">
                            {t('page.about')}
                        </Section>
                        <p className="text-pretty break-words whitespace-pre-line">
                            {description || (
                                <span className="text-muted-foreground">
                                    {t('page.noDescription')}
                                </span>
                            )}
                        </p>
                    </section>
                </div>

                <div className="flex flex-col gap-4 @3xl:col-start-2 @3xl:row-span-2 @3xl:row-start-1 @3xl:self-start">
                    {action && (
                        <div className="rounded-lg border p-4">{action}</div>
                    )}
                    {endorse && (
                        <div className="rounded-lg border p-4">{endorse}</div>
                    )}
                    <Card title={t('page.details')} Heading={Section}>
                        <ul className="flex flex-col gap-3 text-sm">
                            {facts.map(({ icon: Icon, text }) => (
                                <Row key={text} icon={<Icon />}>
                                    {text}
                                </Row>
                            ))}
                            {streetAddress && (
                                <Row icon={<NavigationIcon />}>
                                    <span className="flex flex-col gap-0.5">
                                        <span>{streetAddress}</span>
                                        <DirectionsMenu
                                            address={streetAddress}
                                            org={handle}
                                        />
                                    </span>
                                </Row>
                            )}
                        </ul>
                    </Card>

                    {hasContact && (
                        <Card title={t('page.contact')} Heading={Section}>
                            <ul className="flex flex-col gap-3 text-sm">
                                {website && (
                                    <Row icon={<GlobeIcon />}>
                                        <a
                                            href={website}
                                            target="_blank"
                                            rel="noreferrer noopener"
                                            className={linkClass}
                                            {...track('org-website', {
                                                org: handle,
                                                url: website,
                                            })}
                                        >
                                            {host(website)}
                                        </a>
                                    </Row>
                                )}
                                {phone && (
                                    <Row icon={<PhoneIcon />}>
                                        <a
                                            href={phone.href}
                                            className={linkClass}
                                            {...track('org-phone', {
                                                org: handle,
                                            })}
                                        >
                                            {phone.text}
                                        </a>
                                    </Row>
                                )}
                                {contactEmail && (
                                    <Row icon={<MailIcon />}>
                                        <a
                                            href={`mailto:${contactEmail}`}
                                            className={`${linkClass} break-all`}
                                            {...track('org-email', {
                                                org: handle,
                                            })}
                                        >
                                            {contactEmail}
                                        </a>
                                    </Row>
                                )}
                                {socials.map((social) => (
                                    <Row
                                        key={social.platform}
                                        icon={<AtSignIcon />}
                                    >
                                        <a
                                            href={socialUrl(
                                                social.platform,
                                                social.handle
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer nofollow ugc"
                                            className={linkClass}
                                            {...track('org-social', {
                                                org: handle,
                                                platform: social.platform,
                                            })}
                                        >
                                            {
                                                SOCIAL_PLATFORMS[
                                                    social.platform
                                                ].name
                                            }
                                        </a>{' '}
                                        <span className="break-all text-muted-foreground">
                                            {socialLabel(
                                                social.platform,
                                                social.handle
                                            )}
                                        </span>
                                    </Row>
                                ))}
                            </ul>
                        </Card>
                    )}
                </div>

                {children && (
                    <div className="flex min-w-0 flex-col gap-10 @3xl:col-start-1 @3xl:row-start-2">
                        {children}
                    </div>
                )}
            </div>
        </article>
    );
}

// Always underlined, so links read as links without relying on colour.
const linkClass =
    'underline underline-offset-4 hover:decoration-2 focus-visible:decoration-2';

function Card({
    title,
    Heading,
    children,
}: {
    title: string;
    Heading: 'h2' | 'h3' | 'h4' | 'h5';
    children: ReactNode;
}) {
    return (
        <section className="flex flex-col gap-3 rounded-lg border p-4">
            <Heading className="text-sm font-semibold">{title}</Heading>
            {children}
        </section>
    );
}

function Row({ icon, children }: { icon: ReactNode; children: ReactNode }) {
    return (
        <li className="flex items-start gap-2.5">
            <span
                aria-hidden
                className="mt-0.5 text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0"
            >
                {icon}
            </span>
            <span className="min-w-0">{children}</span>
        </li>
    );
}
