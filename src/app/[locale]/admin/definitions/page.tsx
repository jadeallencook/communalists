import type { Metadata } from 'next';
import { getFormatter, getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import {
    AdminDefinitionsPage,
    AdminDefinitionsPageLoading,
} from '@/components/pages/admin-definitions-page';
import { requirePlatformAdmin } from '@/lib/auth/platform-admin';
import { localize, slugProblem, sortByWord } from '@/lib/definitions';
import { getDefinitions } from '@/lib/definitions/store';

type Props = PageProps<'/[locale]/admin/definitions'>;

/** `?imported=3` after a CSV import; anything else shows nothing. */
const importedCount = (value: string | string[] | undefined) =>
    typeof value === 'string' && /^\d{1,3}$/.test(value)
        ? Number(value)
        : undefined;

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('AdminDefinitions');
    return { title: t('metaTitle'), robots: { index: false, follow: false } };
}

// Super users only; everyone else gets the not-found page (features/19).
export default function Page({ searchParams }: Props) {
    return (
        <Suspense fallback={<AdminDefinitionsPageLoading />}>
            <AdminDefinitionsContainer searchParams={searchParams} />
        </Suspense>
    );
}

async function AdminDefinitionsContainer({
    searchParams,
}: Pick<Props, 'searchParams'>) {
    await requirePlatformAdmin('/admin/definitions');
    const [definitions, locale, format, params] = await Promise.all([
        getDefinitions(),
        getLocale(),
        getFormatter(),
        searchParams,
    ]);
    const words = sortByWord(
        definitions.map((definition) => ({
            ...localize(definition, locale),
            updatedOn: definition.updatedAt
                ? format.dateTime(new Date(definition.updatedAt), {
                      dateStyle: 'medium',
                  })
                : undefined,
        })),
        locale
    );
    const savedSlug = typeof params.saved === 'string' ? params.saved : '';
    const saved = slugProblem(savedSlug)
        ? undefined
        : words.find((w) => w.slug === savedSlug);
    return (
        <AdminDefinitionsPage
            words={words.map((w) => ({
                slug: w.slug,
                word: w.word,
                definition: w.definition,
                lang: w.lang,
                updatedOn: w.updatedOn,
            }))}
            saved={saved ? { slug: saved.slug, word: saved.word } : undefined}
            imported={importedCount(params.imported)}
        />
    );
}
