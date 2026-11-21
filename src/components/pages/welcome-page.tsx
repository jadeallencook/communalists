import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';

export interface WelcomePageProps {
    name: string;
    /** General area from the profile, e.g. "San Jose, California, United States". */
    areaLabel?: string;
    locale: string;
    /** In the app, the signOut server action. */
    signOutAction: (formData: FormData) => void | Promise<void>;
}

/** Shown right after sign-up: greeting, the user's area, what's coming, sign out. */
export function WelcomePage({
    name,
    areaLabel,
    locale,
    signOutAction,
}: WelcomePageProps) {
    const t = useTranslations('Welcome');

    return (
        <section className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-16">
            <header className="flex flex-col gap-2">
                <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                    {t('greeting', { name })}
                </h1>
                <p className="text-lg text-muted-foreground">{t('intro')}</p>
                {areaLabel && (
                    <p className="text-sm text-muted-foreground">
                        {t('area', { location: areaLabel })}
                    </p>
                )}
            </header>

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

            <form action={signOutAction}>
                <input type="hidden" name="locale" value={locale} />
                <Button type="submit" variant="outline">
                    {t('signOut')}
                </Button>
            </form>
        </section>
    );
}

/** Placeholder while the session loads. */
export function WelcomePageLoading() {
    const t = useTranslations('Welcome');
    return (
        <section className="mx-auto w-full max-w-2xl px-4 py-16">
            <p className="text-muted-foreground">{t('loading')}</p>
        </section>
    );
}
