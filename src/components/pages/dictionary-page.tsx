import { useTranslations } from 'next-intl';

import { Skeleton } from '@/components/atoms/skeleton';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export interface DictionaryWord {
    slug: string;
    word: string;
    definition: string;
    /** The language the text is in (English when it isn't translated yet). */
    lang: string;
}

export interface DictionaryPageProps {
    /** The letter shown, lowercase (`m`). */
    letter: string;
    /** A to Z, with how many words each has. */
    letters: { letter: string; count: number }[];
    /** This letter's words, already sorted for the UI language. */
    words: DictionaryWord[];
}

/**
 * /dictionary/{letter}: an A–Z bar, then the words under one letter with
 * their short definitions. A letter with no words says so.
 */
export function DictionaryPage({
    letter,
    letters,
    words,
}: DictionaryPageProps) {
    const t = useTranslations('Dictionary');
    const shown = letter.toUpperCase();
    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
            <header className="flex flex-col gap-2">
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                    {t('title')}
                </h1>
                <p className="text-pretty text-muted-foreground">
                    {t('intro')}
                </p>
                <p className="text-sm text-pretty text-muted-foreground">
                    {t('lettersHint')}
                </p>
            </header>

            <nav aria-label={t('letters')}>
                <ul className="flex flex-wrap gap-1">
                    {letters.map((item) => {
                        const current = item.letter === letter;
                        return (
                            <li key={item.letter}>
                                <Link
                                    href={`/dictionary/${item.letter}`}
                                    aria-current={current ? 'page' : undefined}
                                    className={cn(
                                        'flex size-10 items-center justify-center rounded-md border border-control text-base font-medium underline-offset-4 hover:underline',
                                        current &&
                                            'border-foreground bg-foreground text-background hover:no-underline',
                                        !current &&
                                            item.count === 0 &&
                                            'border-dashed text-muted-foreground'
                                    )}
                                >
                                    {item.letter.toUpperCase()}
                                    {item.count === 0 && (
                                        <span className="sr-only">
                                            {' '}
                                            {t('noWordsShort')}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <section
                aria-labelledby="dictionary-letter"
                className="flex flex-col gap-3"
            >
                <h2
                    id="dictionary-letter"
                    className="font-heading text-2xl font-semibold"
                >
                    {shown}
                    <span className="ml-2 text-base font-normal text-muted-foreground">
                        {t('count', { count: words.length })}
                    </span>
                </h2>
                {words.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        {t('emptyLetter', { letter: shown })}
                    </p>
                ) : (
                    <ul className="flex flex-col divide-y rounded-lg border">
                        {words.map((item) => (
                            <li
                                key={item.slug}
                                lang={item.lang}
                                className="flex flex-col gap-1 p-4"
                            >
                                <Link
                                    href={`/dictionary/${item.slug}`}
                                    className="w-fit font-heading text-lg font-semibold break-words underline underline-offset-4"
                                >
                                    {item.word}
                                </Link>
                                <p className="text-pretty text-muted-foreground">
                                    {item.definition}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </section>
    );
}

/** Shown while the list loads. */
export function DictionaryPageLoading() {
    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-full max-w-md" />
            <Skeleton className="h-22 w-full rounded-lg" />
            <Skeleton className="h-80 w-full rounded-lg" />
        </section>
    );
}
