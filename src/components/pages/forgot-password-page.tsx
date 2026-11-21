import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { AuthCard } from '@/components/organisms/auth-card';

export interface ForgotPasswordPageProps {
    /** The form. The app passes a container wired to the server action; Storybook passes <ForgotPasswordForm> with mock state. */
    form: ReactNode;
}

/** Forgot-password page: the form in an AuthCard, with a link back to sign in. */
export function ForgotPasswordPage({ form }: ForgotPasswordPageProps) {
    const t = useTranslations('ForgotPassword');

    return (
        <AuthCard
            title={t('title')}
            description={t('description')}
            footer={{
                prompt: t('remembered'),
                label: t('signIn'),
                href: '/sign-in',
            }}
        >
            {form}
        </AuthCard>
    );
}
