import { ExternalLinkIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Button } from '@/components/atoms/button';
import { Skeleton } from '@/components/atoms/skeleton';
import { Link } from '@/i18n/navigation';

export interface ProfileSettingsPageProps {
    /** Their username, for the link to their page. */
    username: string;
    /** The app passes a container wired to the action. */
    form: ReactNode;
    preview: ReactNode;
}

/** /account/profile: what you share and with whom, beside a live "Preview as…". */
export function ProfileSettingsPage({
    username,
    form,
    preview,
}: ProfileSettingsPageProps) {
    const t = useTranslations('Profile');
    return (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12">
            <header className="flex flex-col gap-3">
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                    {t('settingsTitle')}
                </h1>
                <p className="max-w-2xl text-muted-foreground">
                    {t('settingsIntro')}
                </p>
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="self-start"
                >
                    <Link href={`/comrade/${username}`}>
                        <ExternalLinkIcon aria-hidden />
                        {t('viewProfile')}
                    </Link>
                </Button>
            </header>
            <div className="grid gap-10 lg:grid-cols-[1fr_24rem]">
                <div className="min-w-0">{form}</div>
                <aside className="lg:sticky lg:top-20 lg:self-start">
                    {preview}
                </aside>
            </div>
        </section>
    );
}

/** Shown while the account loads. */
export function ProfileSettingsPageLoading() {
    return (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12">
            <div className="flex flex-col gap-3">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-full max-w-xl" />
            </div>
            <div className="grid gap-10 lg:grid-cols-[1fr_24rem]">
                <div className="flex flex-col gap-4">
                    {[0, 1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
                <Skeleton className="h-72 w-full" />
            </div>
        </section>
    );
}
