import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { SignUpPage } from '@/components/pages/sign-up-page';
import { safeNextPath } from '@/lib/account-setup';
import { routing } from '@/i18n/routing';

import { pageMetadata } from '../page-metadata';
import { SignUpFormContainer } from './sign-up-form-container';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('SignUp');
    return pageMetadata({
        path: '/sign-up',
        title: t('metaTitle'),
        description: t('metaDescription'),
    });
}

type Props = PageProps<'/[locale]/sign-up'>;

// `?next=` (a path on this site) is where to go afterward, like back to a
// discussion. Reading it streams the form in; the card shows meanwhile.
export default function Page({ searchParams }: Props) {
    return (
        <Suspense fallback={<SignUpPage form={null} />}>
            <WithNext searchParams={searchParams} />
        </Suspense>
    );
}

async function WithNext({ searchParams }: Pick<Props, 'searchParams'>) {
    const next =
        safeNextPath((await searchParams).next, routing.locales, '') ||
        undefined;
    return (
        <SignUpPage next={next} form={<SignUpFormContainer next={next} />} />
    );
}
