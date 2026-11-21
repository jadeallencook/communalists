import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { SignInPage } from '@/components/pages/sign-in-page';

import { SignInFormContainer } from './sign-in-form-container';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('SignIn');
    return { title: t('metaTitle') };
}

export default function Page() {
    return <SignInPage form={<SignInFormContainer />} />;
}
