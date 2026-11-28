import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { DefinitionEditBar } from '@/components/molecules/definition-edit-bar';
import { DiscussionListLoading } from '@/components/organisms/discussion';
import { DefinitionPage } from '@/components/pages/definition-page';
import {
    DictionaryPage,
    DictionaryPageLoading,
} from '@/components/pages/dictionary-page';
import { isPlatformAdmin } from '@/lib/auth/platform-admin';
import { getSessionUser } from '@/lib/auth/session';
import {
    isLetter,
    LETTERS,
    letterOf,
    localize,
    neighborLetters,
    slugProblem,
    sortByWord,
} from '@/lib/definitions';
import {
    getDefinition,
    getDefinitionFresh,
    getDefinitions,
} from '@/lib/definitions/store';
import { keywordList, snippet } from '@/lib/seo';
import { getSiteUrl } from '@/lib/site';
import { redirect } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

import { JsonLd } from '../../json-ld';
import { pageMetadata } from '../../page-metadata';
import { TrackEvent } from '../../track-event';
import { DiscussionContainer } from '../discussion-container';
import { ShareContainer } from '../share-container';

// /dictionary/{entry} is either a letter's list (/dictionary/m) or one word's
// page (/dictionary/mutual-aid). Letters are one character and slugs at least
// two, so they never clash. Both are public and crawlable (features/19).

type Props = PageProps<'/[locale]/dictionary/[entry]'>;

const entryOf = async (params: Props['params']) =>
    decodeURIComponent((await params).entry);

/** Cached lookup; a miss is confirmed fresh (it may have just been added on another instance). */
async function findDefinition(raw: string) {
    const slug = raw.toLowerCase();
    if (slugProblem(slug)) return { slug, definition: null };
    const definition =
        (await getDefinition(slug)) ?? (await getDefinitionFresh(slug));
    return { slug, definition };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const entry = (await entryOf(params)).toLowerCase();
    const locale = await getLocale();
    const t = await getTranslations('Dictionary');
    if (isLetter(entry)) {
        return pageMetadata({
            path: `/dictionary/${entry}`,
            title: t('letterTitle', { letter: entry.toUpperCase() }),
            description: t('intro'),
        });
    }
    // A missing word is confirmed with a fresh read; like the page, the
    // metadata is per request (otherwise Next flags the read while
    // prerendering).
    await connection();
    const { definition } = await findDefinition(entry);
    // Its not-found page says the rest (./not-found.tsx).
    if (!definition)
        return { title: (await getTranslations('NotFound.word'))('metaTitle') };
    const { slug, word, definition: meaning } = localize(definition, locale);
    return pageMetadata({
        path: `/dictionary/${slug}`,
        title: t('metaTitleWord', { word }),
        description: snippet(meaning),
        keywords: keywordList(t('metaKeywordsWord', { word })),
        type: 'article',
    });
}

export default function Page({ params, searchParams }: Props) {
    return (
        <Suspense fallback={<DictionaryPageLoading />}>
            <EntryContainer params={params} searchParams={searchParams} />
        </Suspense>
    );
}

async function EntryContainer({ params, searchParams }: Props) {
    // Render per request (from the cache), never at build time: the build
    // has no database credentials, and new words should show without a deploy.
    await connection();
    const raw = await entryOf(params);
    const locale = (await getLocale()) as Locale;
    const entry = raw.toLowerCase();
    // Shared links keep working when typed with capitals.
    if (raw !== entry && (isLetter(entry) || !slugProblem(entry)))
        return redirect({ href: `/dictionary/${entry}`, locale });
    return isLetter(entry) ? (
        <LetterContainer letter={entry} locale={locale} />
    ) : (
        <WordContainer
            slug={entry}
            locale={locale}
            saved={(await searchParams).saved === '1'}
        />
    );
}

/** One letter's words, with the A–Z bar. */
async function LetterContainer({
    letter,
    locale,
}: {
    letter: string;
    locale: Locale;
}) {
    const words = (await getDefinitions()).map((d) => {
        const { slug, word, definition, lang } = localize(d, locale);
        return {
            slug,
            word,
            definition,
            lang,
            letter: letterOf(word, locale, slug),
        };
    });
    const counts = new Map<string, number>();
    for (const w of words)
        counts.set(w.letter, (counts.get(w.letter) ?? 0) + 1);
    const letters = LETTERS.map((l) => ({
        letter: l,
        count: counts.get(l) ?? 0,
    }));
    return (
        <DictionaryPage
            letter={letter}
            letters={letters}
            {...neighborLetters(letters, letter)}
            words={sortByWord(
                words.filter((w) => w.letter === letter),
                locale
            ).map(({ slug, word, definition, lang }) => ({
                slug,
                word,
                definition,
                lang,
            }))}
        />
    );
}

/** One word's page. */
async function WordContainer({
    slug,
    locale,
    saved,
}: {
    slug: string;
    locale: Locale;
    /** `?saved=1`: back from the edit form (shown to super users only). */
    saved: boolean;
}) {
    const { definition } = await findDefinition(slug);
    if (!definition) notFound();

    const text = localize(definition, locale);
    const dictionaryName = (await getTranslations('Dictionary'))('setName');
    const all = definition.related.length ? await getDefinitions() : [];
    const related = definition.related.flatMap((other) => {
        const found = all.find((d) => d.slug === other);
        if (!found) return [];
        const { word, lang } = localize(found, locale);
        return [{ slug: other, word, lang }];
    });
    const site = getSiteUrl();
    const url = `${site}/${locale}/dictionary/${slug}`;

    return (
        <>
            <TrackEvent event="definition-view" data={{ slug }} />
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@type': 'DefinedTerm',
                    name: text.word,
                    description: text.definition,
                    url,
                    inLanguage: text.lang,
                    inDefinedTermSet: {
                        '@type': 'DefinedTermSet',
                        name: dictionaryName,
                        url: `${site}/${locale}/dictionary/a`,
                    },
                }}
            />
            <DefinitionPage
                slug={slug}
                word={text.word}
                definition={text.definition}
                details={text.details}
                lang={text.lang}
                locale={locale}
                letter={letterOf(text.word, locale, slug)}
                related={related}
                resources={definition.resources}
                share={<ShareContainer url={url} slug={slug} />}
                edit={
                    // Streams in on its own, so the word never waits on the session.
                    <Suspense>
                        <EditContainer
                            slug={slug}
                            word={text.word}
                            saved={saved}
                        />
                    </Suspense>
                }
                discussion={
                    // Reads the session too, so it streams in after the word.
                    <Suspense fallback={<DiscussionListLoading />}>
                        <DiscussionContainer slug={slug} locale={locale} />
                    </Suspense>
                }
            />
        </>
    );
}

/** Super users get a link to edit the word; everyone else, nothing. */
async function EditContainer({
    slug,
    word,
    saved,
}: {
    slug: string;
    word: string;
    saved: boolean;
}) {
    const user = await getSessionUser();
    if (!isPlatformAdmin(user?.uid)) return null;
    return <DefinitionEditBar slug={slug} word={word} saved={saved} />;
}
