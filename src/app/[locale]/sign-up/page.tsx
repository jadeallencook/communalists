import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { SignUpPage } from '@/components/pages/sign-up-page';

import { SignUpFormContainer } from './sign-up-form-container';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('SignUp');
    return { title: t('metaTitle') };
}

export default function Page() {
    return <SignUpPage form={<SignUpFormContainer />} />;
}
