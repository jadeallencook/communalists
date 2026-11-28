'use client';

import { useLocale, useTranslations } from 'next-intl';

import { WordSuggestions } from '@/components/molecules/word-suggestions';
import { NotFoundPage } from '@/components/pages/not-found-page';
import { useWordSuggestions } from '@/hooks/use-word-suggestions';
import { usePathname } from '@/i18n/navigation';
import { addressSegment } from '@/lib/paths';

// /dictionary/{something that isn't a word}: says so, suggests close words
// ("Did you mean"), and links to the dictionary (decision #69).

export default function WordNotFound() {
    const t = useTranslations('NotFound.word');
    const locale = useLocale();
    const pathname = usePathname();
    const address = addressSegment(pathname, 1);
    const suggestions = useWordSuggestions(address, locale);
    return (
        <NotFoundPage
            title={t('title', { word: address })}
            description={t('body')}
            actions={[{ href: '/dictionary', label: t('browse') }]}
        >
            <WordSuggestions words={suggestions} />
        </NotFoundPage>
    );
}
