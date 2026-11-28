import { ArrowLeftIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Skeleton } from '@/components/atoms/skeleton';
import { Link } from '@/i18n/navigation';
import { localeNames, type Locale } from '@/i18n/routing';
import type { DefinitionResource, ResourceType } from '@/lib/definitions';

export interface DefinitionPageProps {
    slug: string;
    word: string;
    definition: string;
    /** The longer explanation, as paragraphs (may be empty). */
    details: string[];
    /** The language the text is in. */
    lang: Locale;
    /** The UI language; when it differs from `lang`, the page says so. */
    locale: Locale;
    /** The letter the word is listed under (`m`), for the link back to that list. */
    letter: string;
    related: { slug: string; word: string; lang: string }[];
    /** Known types only (books, videos, articles, links). */
    resources: DefinitionResource[];
    /** The copy-link button, wired by its container. */
    share?: ReactNode;
    /** Super users only: the edit link (`DefinitionEditBar`), streamed in by its container. */
    edit?: ReactNode;
}

const RESOURCE_ORDER: ResourceType[] = ['book', 'video', 'article', 'link'];

/** /dictionary/{slug}: one word, in plain language, with a link to share. */
export function DefinitionPage({
    word,
    definition,
    details,
    lang,
    locale,
    letter,
    related,
    resources,
    share,
    edit,
}: DefinitionPageProps) {
    const t = useTranslations('Dictionary');
    const sorted = [...resources].sort(
        (a, b) =>
            RESOURCE_ORDER.indexOf(a.type) - RESOURCE_ORDER.indexOf(b.type)
    );
    return (
        <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
            {edit}
            <header className="flex flex-col gap-3">
                <Link
                    href={`/dictionary/${letter}`}
                    className="inline-flex w-fit items-center gap-1 text-sm underline underline-offset-4"
                >
                    <ArrowLeftIcon aria-hidden className="size-4" />
                    {t('back', { letter: letter.toUpperCase() })}
                </Link>
                <p className="text-sm font-medium text-muted-foreground">
                    {t('eyebrow')}
                </p>
                <h1
                    lang={lang}
                    className="font-heading text-4xl font-semibold tracking-tight break-words"
                >
                    {word}
                </h1>
                {lang !== locale && (
                    <p className="rounded-lg bg-muted p-3 text-sm">
                        {t('notTranslated', {
                            language: localeNames[locale],
                            shown: localeNames[lang],
                        })}
                    </p>
                )}
                <p lang={lang} className="text-xl text-pretty">
                    {definition}
                </p>
            </header>

            {details.length > 0 && (
                <div lang={lang} className="flex flex-col gap-4 text-pretty">
                    {details.map((paragraph, i) => (
                        <p key={i} className="whitespace-pre-line">
                            {paragraph}
                        </p>
                    ))}
                </div>
            )}

            {share}

            {related.length > 0 && (
                <section
                    aria-labelledby="definition-related"
                    className="flex flex-col gap-2"
                >
                    <h2
                        id="definition-related"
                        className="font-heading text-xl font-semibold"
                    >
                        {t('related')}
                    </h2>
                    <ul className="flex flex-wrap gap-x-4 gap-y-2">
                        {related.map((item) => (
                            <li key={item.slug} lang={item.lang}>
                                <Link
                                    href={`/dictionary/${item.slug}`}
                                    className="underline underline-offset-4"
                                >
                                    {item.word}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {sorted.length > 0 && (
                <section
                    aria-labelledby="definition-resources"
                    className="flex flex-col gap-2"
                >
                    <h2
                        id="definition-resources"
                        className="font-heading text-xl font-semibold"
                    >
                        {t('resources')}
                    </h2>
                    <ul className="flex flex-col gap-2">
                        {sorted.map((resource) => (
                            <li key={resource.id} lang={resource.language}>
                                <span className="text-sm text-muted-foreground">
                                    {t(`resourceTypes.${resource.type}`)}:{' '}
                                </span>
                                <a
                                    href={resource.url}
                                    rel="noopener noreferrer"
                                    className="break-words underline underline-offset-4"
                                >
                                    {resource.title}
                                </a>
                                {resource.by && (
                                    <span className="text-sm text-muted-foreground">
                                        {' '}
                                        {t('by', { name: resource.by })}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </article>
    );
}

/** Shown while the word loads. */
export function DefinitionPageLoading() {
    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
        </section>
    );
}
