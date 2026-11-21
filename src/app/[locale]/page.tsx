import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
    const t = await getTranslations('Home');

    return (
        <section className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-24">
            <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
                {t('title')}
            </h1>
            <p className="text-lg text-muted-foreground">{t('tagline')}</p>
        </section>
    );
}
