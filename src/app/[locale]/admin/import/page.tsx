import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { AdminPageLoading } from '@/components/pages/admin-page';
import { requirePlatformAdmin } from '@/lib/auth/platform-admin';

import { AdminImportContainer } from './admin-import-container';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Admin.import');
    return { title: t('metaTitle'), robots: { index: false, follow: false } };
}

// Super users only; everyone else gets the not-found page (features/18).
export default function Page() {
    return (
        <Suspense fallback={<AdminPageLoading />}>
            <AdminImportServerContainer />
        </Suspense>
    );
}

async function AdminImportServerContainer() {
    await requirePlatformAdmin('/admin/import');
    return <AdminImportContainer />;
}
