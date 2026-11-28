import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { AdminDefinitionEditPage } from '@/components/pages/admin-definition-edit-page';
import { AdminDefinitionsPageLoading } from '@/components/pages/admin-definitions-page';
import { requirePlatformAdmin } from '@/lib/auth/platform-admin';
import { localize, slugProblem, sortByWord } from '@/lib/definitions';
import { getDefinitionFresh, getDefinitions } from '@/lib/definitions/store';

import { DefinitionFormContainer } from '../definition-form-container';
import { DefinitionRemoveContainer } from '../remove-container';
import { WordUploadContainer } from '../upload/upload-container';

type Props = PageProps<'/[locale]/admin/definitions/[slug]'>;

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('AdminDefinitions');
    return { title: t('metaTitle'), robots: { index: false, follow: false } };
}

export default function Page({ params, searchParams }: Props) {
    return (
        <Suspense fallback={<AdminDefinitionsPageLoading />}>
            <EditDefinitionContainer
                params={params}
                searchParams={searchParams}
            />
        </Suspense>
    );
}

async function EditDefinitionContainer({ params, searchParams }: Props) {
    const slug = decodeURIComponent((await params).slug);
    // `?from=page`: opened from the word's page, so go back there after saving.
    const returnTo = (await searchParams).from === 'page' ? 'page' : 'list';
    await requirePlatformAdmin(`/admin/definitions/${slug}`);
    if (slugProblem(slug)) notFound();
    // Fresh: the form must start from what's saved now, not a cached copy.
    const [definition, all, locale] = await Promise.all([
        getDefinitionFresh(slug),
        getDefinitions(),
        getLocale(),
    ]);
    if (!definition) notFound();
    const relatedOptions = sortByWord(
        all.filter((d) => d.slug !== slug).map((d) => localize(d, locale)),
        locale
    ).map(({ slug, word }) => ({ slug, word }));
    const word = localize(definition, locale).word;
    return (
        <AdminDefinitionEditPage
            mode="edit"
            slug={slug}
            word={word}
            returnTo={returnTo}
            upload={<WordUploadContainer slug={slug} />}
            remove={<DefinitionRemoveContainer slug={slug} word={word} />}
            form={
                <DefinitionFormContainer
                    mode="edit"
                    initial={{
                        slug,
                        text: definition.text,
                        related: definition.related,
                    }}
                    relatedOptions={relatedOptions}
                    returnTo={returnTo}
                />
            }
        />
    );
}
