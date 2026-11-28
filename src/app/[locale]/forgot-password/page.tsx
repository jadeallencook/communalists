import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { ForgotPasswordPage } from '@/components/pages/forgot-password-page';

import { ForgotPasswordFormContainer } from './forgot-password-form-container';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('ForgotPassword');
    return { title: t('metaTitle'), robots: { index: false } };
}

export default function Page() {
    return <ForgotPasswordPage form={<ForgotPasswordFormContainer />} />;
}
