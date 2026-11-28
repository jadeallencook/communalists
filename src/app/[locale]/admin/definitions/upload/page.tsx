import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { AdminDefinitionsPageLoading } from '@/components/pages/admin-definitions-page';
import { requirePlatformAdmin } from '@/lib/auth/platform-admin';

import { DefinitionUploadContainer } from './upload-container';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('AdminDefinitions.upload');
    return { title: t('title'), robots: { index: false, follow: false } };
}

// Super users only; everyone else gets the not-found page (features/19).
export default function Page() {
    return (
        <Suspense fallback={<AdminDefinitionsPageLoading />}>
            <UploadServerContainer />
        </Suspense>
    );
}

async function UploadServerContainer() {
    await requirePlatformAdmin('/admin/definitions/upload');
    return <DefinitionUploadContainer />;
}
