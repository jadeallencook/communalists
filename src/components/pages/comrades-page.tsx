import { ArrowLeftIcon, LockIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Skeleton } from '@/components/atoms/skeleton';
import { ComradeLinks } from '@/components/molecules/comrade-links';
import { Link } from '@/i18n/navigation';
import { profilePath } from '@/lib/paths';
import type { ComradeView } from '@/lib/profiles';

export interface ComradesPageProps {
    name: string;
    username: string;
    /** The comrades this viewer may see; null when the list is private to them. */
    comrades: ComradeView[] | null;
    /** The list couldn't be loaded. */
    loadFailed?: boolean;
}

/** /comrade/{username}/comrades: a person's comrades, as this viewer may see them. */
export function ComradesPage({
    name,
    username,
    comrades,
    loadFailed = false,
}: ComradesPageProps) {
    const t = useTranslations('Comrades');
    const tProfile = useTranslations('Profile');
    return (
        <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
            <Link
                href={profilePath(username)}
                className="flex items-center gap-1.5 self-start text-sm underline-offset-4 hover:underline"
            >
                <ArrowLeftIcon aria-hidden className="size-4" />
                {t('backToProfile', { name })}
            </Link>
            <h1 className="font-heading text-3xl font-semibold tracking-tight break-words">
                {t('listTitle', { name })}
            </h1>
            {loadFailed ? (
                <p
                    role="alert"
                    className="rounded-lg border border-dashed p-4 text-sm"
                >
                    {tProfile('comradesFailed')}
                </p>
            ) : comrades === null ? (
                <p className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    <LockIcon aria-hidden className="size-4 shrink-0" />
                    {t('listPrivate', { name })}
                </p>
            ) : comrades.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    {t('listEmpty')}
                </p>
            ) : (
                <>
                    <p className="text-sm text-muted-foreground">
                        {tProfile('comradesCount', { count: comrades.length })}
                    </p>
                    <ComradeLinks comrades={comrades} />
                </>
            )}
        </section>
    );
}

/** Shown while the list loads. */
export function ComradesPageLoading() {
    return (
        <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-9 w-64" />
            <div className="grid gap-2 sm:grid-cols-2">
                {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                ))}
            </div>
        </section>
    );
}
