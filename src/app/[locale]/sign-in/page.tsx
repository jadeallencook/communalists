import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { SignInPage } from '@/components/pages/sign-in-page';

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

export default function Page() {
    return <SignInPage form={<SignInFormContainer />} />;
}
