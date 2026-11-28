import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { SignInPage } from '@/components/pages/sign-in-page';
import { safeNextPath } from '@/lib/account-setup';
import { routing } from '@/i18n/routing';

import { pageMetadata } from '../page-metadata';
import { SignInFormContainer } from './sign-in-form-container';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('SignIn');
    return pageMetadata({
        path: '/sign-in',
        title: t('metaTitle'),
        description: t('metaDescription'),
    });
}

type Props = PageProps<'/[locale]/sign-in'>;

// `?next=` (a path on this site) is where to go afterward, like back to a
// discussion. Reading it streams the form in; the card shows meanwhile.
export default function Page({ searchParams }: Props) {
    return (
        <Suspense fallback={<SignInPage form={null} />}>
            <WithNext searchParams={searchParams} />
        </Suspense>
    );
}

async function WithNext({ searchParams }: Pick<Props, 'searchParams'>) {
    const next =
        safeNextPath((await searchParams).next, routing.locales, '') ||
        undefined;
    return (
        <SignInPage next={next} form={<SignInFormContainer next={next} />} />
    );
}
