import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

export interface WordSuggestionsProps {
    /** Close matches; nothing renders while loading, on error, or with none. */
    words: { slug: string; word: string; lang: string }[];
}

/** "Did you mean": dictionary words close to an address that isn't one. */
export function WordSuggestions({ words }: WordSuggestionsProps) {
    const t = useTranslations('NotFound.word');
    if (words.length === 0) return null;
    return (
        <section
            aria-labelledby="word-suggestions"
            className="flex flex-col gap-2"
        >
            <h2 id="word-suggestions" className="font-heading font-semibold">
                {t('suggestions')}
            </h2>
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
                {words.map((word) => (
                    <li key={word.slug} lang={word.lang}>
                        <Link
                            href={`/dictionary/${word.slug}`}
                            className="underline underline-offset-4"
                        >
                            {word.word}
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
