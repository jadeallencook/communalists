import { ChevronRightIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { initials } from '@/lib/initials';
import type { FocusArea } from '@/lib/organizations/options';
import { track } from '@/lib/analytics';
import { organizationPath } from '@/lib/paths';

export interface OrganizationCardProps {
    name: string;
    handle: string;
    focusAreas: FocusArea[];
    /** The viewer's role, when they're a member. */
    role?: 'owner' | 'moderator' | 'member';
    /** Replaces the `/organization/{handle}` after the focus areas, e.g. "3 mi away · Santa Clara, California". */
    detail?: string;
    /** Added by a super user and not claimed yet: shows "Unclaimed". */
    unclaimed?: boolean;
}

/** What an organization card shows: initials, name, label, and what it works on. */
export function OrganizationCardSummary({
    name,
    handle,
    focusAreas,
    role,
    detail,
    unclaimed = false,
}: OrganizationCardProps) {
    const t = useTranslations('Organizations');
    const locale = useLocale();
    // "Food, Housing, and Legal help" in the UI language's list style.
    // (The `unit` style runs items together in Chinese.)
    const areas = new Intl.ListFormat(locale, {
        style: 'long',
        type: 'conjunction',
    }).format(focusAreas.map((area) => t(`focusAreas.${area}`)));
    // "Food and Housing", "3 mi away", "Santa Clara, California": lines break
    // between these, not inside them.
    const parts = [
        ...(areas ? [areas] : []),
        ...(detail ?? organizationPath(handle)).split(' · '),
    ];
    return (
        <>
            <span
                aria-hidden
                className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted font-medium"
            >
                {initials(name)}
            </span>
            {/* Names and details wrap rather than being cut off; the label
                sits beside the name when there's room, under it when not. */}
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span data-name className="font-medium break-words">
                        {name}
                    </span>
                    {role ? (
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-foreground">
                            {t(`roles.${role}`)}
                        </span>
                    ) : (
                        unclaimed && (
                            <span className="rounded-full border px-2.5 py-0.5 text-xs text-foreground">
                                {t('page.unclaimed')}
                            </span>
                        )
                    )}
                </span>
                <span className="text-sm break-words text-muted-foreground">
                    {parts.map((part, i) => (
                        <span key={i}>
                            {i > 0 && ' · '}
                            {/* Each part stays on one line when it fits. */}
                            <span className="inline-block max-w-full">
                                {part}
                            </span>
                        </span>
                    ))}
                </span>
            </span>
        </>
    );
}

/** A link to one organization: initials, name, what it works on, and your role. */
export function OrganizationCard(props: OrganizationCardProps) {
    return (
        <Link
            href={organizationPath(props.handle)}
            {...track('org-open', { org: props.handle, from: 'card' })}
            className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
            <OrganizationCardSummary {...props} />
            <ChevronRightIcon
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground"
            />
        </Link>
    );
}
