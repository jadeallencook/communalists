import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { AdminDefinitionsPageLoading } from '@/components/pages/admin-definitions-page';
import { requirePlatformAdmin } from '@/lib/auth/platform-admin';
import { definitionsTemplateCsv } from '@/lib/definitions/import';

import { DefinitionsImportContainer } from './import-container';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('AdminDefinitions.import');
    return { title: t('title'), robots: { index: false, follow: false } };
}

// Super users only; everyone else gets the not-found page (features/19).
export default function Page() {
    return (
        <Suspense fallback={<AdminDefinitionsPageLoading />}>
            <ImportServerContainer />
        </Suspense>
    );
}

async function ImportServerContainer() {
    await requirePlatformAdmin('/admin/definitions/import');
    const templateHref = `data:text/csv;charset=utf-8,${encodeURIComponent(
        definitionsTemplateCsv()
    )}`;
    return <DefinitionsImportContainer templateHref={templateHref} />;
}
