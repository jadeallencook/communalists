'use client';

import { ArrowLeftIcon, PlusIcon, UploadIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/atoms/button';
import { Skeleton } from '@/components/atoms/skeleton';
import { Link } from '@/i18n/navigation';

export interface AdminDefinitionItem {
    slug: string;
    /** In the UI language (English when it isn't written yet). */
    word: string;
    definition: string;
    /** The language `word` and `definition` are in. */
    lang: string;
    /** Already formatted. */
    updatedOn?: string;
}

export interface AdminDefinitionsPageProps {
    words: AdminDefinitionItem[];
    /** The word just added or edited: announced, with focus moved to it. */
    saved?: { slug: string; word: string };
    /** How many words a CSV import just added: announced, with focus moved to it. */
    imported?: number;
    /** The address of a word just removed: announced, with focus moved to it. */
    removed?: string;
}

/** /admin/definitions, for super users: every dictionary word, to add or edit. */
export function AdminDefinitionsPage({
    words,
    saved,
    imported,
    removed,
}: AdminDefinitionsPageProps) {
    const t = useTranslations('AdminDefinitions');
    const savedRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (saved || imported !== undefined || removed)
            savedRef.current?.focus();
    }, [saved, imported, removed]);

    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
            <header className="flex flex-col gap-3">
                <Link
                    href="/admin"
                    className="inline-flex w-fit items-center gap-1 text-sm underline underline-offset-4"
                >
                    <ArrowLeftIcon aria-hidden className="size-4" />
                    {t('backToAdmin')}
                </Link>
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                    {t('title')}
                </h1>
                <p className="text-pretty text-muted-foreground">
                    {t('intro')}
                </p>
                <div className="flex flex-wrap gap-2">
                    <Button asChild>
                        <Link href="/admin/definitions/new">
                            <PlusIcon aria-hidden />
                            {t('add')}
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/definitions/import">
                            <UploadIcon aria-hidden />
                            {t('importCsv')}
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/dictionary">{t('viewDictionary')}</Link>
                    </Button>
                </div>
            </header>

            <div ref={savedRef} tabIndex={-1} className="outline-none">
                {imported !== undefined && (
                    <p role="status" className="text-sm">
                        {t('imported', { count: imported })}
                    </p>
                )}
                {removed && (
                    <p role="status" className="text-sm">
                        {t('removed', { slug: removed })}
                    </p>
                )}
                {saved && (
                    <p role="status" className="text-sm">
                        {t('saved', { word: saved.word })}{' '}
                        <Link
                            href={`/dictionary/${saved.slug}`}
                            className="underline underline-offset-2"
                        >
                            {t('viewWord', { word: saved.word })}
                        </Link>
                    </p>
                )}
            </div>

            <section
                aria-labelledby="admin-definitions-list"
                className="flex flex-col gap-3"
            >
                <h2
                    id="admin-definitions-list"
                    className="font-heading text-xl font-semibold"
                >
                    {t('listTitle')}
                    <span className="ml-2 text-base font-normal text-muted-foreground">
                        {words.length}
                    </span>
                </h2>
                {words.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        {t('empty')}
                    </p>
                ) : (
                    <ul className="flex flex-col divide-y rounded-lg border">
                        {words.map((item) => (
                            <li
                                key={item.slug}
                                className="flex flex-col gap-2 p-3 md:flex-row md:items-start md:justify-between md:gap-4"
                            >
                                <div className="flex min-w-0 flex-col gap-0.5">
                                    <span
                                        lang={item.lang}
                                        className="font-medium break-words"
                                    >
                                        {item.word}
                                    </span>
                                    <span className="font-mono text-xs break-all text-muted-foreground">
                                        /dictionary/{item.slug}
                                    </span>
                                    <span
                                        lang={item.lang}
                                        className="line-clamp-2 text-sm text-muted-foreground"
                                    >
                                        {item.definition}
                                    </span>
                                    {item.updatedOn && (
                                        <span className="text-xs text-muted-foreground">
                                            {t('updatedOn', {
                                                date: item.updatedOn,
                                            })}
                                        </span>
                                    )}
                                </div>
                                <div className="flex shrink-0 flex-wrap gap-2">
                                    <Button asChild size="sm">
                                        <Link
                                            href={`/admin/definitions/${item.slug}`}
                                            aria-label={t('editWord', {
                                                word: item.word,
                                            })}
                                        >
                                            {t('edit')}
                                        </Link>
                                    </Button>
                                    <Button asChild size="sm" variant="outline">
                                        <Link
                                            href={`/dictionary/${item.slug}`}
                                            aria-label={t('viewWord', {
                                                word: item.word,
                                            })}
                                        >
                                            {t('view')}
                                        </Link>
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </section>
    );
}

/** Shown while the list loads. */
export function AdminDefinitionsPageLoading() {
    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-64 w-full rounded-lg" />
        </section>
    );
}
