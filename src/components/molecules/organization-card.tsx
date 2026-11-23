import { ChevronRightIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { initials } from '@/lib/initials';
import type { FocusArea } from '@/lib/organizations/options';

export interface OrganizationCardProps {
    name: string;
    handle: string;
    focusAreas: FocusArea[];
    /** The viewer's role, when they're a member. */
    role?: 'owner' | 'moderator' | 'member';
    /** Replaces the `/org/{handle}` after the focus areas, e.g. "3 mi away · Santa Clara, California". */
    detail?: string;
}

/** A link to one organization: initials, name, what it works on, and your role. */
export function OrganizationCard({
    name,
    handle,
    focusAreas,
    role,
    detail,
}: OrganizationCardProps) {
    const t = useTranslations('Organizations');
    const locale = useLocale();
    // "Food, Housing, and Legal help" in the UI language's list style.
    // (The `unit` style runs items together in Chinese.)
    const areas = new Intl.ListFormat(locale, {
        style: 'long',
        type: 'conjunction',
    }).format(focusAreas.map((area) => t(`focusAreas.${area}`)));
    return (
        <Link
            href={`/org/${handle}`}
            className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
            <span
                aria-hidden
                className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted font-medium"
            >
                {initials(name)}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-sm text-muted-foreground">
                    {areas ? `${areas} · ` : ''}
                    {detail ?? `/org/${handle}`}
                </span>
            </span>
            {role && (
                <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs text-foreground">
                    {t(`roles.${role}`)}
                </span>
            )}
            <ChevronRightIcon
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground"
            />
        </Link>
    );
}
