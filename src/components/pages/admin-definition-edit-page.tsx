import { ArrowLeftIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Link } from '@/i18n/navigation';

export interface AdminDefinitionEditPageProps {
    mode: 'create' | 'edit';
    /** The word being edited, in the UI language. */
    word?: string;
    slug?: string;
    /** The DefinitionForm, wired by its container. */
    form: ReactNode;
}

/** /admin/definitions/new and /admin/definitions/{slug}: one word's form. */
export function AdminDefinitionEditPage({
    mode,
    word,
    slug,
    form,
}: AdminDefinitionEditPageProps) {
    const t = useTranslations('AdminDefinitions');
    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
            <header className="flex flex-col gap-3">
                <Link
                    href="/admin/definitions"
                    className="inline-flex w-fit items-center gap-1 text-sm underline underline-offset-4"
                >
                    <ArrowLeftIcon aria-hidden className="size-4" />
                    {t('backToList')}
                </Link>
                <h1 className="font-heading text-3xl font-semibold tracking-tight break-words">
                    {mode === 'create'
                        ? t('addTitle')
                        : t('editTitle', { word: word ?? '' })}
                </h1>
                <p className="text-pretty text-muted-foreground">
                    {t('formIntro')}
                </p>
                {mode === 'edit' && slug && (
                    <Link
                        href={`/dictionary/${slug}`}
                        className="w-fit text-sm underline underline-offset-4"
                    >
                        {t('viewWord', { word: word ?? slug })}
                    </Link>
                )}
            </header>
            {form}
        </section>
    );
}
