import { GlobeIcon, LanguagesIcon, LockIcon, MapPinIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { Avatar } from '@/components/molecules/avatar';
import { languageName } from '@/lib/organizations/client';
import type { ProfileView } from '@/lib/profiles';
import { SOCIAL_PLATFORMS, socialLabel, socialUrl } from '@/lib/socials';
import { organizationPath } from '@/lib/paths';

export interface ProfileCardProps {
    /** Exactly what this viewer may see (profileView in src/lib/profiles.ts). */
    view: ProfileView;
    /** Heading level for the name: 1 on the profile page, 2 in a preview. */
    headingLevel?: 1 | 2;
    /** Their endorsements couldn't be loaded (and this viewer would see them). */
    endorsementsFailed?: boolean;
}

const host = (url: string) => {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
};

/**
 * A person's profile: name and pronouns, then whatever they share with this
 * viewer (bio, city, languages, links, groups), or a note that the rest is
 * private. No logic: `view` is already filtered on the server.
 */
export function ProfileCard({
    view,
    headingLevel = 1,
    endorsementsFailed = false,
}: ProfileCardProps) {
    const t = useTranslations('Profile');
    const tOrg = useTranslations('Organizations');
    const locale = useLocale();
    const Heading = headingLevel === 1 ? 'h1' : 'h2';
    const Sub = headingLevel === 1 ? 'h2' : 'h3';
    const details = view.details;
    const links = details
        ? [
              ...(details.website
                  ? [{ url: details.website, label: host(details.website) }]
                  : []),
              ...details.socials.map((s) => ({
                  url: socialUrl(s.platform, s.handle),
                  label: `${SOCIAL_PLATFORMS[s.platform].name} ${socialLabel(s.platform, s.handle)}`,
              })),
          ]
        : [];

    return (
        <article className="flex flex-col gap-6">
            <header className="flex items-center gap-4">
                <Avatar
                    name={view.name}
                    photo={view.photo}
                    size={headingLevel === 1 ? 96 : 64}
                />
                <div className="flex min-w-0 flex-col">
                    <Heading className="font-heading text-2xl font-semibold tracking-tight break-words sm:text-3xl">
                        {view.name}
                    </Heading>
                    <p className="text-sm text-muted-foreground">
                        @{view.username}
                        {view.pronouns && (
                            <>
                                {' · '}
                                <span>{view.pronouns}</span>
                            </>
                        )}
                    </p>
                </div>
            </header>

            {!details ? (
                <p className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    <LockIcon aria-hidden className="size-4 shrink-0" />
                    {t('private')}
                </p>
            ) : (
                <>
                    {details.bio && (
                        <p className="whitespace-pre-line">{details.bio}</p>
                    )}
                    {(details.area || details.languages.length > 0) && (
                        <ul className="flex flex-col gap-2 text-sm">
                            {details.area && (
                                <li className="flex items-center gap-2">
                                    <MapPinIcon
                                        aria-hidden
                                        className="size-4 shrink-0 text-muted-foreground"
                                    />
                                    {details.area}
                                </li>
                            )}
                            {details.languages.length > 0 && (
                                <li className="flex items-center gap-2">
                                    <LanguagesIcon
                                        aria-hidden
                                        className="size-4 shrink-0 text-muted-foreground"
                                    />
                                    <span>
                                        <span className="sr-only">
                                            {t('languages')}:{' '}
                                        </span>
                                        {details.languages
                                            .map((code) =>
                                                languageName(code, locale)
                                            )
                                            .join(', ')}
                                    </span>
                                </li>
                            )}
                        </ul>
                    )}
                    {links.length > 0 && (
                        <section className="flex flex-col gap-2">
                            <Sub className="text-sm font-medium">
                                {t('links')}
                            </Sub>
                            <ul className="flex flex-wrap gap-2">
                                {links.map((link) => (
                                    <li key={link.url}>
                                        <a
                                            href={link.url}
                                            rel="noopener noreferrer nofollow ugc"
                                            target="_blank"
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-control px-2.5 py-1.5 text-sm hover:bg-muted"
                                        >
                                            <GlobeIcon
                                                aria-hidden
                                                className="size-4"
                                            />
                                            {link.label}
                                            <span className="sr-only">
                                                {t('opensNewTab')}
                                            </span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                    {details.groups.length > 0 && (
                        <section className="flex flex-col gap-2">
                            <Sub className="text-sm font-medium">
                                {t('groups')}
                            </Sub>
                            <ul className="flex flex-col gap-2">
                                {details.groups.map((group) => (
                                    <li key={group.orgId}>
                                        <Link
                                            href={organizationPath(
                                                group.handle
                                            )}
                                            className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm hover:bg-muted/50"
                                        >
                                            <span className="font-medium break-words">
                                                {group.name}
                                            </span>
                                            {group.role !== 'member' && (
                                                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">
                                                    {tOrg(
                                                        `roles.${group.role}`
                                                    )}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                    {(details.endorsements.length > 0 ||
                        endorsementsFailed) && (
                        <section className="flex flex-col gap-2">
                            <Sub className="text-sm font-medium">
                                {t('endorsements')}
                            </Sub>
                            {endorsementsFailed ? (
                                <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                                    {t('endorsementsFailed')}
                                </p>
                            ) : (
                                <ul className="flex flex-col gap-2">
                                    {details.endorsements.map((org) => (
                                        <li key={org.orgId}>
                                            <Link
                                                href={organizationPath(
                                                    org.handle
                                                )}
                                                className="flex items-center gap-3 rounded-lg border p-3 text-sm hover:bg-muted/50"
                                            >
                                                <Avatar
                                                    name={org.name}
                                                    photo={org.photo}
                                                    shape="square"
                                                    size={32}
                                                />
                                                <span className="font-medium break-words">
                                                    {org.name}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    )}
                    {!details.bio &&
                        !details.area &&
                        details.languages.length === 0 &&
                        links.length === 0 &&
                        details.groups.length === 0 &&
                        details.endorsements.length === 0 &&
                        !endorsementsFailed && (
                            <p className="text-sm text-muted-foreground">
                                {t('empty')}
                            </p>
                        )}
                </>
            )}
        </article>
    );
}
