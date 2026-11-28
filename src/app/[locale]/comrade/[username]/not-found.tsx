'use client';

import { useTranslations } from 'next-intl';

import { NotFoundPage } from '@/components/pages/not-found-page';
import { usePathname } from '@/i18n/navigation';
import { addressSegment, findPath } from '@/lib/paths';

// /comrade/{username} with nobody there. Usernames can change (no redirect),
// so it says that. It never hints whether the username was ever used
// (decision #69).

export default function PersonNotFound() {
    const t = useTranslations('NotFound.person');
    const username = addressSegment(usePathname(), 1);
    return (
        <NotFoundPage
            title={t('title', { username })}
            description={t('body')}
            actions={[{ href: findPath('organizations'), label: t('find') }]}
        />
    );
}
