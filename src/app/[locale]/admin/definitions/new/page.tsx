import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { AdminDefinitionEditPage } from '@/components/pages/admin-definition-edit-page';
import { AdminDefinitionsPageLoading } from '@/components/pages/admin-definitions-page';
import { requirePlatformAdmin } from '@/lib/auth/platform-admin';
import { localize, sortByWord } from '@/lib/definitions';
import { getDefinitions } from '@/lib/definitions/store';

import { DefinitionFormContainer } from '../definition-form-container';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('AdminDefinitions');
    return { title: t('addTitle'), robots: { index: false, follow: false } };
}

export default function Page() {
    return (
        <Suspense fallback={<AdminDefinitionsPageLoading />}>
            <NewDefinitionContainer />
        </Suspense>
    );
}

async function NewDefinitionContainer() {
    await requirePlatformAdmin('/admin/definitions/new');
    const [definitions, locale] = await Promise.all([
        getDefinitions(),
        getLocale(),
    ]);
    const relatedOptions = sortByWord(
        definitions.map((d) => localize(d, locale)),
        locale
    ).map(({ slug, word }) => ({ slug, word }));
    return (
        <AdminDefinitionEditPage
            mode="create"
            form={
                <DefinitionFormContainer
                    mode="create"
                    relatedOptions={relatedOptions}
                />
            }
        />
    );
}
