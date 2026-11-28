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
    /** `page` when opened from the word's page: the back link goes there. */
    returnTo?: 'page' | 'list';
    /** Editing only: the upload for this word's file, wired by its container. */
    upload?: ReactNode;
    /** Editing only: "Remove this word", wired by its container. */
    remove?: ReactNode;
}

/**
 * /admin/definitions/new and /admin/definitions/{slug}: one word's form. When
 * editing, also replacing its text from a file and removing it.
 */
export function AdminDefinitionEditPage({
    mode,
    word,
    slug,
    form,
    returnTo = 'list',
    upload,
    remove,
}: AdminDefinitionEditPageProps) {
    const t = useTranslations('AdminDefinitions');
    const backToPage = returnTo === 'page' && mode === 'edit' && !!slug;
    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
            <header className="flex flex-col gap-3">
                <Link
                    href={
                        backToPage
                            ? `/dictionary/${slug}`
                            : '/admin/definitions'
                    }
                    className="inline-flex w-fit items-center gap-1 text-sm break-words underline underline-offset-4"
                >
                    <ArrowLeftIcon aria-hidden className="size-4" />
                    {backToPage
                        ? t('backToWord', { word: word ?? slug })
                        : t('backToList')}
                </Link>
                <h1 className="font-heading text-3xl font-semibold tracking-tight break-words">
                    {mode === 'create'
                        ? t('addTitle')
                        : t('editTitle', { word: word ?? '' })}
                </h1>
                <p className="text-pretty text-muted-foreground">
                    {t('formIntro')}
                </p>
                {mode === 'edit' && slug && !backToPage && (
                    <Link
                        href={`/dictionary/${slug}`}
                        className="w-fit text-sm underline underline-offset-4"
                    >
                        {t('viewWord', { word: word ?? slug })}
                    </Link>
                )}
            </header>
            {upload && (
                <section
                    aria-labelledby="replace-from-file"
                    className="flex flex-col gap-3 rounded-lg border p-5"
                >
                    <h2
                        id="replace-from-file"
                        className="font-heading text-lg font-semibold"
                    >
                        {t('replace.title')}
                    </h2>
                    <p className="text-sm text-pretty text-muted-foreground">
                        {t('replace.intro', { word: word ?? slug ?? '' })}
                    </p>
                    {upload}
                </section>
            )}
            {upload && (
                // So the form isn't read as part of the section above it.
                <h2 className="-mb-4 font-heading text-lg font-semibold">
                    {t('replace.formTitle')}
                </h2>
            )}
            {form}
            {remove}
        </section>
    );
}
