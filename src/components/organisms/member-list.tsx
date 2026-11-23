import { useTranslations } from 'next-intl';

import { initials } from '@/lib/initials';
import type { OrgRole } from '@/lib/organizations/membership';
import type { MemberListVisibility } from '@/lib/organizations/options';

export interface MemberListProps {
    /** Who to name: everyone, or only owners and moderators. Sorted by the caller. */
    people: { uid: string; displayName: string; role: OrgRole }[];
    /** All active members, including those not named. */
    total: number;
    /** The group's setting, to explain why only some are named. */
    setting: MemberListVisibility;
    /** The viewer is a member (changes the explanation). */
    viewerIsMember?: boolean;
}

/** The group page's member list: names with roles, and how many others there are. */
export function MemberList({
    people,
    total,
    setting,
    viewerIsMember = false,
}: MemberListProps) {
    const t = useTranslations('Membership');
    const others = total - people.length;
    const why =
        others > 0
            ? setting === 'members' && !viewerIsMember
                ? t('listMembersOnly')
                : t('listHidden')
            : null;

    return (
        <section className="flex flex-col gap-3">
            <h2 className="font-heading text-lg font-semibold">
                {t('membersTitle')}
                <span className="ml-2 text-base font-normal text-muted-foreground">
                    {total}
                </span>
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
                {people.map((person) => (
                    <li
                        key={person.uid}
                        className="flex items-center gap-3 rounded-lg border p-2.5"
                    >
                        <span
                            aria-hidden
                            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium"
                        >
                            {initials(person.displayName)}
                        </span>
                        <span className="min-w-0 flex-1 text-sm break-words">
                            {person.displayName}
                        </span>
                        {person.role !== 'member' && (
                            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">
                                {t(`roles.${person.role}`)}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
            {others > 0 && (
                <p className="text-sm text-muted-foreground">
                    {t('andOthers', { count: others })} {why}
                </p>
            )}
        </section>
    );
}
