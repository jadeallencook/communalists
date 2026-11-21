import { getTranslations } from 'next-intl/server';

export async function SiteFooter() {
    const t = await getTranslations('Footer');

    return (
        <footer className="border-t">
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <p>
                    {t('developedBy')} · {t('region')} · {t('established')}
                </p>
                <a
                    href="https://github.com/techletariats/communalists"
                    target="_blank"
                    rel="noreferrer"
                    className="underline-offset-4 hover:text-foreground hover:underline"
                >
                    {t('openSource')}
                </a>
            </div>
        </footer>
    );
}
