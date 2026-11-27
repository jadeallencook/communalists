import { useFormatter, useTranslations } from 'next-intl';

import { StatTile } from '@/components/molecules/stat-tile';
import type { AdminAction } from '@/lib/organizations/claims';
import { ACTIVITY_GROUPS, type ActivityGroup } from '@/lib/platform-stats';

export interface AdminLogItem {
    id: string;
    action: AdminAction;
    orgName: string;
    actorName: string;
    targetName?: string;
    /** A dictionary word, for word changes. */
    word?: string;
    /** Already formatted. */
    on: string;
}

export interface AdminActivityProps {
    /** Super-user actions in the last 30 days, by group. */
    activity: Record<ActivityGroup, number>;
    /** Decisions and changes, newest first (not adds, edits or downloads). */
    log: AdminLogItem[];
}

const GROUPS = Object.keys(ACTIVITY_GROUPS) as ActivityGroup[];

/** What super users did: counts for the last 30 days, then the decisions one by one. */
export function AdminActivity({ activity, log }: AdminActivityProps) {
    const t = useTranslations('Admin');
    const format = useFormatter();
    return (
        <section
            aria-labelledby="admin-activity"
            className="flex flex-col gap-3"
        >
            <h2
                id="admin-activity"
                className="font-heading text-xl font-semibold"
            >
                {t('sections.activity')}
            </h2>
            <p className="-mt-1 text-sm text-muted-foreground">
                {t('activityHint')}
            </p>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {GROUPS.map((group) => (
                    <StatTile
                        key={group}
                        label={t(`activity.${group}`)}
                        value={format.number(activity[group])}
                    />
                ))}
            </dl>

            <h3
                id="admin-log"
                className="mt-3 font-heading text-lg font-semibold"
            >
                {t('logTitle')}
            </h3>
            <p className="-mt-1 text-sm text-muted-foreground">
                {t('logHint')}
            </p>
            {log.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    {t('noLog')}
                </p>
            ) : (
                <ol
                    aria-labelledby="admin-log"
                    className="flex flex-col divide-y rounded-lg border"
                >
                    {log.map((entry) => (
                        <li
                            key={entry.id}
                            className="flex flex-col gap-0.5 p-3 text-sm"
                        >
                            <span>
                                {t(`log.${entry.action}`, {
                                    actor: entry.actorName,
                                    org: entry.orgName,
                                    target: entry.targetName ?? '',
                                    word: entry.word ?? '',
                                })}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {entry.on}
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
