'use client';

import { useTranslations } from 'next-intl';

import { NotFoundPage } from '@/components/pages/not-found-page';
import { usePathname } from '@/i18n/navigation';
import { addressSegment, findPath, NEW_ORGANIZATION_PATH } from '@/lib/paths';

// /organization/{handle} with no organization: handles can change (the old
// one stops working after 30 days, with no redirect) and organizations can
// be taken down, so it says that and points to finding them (decision #69).
// Its pages (edit, members, claim) land here too.

export default function OrganizationNotFound() {
    const t = useTranslations('NotFound.organization');
    const handle = addressSegment(usePathname(), 1);
    return (
        <NotFoundPage
            title={t('title', { handle })}
            description={t('body')}
            actions={[
                { href: findPath('organizations'), label: t('find') },
                { href: NEW_ORGANIZATION_PATH, label: t('create') },
            ]}
        />
    );
}
