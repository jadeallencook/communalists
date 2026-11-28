'use client';

import { useTranslations } from 'next-intl';

import { NotFoundPage } from '@/components/pages/not-found-page';
import { usePathname } from '@/i18n/navigation';
import { findPath } from '@/lib/paths';

// The general 404: an address no route matches, or a page that called
// notFound() without its own not-found file. Pages people share (words,
// organizations, people) have their own, beside them (decision #69).

export default function NotFound() {
    const t = useTranslations('NotFound.general');
    const pathname = usePathname();
    return (
        <NotFoundPage
            title={t('title')}
            description={t('body')}
            address={pathname}
            actions={[
                { href: '/', label: t('home') },
                {
                    href: findPath('organizations'),
                    label: t('organizations'),
                },
                { href: '/dictionary', label: t('dictionary') },
            ]}
        />
    );
}
