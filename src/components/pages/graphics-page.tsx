import { LockIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

/** /graphics: "Make some propaganda". The editor and preview come in as slots. */
export function GraphicsPage({
    editor,
    preview,
}: {
    editor: ReactNode;
    preview: ReactNode;
}) {
    const t = useTranslations('Graphics');
    return (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12">
            <header className="flex max-w-2xl flex-col gap-3">
                <h1 className="font-heading text-4xl font-semibold tracking-tight">
                    {t('title')}
                </h1>
                <p className="text-lg">{t('intro')}</p>
                <p className="flex items-start gap-2 text-sm">
                    <LockIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
                    {t('privacy')}
                </p>
            </header>
            {/* The preview comes first (above on phones, on the left on wide
                screens), so what you see and the reading order match. */}
            <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-10">
                <div className="min-w-0 lg:sticky lg:top-20 lg:self-start">
                    {preview}
                </div>
                <div className="min-w-0">{editor}</div>
            </div>
        </section>
    );
}
