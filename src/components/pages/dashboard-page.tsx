import { UsersIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface DashboardPageProps {
    name: string;
    /** The profile's city, e.g. "San Jose, California". */
    areaLabel?: string;
}

/**
 * The signed-in home. For now: a greeting, the user's area, and an empty
 * "your organizations" state. Organizations and their tools (services) will
 * be listed here, and in the header next to Dashboard.
 */
export function DashboardPage({ name, areaLabel }: DashboardPageProps) {
    const t = useTranslations('Dashboard');

    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-12">
            <header className="flex flex-col gap-2">
                <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                    {t('greeting', { name })}
                </h1>
                {areaLabel && (
                    <p className="text-muted-foreground">
                        {t('area', { location: areaLabel })}
                    </p>
                )}
            </header>

            <div className="flex flex-col gap-3">
                <h2 className="font-heading text-xl font-semibold">
                    {t('organizationsTitle')}
                </h2>
                <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed p-6">
                    <UsersIcon
                        aria-hidden
                        className="size-5 text-muted-foreground"
                    />
                    <p className="font-medium">{t('emptyTitle')}</p>
                    <p className="text-sm text-muted-foreground">
                        {t('emptyBody')}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="font-heading text-xl font-semibold">
                    {t('nextTitle')}
                </h2>
                <ul className="flex flex-col gap-2">
                    {[t('nextBrowse'), t('nextCreate')].map((item) => (
                        <li
                            key={item}
                            className="flex items-center justify-between gap-4 rounded-lg border p-4"
                        >
                            <span>{item}</span>
                            <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                                {t('comingSoon')}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

/** Placeholder while the account loads. */
export function DashboardPageLoading() {
    const t = useTranslations('Dashboard');
    return (
        <section className="mx-auto w-full max-w-3xl px-4 py-12">
            <p role="status" className="text-muted-foreground">
                {t('loading')}
            </p>
        </section>
    );
}
